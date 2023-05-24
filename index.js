const express = require("express");
const path = require("path");
// this one allows us to fake put and patch requests
const methodOverride = require("method-override");

const ejsMate = require("ejs-mate");
const Joi = require("joi");
const ExpressError = require("./helpers/expresserror");
const tryCatchAsync = require("./helpers/trycatchasync")

// start mongoose
const mongoose = require("mongoose");
const Campground = require("./models/campground");
// hardcoded address for now, whilst i setup
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
    .then(() =>
    {
        console.log(`MongoDB Connection Open :)`);
    })
    .catch((err) =>
    {
        console.log("Oh no! MongoDB Connection Error :(");
        console.log(err);
    });
// end mongoose

const app = express();
const port = 3000;
// set view engine and views
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
// __dirname is the absolute file location
app.set("views", path.join(__dirname, "/views"));

// middleware
// morgan for logging
// const morgan = require("morgan");
// app.use(morgan("tiny"));
app.use((req, res, next) =>
{
    req.requestTime = Date.now();
    // remember, you could just use morgan
    // to do this for you!
    console.log("Custom Log by Boff: ");
    console.log(`HTTP Method: ${req.method}, Path: ${req.path}, Unix Time ms: ${req.requestTime}`);
    next();
})
// secret route protection through middleware
const verifyChicken = (req, res, next) =>
{
    const { password } = req.query;
    if (password === "chicken")
    {
        next();
    }
    else
    {
        throw new ExpressError(401, "Wrong Password! :(");
    }
};

const validateCampground = (req, res, next) =>
{
    const campgroundSchema = Joi.object({
        campground: Joi.object({
            title: Joi.string().required(),
            location: Joi.string().required(),
            image: Joi.string().required(),
            price: Joi.number().required().min(0),
            description: Joi.string().required()
        }).required()
    });
    const { error } = campgroundSchema.validate(req.body);
    if (error)
    {
        const msg = error.details.map(el => el.message).join(',');
        console.log("Campground validation failed");
        throw new ExpressError(400, msg);
    }
    else
    {
        console.log("Campground validated successfully");
        next();
    }
}

// setting extended to true lets you nest
// data in the request body, by using the
// qs library. it lets you do nesting, like so:
// campground[title] = 'tane'
// this parses to:
// object = { campground: { title: tane } }
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
// end middlewares

// start routes
// default route
app.get("/", (req, res) =>
{
    res.render("home");
});

// show index route
app.get("/campgrounds", tryCatchAsync(async (req, res, next) =>
{
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
}));

// show create form
app.get("/campgrounds/new", (req, res) =>
{
    res.render("campgrounds/new");
});

// actual create route - redirect to read page
app.post("/campgrounds", validateCampground, tryCatchAsync(async (req, res, next) =>
{
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}));

// show read route
app.get("/campgrounds/:id", tryCatchAsync(async (req, res, next) =>
{
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground)
    {
        throw new ExpressError(404, `No campground found with id:${id} can be viewed`);
    }
    res.render("campgrounds/show", { campground });
}));

// show edit route and form
app.get("/campgrounds/:id/edit", tryCatchAsync(async (req, res, next) =>
{
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground)
    {
        throw new ExpressError(404, `No campground found with id:${id} is available to edit`);
    }
    res.render("campgrounds/edit", { campground });
}));

// actual edit route, will change db entry
app.put("/campgrounds/:id", tryCatchAsync(async (req, res, next) =>
{
    if (!req.body.campground) throw new ExpressError(400, "No Campground sent in request body.");
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    if (!campground)
    {
        throw new ExpressError(404, `No campground found with id:${id} can be updated`);
    }
    res.redirect(`/campgrounds/${id}`);
}));

// show delete route
app.get("/campgrounds/:id/delete", tryCatchAsync(async (req, res, next) =>
{
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground)
    {
        throw new ExpressError(404, `No campground found with id:${id} can be deleted`);
    }
    res.render("campgrounds/delete", { campground });
}));

// actual delete route
app.delete("/campgrounds/:id", tryCatchAsync(async (req, res, next) =>
{
    const { id } = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    if (!campground)
    {
        throw new ExpressError(404, `No campground found with id:${id} exists to delete`);
    }
    res.render("campgrounds/deletesuccess", { campground });
}));

app.get("/chicken", verifyChicken, (req, res) =>
{
    res.send("Chicken chicken chicken! 🐔");
})

app.get("/admin", (req, res) =>
{
    throw new ExpressError(403, "You are not an admin!");
})

// fake error route to intentionally cause an error
app.get("/error", (req, res) =>
{
    throw new ExpressError(500, "Fake Internal Server Error");
});

// if none of your routes get matched,
// we can send the user to this final route
// this is the conventional 404 route
app.use((req, res, next) =>
{
    next(new ExpressError(404, "File not found. :("));
});

// error handling comes next

function handleValidationError(err)
{
    console.dir(err);
    return new ExpressError(400, `Validation Failed: ${err.message}`);
}

app.use((err, req, res, next) =>
{
    console.log(`Error detected, with name: ${err.name}`);
    if (err.name === "ValidationError")
    {
        err = handleValidationError(err);
    }
    next(err);
});

app.use((err, req, res, next) =>
{
    // the default value here is in case the error
    // sent is a regular JS error, and not an AppError
    if (!err.status) err.status = 500;
    if (!err.message) err.message = "Something went wrong.";
    res.status(err.status).render("error", { err });
});

app.listen(port, () =>
{
    console.log(`Serving on port ${port}`)
});

// campgrounds have:
// a name/title, a price, a description
// a location (just a string at this stage)
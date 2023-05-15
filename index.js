const express = require("express");
const path = require("path");
// this one allows us to fake put and patch requests
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const AppError = require("./apperror");

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
const morgan = require("morgan");
app.use(morgan("tiny"));
app.use((req, res, next) =>
{
    req.requestTime = Date.now();
    console.log("Custom Log: ", req.method, req.path, req.requestTime);
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
        throw new AppError(401, "Wrong Password! :(");
    }
};

// put and patch request handling
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
// end middlewares

// utility functions
function tryCatchAsync(fn)
{
    return function (req, res, next)
    {
        fn(req, res, next).catch((e) => next(e));
    }
}

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
app.post("/campgrounds", tryCatchAsync(async (req, res, next) =>
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
        throw new AppError(404, `No campground found with id:${id} can be viewed`);
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
        throw new AppError(404, `No campground found with id:${id} is available to edit`);
    }
    res.render("campgrounds/edit", { campground });
}));

// actual edit route, will change db entry
app.put("/campgrounds/:id", tryCatchAsync(async (req, res, next) =>
{
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    if (!campground)
    {
        throw new AppError(404, `No campground found with id:${id} can be updated`);
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
        throw new AppError(404, `No campground found with id:${id} can be deleted`);
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
        throw new AppError(404, `No campground found with id:${id} exists to delete`);
    }
    res.render("campgrounds/deletesuccess", { campground });
}));

app.get("/chicken", verifyChicken, (req, res) =>
{
    res.send("Chicken chicken chicken! 🐔");
})

app.get("/admin", (req, res) =>
{
    throw new AppError(403, "You are not an admin!");
})

// fake error route to intentionally cause an error
app.get("/error", (req, res) =>
{
    throw new AppError(500, "Fake Internal Server Error");
});

// if none of your routes get matched,
// we can send the user to this final route
// this is the conventional 404 route
app.use((req, res) =>
{
    throw new AppError(404, "File not found. :(");
});

// error handling comes next

function handleValidationError(err)
{
    console.dir(err);
    return new AppError(400, `Validation Failed: ${err.message}`);
}

app.use((err, req, res, next) =>
{
    console.log(err.name);
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
    const { status = 500, message = "Something went wrong." } = err;
    res.status(status).send(`${status}: ${message}`);
});

app.listen(port, () =>
{
    console.log(`Serving on port ${port}`)
});

// campgrounds have:
// a name/title, a price, a description
// a location (just a string at this stage)
// 
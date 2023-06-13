const express = require("express");
const path = require("path");
// this one allows us to fake put and patch requests
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");

const ExpressError = require("./helpers/expresserror");

const campgrounds = require("./routes/campgrounds");
const reviews = require("./routes/reviews");

// comment these in if resetting reviews
// const tryCatchAsync = require("./helpers/trycatchasync")
// const Campground = require("./models/campground");
// const Review = require("./models/review");

// start mongoose
const mongoose = require("mongoose");

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
app.set("views", path.join(__dirname, "views"));

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
    // if you get an error related to "path: /123213123, this is something to do with the external images being pulled in, and not this code. :("
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

// setting extended to true lets you nest
// data in the request body, by using the
// qs library. it lets you do nesting, like so:
// campground[title] = 'tane'
// this parses to:
// object = { campground: { title: tane } }
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")))
const sessionConfig =
{
    secret: "totallynotsecretatall",
    resave: false,
    saveUninitialized: true,
    cookie:
    {
        httpOnly: true,
        expires: Date.now() + (1000 * 60 * 60 * 24 * 7),
        maxAge: (1000 * 60 * 60 * 24 * 7)
    }
}
app.use(session(sessionConfig));
// end middlewares

// start routes

app.use("/campgrounds", campgrounds);
app.use("/campgrounds/:id/reviews", reviews)

// default route
app.get("/", (req, res) =>
{
    res.render("home");
});

// remember to comment in the review and campground models
// app.get("/resetreviews", tryCatchAsync(async (req, res) =>
// {
//     const allcamps = await Campground.find({});
//     for (let camp of allcamps)
//     {
//         camp.reviews = [];
//         await camp.save();
//         console.log(`"${camp.title}" reviews have been reset`);
//     }
//     await Review.deleteMany({});
//     res.send("All reviews deleted, campground reviews reset. Yayy!");
// }));

// fake routes for learning purposes

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

// lastly, serve the app

app.listen(port, () =>
{
    console.log(`Serving on port ${port}`)
});
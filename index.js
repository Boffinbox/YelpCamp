if (process.env.NODE_ENV !== "production")
{
    require("dotenv").config();
}

const express = require("express");
const path = require("path");
// this one allows us to fake put and patch requests
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const mongoSanitize = require("express-mongo-sanitize");

const ExpressError = require("./helpers/expresserror");

const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");
const userRoutes = require("./routes/users");

// comment these in if resetting reviews
// const tryCatchAsync = require("./helpers/trycatchasync")
// const Campground = require("./models/campground");
// const Review = require("./models/review");

const User = require("./models/user");

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
    console.log("Custom Log by Boff: " + `${req.method} "${req.path}" at ${req.requestTime} ms`);
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
app.use(mongoSanitize());

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
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => 
{
    console.log(req.query);
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user;
    next();
});

// end middlewares

// start routes

app.get("/fakeUser", async (req, res) =>
{
    const user = new User(
        {
            email: "boff@yelpcamp",
            username: "boffin"
        }
    )
    const newUser = await User.register(user, "test");
    res.send(newUser);
})

app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes)

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
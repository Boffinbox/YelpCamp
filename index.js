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
const helmet = require("helmet");
const mongoStore = require("connect-mongo");

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

// const dbUrl = process.env.DB_URL
// or use previous hardcoded address
const dbUrl = "mongodb://127.0.0.1:27017/yelp-camp"

mongoose.connect(dbUrl)
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

const store = mongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: process.env.MONGOSTORE_SECRET
    }
});

store.on("error", function (err)
{
    console.log("Session store error: ", err);
})

const sessionConfig =
{
    store,
    name: "9dyMEye6",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie:
    {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + (1000 * 60 * 60 * 24 * 7),
        maxAge: (1000 * 60 * 60 * 24 * 7)
    }
}
app.use(session(sessionConfig));
app.use(flash());

// big block of security stuff
// basically whitelisting external resources
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net"
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net"
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/"
];
const fontSrcUrls = [];

const csp = {
    directives: {
        defaultSrc: [],
        connectSrc: ["'self'", ...connectSrcUrls],
        scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
        styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
        workerSrc: ['self', "blob:"],
        objectSrc: [],
        imgSrc: [
            "'self'",
            "blob:",
            "data:",
            `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`
        ],
        fontSrc: ["'self'", ...fontSrcUrls],
        // remove this one in production?
        upgradeInsecureRequests: null
    },
}

app.use(helmet({ contentSecurityPolicy: csp }));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => 
{
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
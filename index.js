const express = require("express");
const path = require("path");
// this one allows us to fake put and patch requests
const methodOverride = require("method-override");

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

// put and patch request handling
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
app.get("/campgrounds", async (req, res) =>
{
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
});

// show create form
app.get("/campgrounds/new", async (req, res) =>
{
    res.render("campgrounds/new");
});

// actual create route - redirect to read page
app.post("/campgrounds", async (req, res) =>
{
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
});

// show read route
app.get("/campgrounds/:id", async (req, res) =>
{
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render("campgrounds/show", { campground });
});

// show edit route and form
app.get("/campgrounds/:id/edit", async (req, res) =>
{
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render("campgrounds/edit", { campground });
});

// actual edit route, will change db entry
app.put("/campgrounds/:id", async (req, res) =>
{
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    res.redirect(`/campgrounds/${id}`);

});

// show delete route
app.get("/campgrounds/:id/delete", async (req, res) =>
{
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render("campgrounds/delete", { campground });
});

// actual delete route
app.delete("/campgrounds/:id", async (req, res) =>
{
    const { id } = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    res.render("campgrounds/deletesuccess", { campground });
});

// if none of your routes get matched,
// we can send the user to this final route
// this is the conventional 404 route
app.use((req, res) =>
{
    res.status(404).send("404 Not Found :(");
});

app.listen(port, () =>
{
    console.log(`Serving on port ${port}`)
});

// campgrounds have:
// a name/title, a price, a description
// a location (just a string at this stage)
// 
const express = require("express");
const path = require("path");

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


app.set("view engine", "ejs");
// __dirname is the absolute file location
app.set("views", path.join(__dirname, "/views"));

// post handling
app.use(express.urlencoded({ extended: true }));

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
    const campground = await Campground.findById(req.params.id);
    res.render("campgrounds/show", { campground });
});




app.listen(port, () =>
{
    console.log(`Serving on port ${port}`)
});

// campgrounds have:
// a name/title, a price, a description
// a location (just a string at this stage)
// 
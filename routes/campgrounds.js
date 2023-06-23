const express = require("express");
const router = express.Router();

const ExpressError = require("../helpers/expresserror");
const tryCatchAsync = require("../helpers/trycatchasync")
const validateCampground = require("../helpers/validateCampground");
const isLoggedIn = require("../helpers/isLoggedIn");

const Campground = require("../models/campground");

// show index route
router.get("/", tryCatchAsync(async (req, res, next) =>
{
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
}));

// show create form
router.get("/new", isLoggedIn, (req, res) =>
{
    res.render("campgrounds/new");
});

// actual create route - redirect to read page
router.post("/", isLoggedIn, validateCampground, tryCatchAsync(async (req, res, next) =>
{
    const campground = new Campground(req.body.campground);
    campground.author = await req.user._id;
    await campground.save();
    req.flash("success", "Successfully made a new campground!");
    res.redirect(`/campgrounds/${campground._id}`);
}));

// show read route
router.get("/:id", tryCatchAsync(async (req, res, next) =>
{
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground)
    {
        req.flash("error", "Cannot find that campground!");
        return res.redirect("/campgrounds");
        //throw new ExpressError(404, `No campground found with id:${id} can be viewed`);
    }
    await campground.populate("reviews");
    await campground.populate("author");
    console.log(campground);
    res.render("campgrounds/show", { campground });
}));

// show edit route and form
router.get("/:id/edit", isLoggedIn, tryCatchAsync(async (req, res, next) =>
{
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground)
    {
        req.flash("error", "Cannot find that campground!");
        return res.redirect("/campgrounds");
        //throw new ExpressError(404, `No campground found with id:${id} is available to edit`);
    }
    res.render("campgrounds/edit", { campground });
}));

// actual edit route, will change db entry
router.put("/:id", isLoggedIn, validateCampground, tryCatchAsync(async (req, res, next) =>
{
    if (!req.body.campground) throw new ExpressError(400, "No Campground sent in request body.");
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    if (!campground)
    {
        throw new ExpressError(404, `No campground found with id:${id} can be updated`);
    }
    req.flash("success", "Campground updated successfully.")
    res.redirect(`/campgrounds/${id}`);
}));

// show delete route
router.get("/:id/delete", isLoggedIn, tryCatchAsync(async (req, res, next) =>
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
router.delete("/:id", isLoggedIn, tryCatchAsync(async (req, res, next) =>
{
    const { id } = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    if (!campground)
    {
        throw new ExpressError(404, `No campground found with id:${id} exists to delete`);
    }
    req.flash("success", "Campground deleted successfully")
    res.redirect("/campgrounds");
}));

module.exports = router;
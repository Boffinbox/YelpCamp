const express = require("express");
const router = express.Router();
const campgrounds = require("../controllers/campgrounds.js");

const ExpressError = require("../helpers/expresserror");
const tryCatchAsync = require("../helpers/trycatchasync");
const validateCampground = require("../helpers/validateCampground");
const isLoggedIn = require("../helpers/isLoggedIn");
const isAuthor = require("../helpers/isAuthor");

const Campground = require("../models/campground");

// show index route
router.get("/", tryCatchAsync(campgrounds.index));

// show create form
router.get("/new", isLoggedIn, campgrounds.renderNewForm);

// actual create route - redirect to read page
router.post("/", isLoggedIn, validateCampground, tryCatchAsync(campgrounds.createCampground));

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
    await campground.populate(
        {
            path: "reviews",
            populate:
            {
                path: "author"
            }
        });
    await campground.populate("author");
    console.log(campground);
    res.render("campgrounds/show", { campground });
}));

// show edit route and form
router.get("/:id/edit", isLoggedIn, isAuthor, tryCatchAsync(async (req, res, next) =>
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
router.put("/:id", isLoggedIn, isAuthor, validateCampground, tryCatchAsync(async (req, res, next) =>
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
router.get("/:id/delete", isLoggedIn, isAuthor, tryCatchAsync(async (req, res, next) =>
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
router.delete("/:id", isLoggedIn, isAuthor, tryCatchAsync(async (req, res, next) =>
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
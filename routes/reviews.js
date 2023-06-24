const express = require("express");
const router = express.Router({ mergeParams: true });
// merge params is set to true because otherwise,
// req.params would be unique to each router
// to put it another way, since we have prefixed the :id
// in index.js, we now have to get those params

const tryCatchAsync = require("../helpers/trycatchasync")
const validateReview = require("../helpers/validateReview");

const isLoggedIn = require("../helpers/isLoggedIn");
const isReviewer = require("../helpers/isReviewer");

const Campground = require("../models/campground");
const Review = require("../models/review");

router.post("/", isLoggedIn, validateReview, tryCatchAsync(async (req, res) =>
{
    const { id } = req.params;
    const campground = await Campground.findById(id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash("success", "Your review was created!")
    res.redirect(`/campgrounds/${campground._id}`);
}));

router.delete("/:reviewId", isLoggedIn, isReviewer, tryCatchAsync(async (req, res) =>
{
    const { id, reviewId } = req.params;
    await Review.findByIdAndDelete(reviewId);
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    req.flash("success", "Review deleted.")
    res.redirect(`/campgrounds/${id}`);
}));

module.exports = router;
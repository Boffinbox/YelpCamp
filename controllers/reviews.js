const Campground = require("../models/campground");
const Review = require("../models/review");

module.exports.createReview = async (req, res) =>
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
}

module.exports.deleteReview = async (req, res) =>
{
    const { id, reviewId } = req.params;
    await Review.findByIdAndDelete(reviewId);
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    req.flash("success", "Review deleted.")
    res.redirect(`/campgrounds/${id}`);
}
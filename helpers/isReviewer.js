const Review = require("../models/review");
const tryCatchAsync = require("../helpers/trycatchasync")

const isReviewer = tryCatchAsync(async (req, res, next) =>
{
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id))
    {
        req.flash("error", "You do not have permission to do that")
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
});

module.exports = isReviewer;
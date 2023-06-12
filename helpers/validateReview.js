const { reviewSchema } = require("../schemas.js");

const ExpressError = require("../helpers/expresserror");

const validateReview = (req, res, next) =>
{
    const { error } = reviewSchema.validate(req.body);
    if (error)
    {
        const msg = error.details.map(el => el.message).join(',');
        console.log("Review validation failed");
        throw new ExpressError(400, msg);
    }
    else
    {
        console.log("Review validated successfully");
        next();
    }
}

module.exports = validateReview;
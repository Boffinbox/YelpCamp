const { campgroundSchema } = require("../schemas.js");

const ExpressError = require("../helpers/expresserror");

const validateCampground = (req, res, next) =>
{
    const { error } = campgroundSchema.validate(req.body);
    if (error)
    {
        const msg = error.details.map(el => el.message).join(',');
        console.log("Campground validation failed");
        throw new ExpressError(400, msg);
    }
    else
    {
        console.log("Campground validated successfully");
        next();
    }
}

module.exports = validateCampground;
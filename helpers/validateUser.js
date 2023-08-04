const { userSchema } = require("../schemas.js");

const ExpressError = require("../helpers/expresserror");

const validateUser = (req, res, next) =>
{
    const { error } = userSchema.validate(req.body);
    if (error)
    {
        const msg = error.details.map(el => el.message).join(',');
        console.log("User validation failed");
        throw new ExpressError(400, msg);
    }
    else
    {
        console.log("User validated successfully");
        next();
    }
}

module.exports = validateUser;
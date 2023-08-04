const baseJoi = require("joi");
const sanitizeHtml = require('sanitize-html');

const htmlSanitizeExtension = (baseJoi) => ({
    type: "string",
    base: baseJoi.string(),
    messages: {
        "string.escapeHTML": "Oi! {{#label}} must not include HTML!"
    },
    rules: {
        escapeHTML: {
            validate(value, helpers)
            {
                let clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean.includes('&amp;'))
                {
                    clean = clean.replace(/&amp;/g, '&');
                }
                if (clean !== value)
                {
                    return helpers.error("string.escapeHTML", { value });
                }
                else
                {
                    return clean;
                }
            }
        }
    }
});

const Joi = baseJoi.extend(htmlSanitizeExtension);

const campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required().escapeHTML(),
        location: Joi.string().required().escapeHTML(),
        // image: Joi.string().required(),
        price: Joi.number().required().min(0),
        description: Joi.string().required().escapeHTML()
    }).required(),
    deleteImages: Joi.array()
});

module.exports.campgroundSchema = campgroundSchema;

const reviewSchema = Joi.object(
    {
        review: Joi.object(
            {
                rating: Joi.number().min(0).max(5).required(),
                body: Joi.string().required().escapeHTML()
            }
        ).required()
    }
)

module.exports.reviewSchema = reviewSchema;

const userSchema = Joi.object(
    {
        username: Joi.string().required().escapeHTML(),
        email: Joi.string().escapeHTML(),
        password: Joi.string().required().escapeHTML()
    }
).required()

module.exports.userSchema = userSchema;
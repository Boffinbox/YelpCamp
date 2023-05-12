const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const campgroundSchema = new Schema({
    title:
    {
        type: String, required: true
    },
    image: String,
    price: Number,
    description: String,
    location: String
});

const Campground = mongoose.model("Campground", campgroundSchema);

module.exports = Campground;
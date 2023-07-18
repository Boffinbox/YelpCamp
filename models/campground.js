const mongoose = require("mongoose");
const Review = require("./review");
const Schema = mongoose.Schema;

// https://res.cloudinary.com/dejzcp0js/image/upload/v1689607713/YelpCamp/xskfqxlb8df513ml3mgp.jpg

const ImageSchema = new Schema(
    {
        url: String,
        filename: String
    }
)

ImageSchema.virtual("thumbnail").get(function ()
{
    return this.url.replace("/upload", "/upload/w_200");
})

const campgroundSchema = new Schema({
    title:
    {
        type: String, required: true
    },
    images: [ImageSchema],
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    reviews: [
        {
            type: Schema.Types.ObjectID,
            ref: "Review"
        }
    ]
});

campgroundSchema.post("findOneAndDelete", async function (doc)
{
    if (doc)
    {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
});

const Campground = mongoose.model("Campground", campgroundSchema);



module.exports = Campground;
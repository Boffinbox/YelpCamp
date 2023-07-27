const mongoose = require("mongoose");
const Review = require("./review");
const Schema = mongoose.Schema;

// https://res.cloudinary.com/dejzcp0js/image/upload/v1689607713/YelpCamp/xskfqxlb8df513ml3mgp.jpg

const imageSchema = new Schema(
    {
        url: String,
        filename: String
    }
)

imageSchema.virtual("thumbnail").get(function ()
{
    return this.url.replace("/upload", "/upload/w_200");
});

const opts = { toJSON: { virtuals: true } };
const campgroundSchema = new Schema({
    title:
    {
        type: String, required: true
    },
    images: [imageSchema],
    price: Number,
    description: String,
    location: String,
    geometry: {
        type: {
            type: String,
            enum: ["Point"],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
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
}, opts);

// for use with cluster map
campgroundSchema.virtual("properties.popUpMarkup").get(function ()
{
    return `
    <div style="text-align: center">
    <h5>${this.title}</h5>
    <p>${this.description.substring(0, 72)}...</p>
    <p><img src="${this.images[0].thumbnail}"></p>
    <div><a href="/campgrounds/${this._id}">View Campground</div>
    </div>`;
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
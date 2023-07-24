// antime we need to seed/reset the db
// i will run this

if (process.env.NODE_ENV !== "production")
{
    require("dotenv").config();
}

// start mongoose
const mongoose = require("mongoose");
const Campground = require("../models/campground");
// hardcoded address for now, whilst i setup
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
    .then(() =>
    {
        console.log(`MongoDB Connection Open - for seeding YelpCamp :)`);
    })
    .catch((err) =>
    {
        console.log("Oh no! MongoDB Connection Error :(");
        console.log(err);
    });
// end mongoose

// using european countries because i know these
// more than american states. sorry colt :(
const countries = require("./countries");
const { descriptors, places } = require("./campNames");

const geo = require("../helpers/geometry");

const seedDB = async () =>
{
    // break glass in event of total failure
    // //await Campground.deleteMany({});
    for (let i = 0; i < 3; i++)
    {
        // math floor because of zero index array
        const price = Math.ceil(Math.random() * 25) + 10;
        const c = new Campground({
            title: `${randomFromArray(descriptors)} ${randomFromArray(places)}`,
            price: price,
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsum, soluta! Eos maxime dolorum aut perspiciatis veniam ratione vitae eum. Dignissimos tenetur culpa, autem fugiat debitis alias eos veritatis molestiae animi!",
            images: [
                {
                    url: "https://res.cloudinary.com/dejzcp0js/image/upload/v1689778828/YelpCamp/afoixxczbteeubvz6myn.jpg",
                    filename: 'YelpCamp/afoixxczbteeubvz6myn'
                }
            ],
            reviews: [],
            author: "6491f01ad5a77a2dd1c8ab80"
        });
        c.location = `${randomFromArray(countries)}`;
        const geoData = await geo.getGeoData(c.location);
        c.geometry = geo.getGeometry(geoData);
        await c.save();
        await console.log(`camp site ${i + 1} "saved"`);
    }
    // once done seeding, close and finish up
    mongoose.connection.close();
}

seedDB();

function randomFromArray(chosenArray)
{
    const randSelected = Math.floor(Math.random() * chosenArray.length);
    return chosenArray[randSelected];
}
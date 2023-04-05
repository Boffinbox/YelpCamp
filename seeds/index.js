// antime we need to seed/reset the db
// i will run this

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

const seedDB = async () =>
{
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++)
    {
        // math floor because of zero index array
        const randomCountry = Math.floor(Math.random() * countries.length);
        const randomDescriptor = Math.floor(Math.random() * descriptors.length);
        const randomPlace = Math.floor(Math.random() * places.length);
        const c = new Campground({
            title: `${descriptors[randomDescriptor]} ${places[randomPlace]}`,
            location: `${countries[randomCountry]}`
        });
        await c.save();
        await console.log(`country number ${i + 1} saved`);
    }
}

seedDB();
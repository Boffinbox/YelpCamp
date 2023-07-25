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
const europe = require("./europeLatLongs");

const geo = require("../helpers/geometry");

const seedDB = async () =>
{
    // break glass in event of total failure
    // //await Campground.deleteMany({});
    for (let i = 0; i < 1; i++)
    {
        // math floor because of zero index array
        const price = Math.ceil(Math.random() * 25) + 10;
        const chosenPlace = randomFromArray(europe);
        console.log(chosenPlace);
        // assign property values
        const c = new Campground()
        c.title = `${randomFromArray(descriptors)} ${randomFromArray(places)}`;
        c.price = price;
        c.description = "Lorem ipsum dolor sit amet consectetur adipisicing elit.";
        c.images = [
            {
                url: "https://res.cloudinary.com/dejzcp0js/image/upload/v1689778828/YelpCamp/afoixxczbteeubvz6myn.jpg",
                filename: 'YelpCamp/afoixxczbteeubvz6myn'
            }
        ];
        c.reviews = [];
        c.author = "6491f01ad5a77a2dd1c8ab80";
        c.location = getLocationString(chosenPlace);
        c.geometry = geo.getGeometry(chosenPlace.latitude, chosenPlace.longitude);
        // finally, save data to mongo
        // await c.save();
        await console.log(`Camp site ${i + 1}, ${c.title}, has been saved to DB.`);
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

function getLocationString(place)
{
    let locationString = "";
    locationString += place.name;
    if (place.subdivision)
    {
        locationString += `, ${place.subdivision}`;
    }
    locationString += `, ${place.state}`;
    return locationString;
}
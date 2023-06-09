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
        const price = Math.ceil(Math.random() * 25) + 10;
        const c = new Campground({
            title: `${randomFromArray(descriptors)} ${randomFromArray(places)}`,
            location: `${randomFromArray(countries)}`,
            image: "https://source.unsplash.com/collection/483251",
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsum, soluta! Eos maxime dolorum aut perspiciatis veniam ratione vitae eum. Dignissimos tenetur culpa, autem fugiat debitis alias eos veritatis molestiae animi!",
            price: price
        });
        await c.save();
        await console.log(`camp site ${i + 1} saved`);
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
const express = require("express");
const router = express.Router();
const campgrounds = require("../controllers/campgrounds.js");
const multer = require("multer");
const { storage } = require("../cloudinary")
const upload = multer({ storage });

const tryCatchAsync = require("../helpers/trycatchasync");
const validateCampground = require("../helpers/validateCampground");
const isLoggedIn = require("../helpers/isLoggedIn");
const isAuthor = require("../helpers/isAuthor");

router.route("/")
    // show index route
    .get(tryCatchAsync(campgrounds.index))
    // create route - redirects to read page
    .post(isLoggedIn, upload.array("campground[image]"), validateCampground, tryCatchAsync(campgrounds.createCampground));

// show create form
router.get("/new", isLoggedIn, campgrounds.renderNewForm);

// const Campground = require("../models/campground.js");
// router.get("/updatecampmanually", async (req, res) =>
// {
//     const allcamps = await Campground.find({ geometry: { $exists: false } });
//     for (let camp of allcamps)
//     {
//         camp.geometry =
//         {
//             type: "Point",
//             coordinates: [0.000000, 0.000000]
//         }
//         // await camp.save(); // be careful!
//         console.log(`"${camp.title}" geometry set to "${camp.geometry}"`);
//     }
//     res.send("geo set to defaults");
// })

router.route("/:id")
    // show read route
    .get(tryCatchAsync(campgrounds.showCampground))
    // actual edit route, will change db entry
    .put(isLoggedIn, isAuthor, upload.array("campground[image]"), validateCampground, tryCatchAsync(campgrounds.updateCampground))
    // actual delete route
    .delete(isLoggedIn, isAuthor, tryCatchAsync(campgrounds.destroyCampground));

// show edit route and form
router.get("/:id/edit", isLoggedIn, isAuthor, tryCatchAsync(campgrounds.renderEditForm));

// show delete route
router.get("/:id/delete", isLoggedIn, isAuthor, tryCatchAsync(campgrounds.renderDeleteForm));

module.exports = router;
const express = require("express");
const router = express.Router();
const campgrounds = require("../controllers/campgrounds.js");

const ExpressError = require("../helpers/expresserror");
const tryCatchAsync = require("../helpers/trycatchasync");
const validateCampground = require("../helpers/validateCampground");
const isLoggedIn = require("../helpers/isLoggedIn");
const isAuthor = require("../helpers/isAuthor");

const Campground = require("../models/campground");

// show index route
router.get("/", tryCatchAsync(campgrounds.index));

// show create form
router.get("/new", isLoggedIn, campgrounds.renderNewForm);

// actual create route - redirect to read page
router.post("/", isLoggedIn, validateCampground, tryCatchAsync(campgrounds.createCampground));

// show read route
router.get("/:id", tryCatchAsync(campgrounds.showCampground));

// show edit route and form
router.get("/:id/edit", isLoggedIn, isAuthor, tryCatchAsync(campgrounds.renderEditForm));

// actual edit route, will change db entry
router.put("/:id", isLoggedIn, isAuthor, validateCampground, tryCatchAsync(campgrounds.updateCampground));

// show delete route
router.get("/:id/delete", isLoggedIn, isAuthor, tryCatchAsync(campgrounds.renderDeleteForm));

// actual delete route
router.delete("/:id", isLoggedIn, isAuthor, tryCatchAsync(campgrounds.destroyCampground));

module.exports = router;
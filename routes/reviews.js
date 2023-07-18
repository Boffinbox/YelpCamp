const express = require("express");
const router = express.Router({ mergeParams: true });
// merge params is set to true because otherwise,
// req.params would be unique to each router
// to put it another way, since we have prefixed the :id
// in index.js, we now have to get those params
const reviews = require("../controllers/reviews.js");

const tryCatchAsync = require("../helpers/trycatchasync")
const validateReview = require("../helpers/validateReview");

const isLoggedIn = require("../helpers/isLoggedIn");
const isReviewer = require("../helpers/isReviewer");

router.post("/", isLoggedIn, validateReview, tryCatchAsync(reviews.createReview));

router.delete("/:reviewId", isLoggedIn, isReviewer, tryCatchAsync(reviews.deleteReview));

module.exports = router;
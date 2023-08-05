const express = require("express");
const router = express.Router();
const passport = require("passport");
const users = require("../controllers/users.js");

const tryCatchAsync = require("../helpers/trycatchasync")
const validateUser = require("../helpers/validateUser");
const isLoggedIn = require("../helpers/isLoggedIn");
const storeReturnTo = require("../helpers/storeReturnTo");

router.route("/register")
    .get(users.renderRegister)
    .post(validateUser, tryCatchAsync(users.register));

router.route("/login")
    .get(users.renderLogin)
    .post(storeReturnTo, validateUser, passport.authenticate("local", { failureFlash: true, failureRedirect: "/login" }), tryCatchAsync(users.login));

router.get("/logout", isLoggedIn, users.logout);

module.exports = router;
const express = require("express");
const router = express.Router();
const passport = require("passport");
const users = require("../controllers/users.js");

const tryCatchAsync = require("../helpers/trycatchasync")
const isLoggedIn = require("../helpers/isLoggedIn");
const storeReturnTo = require("../helpers/storeReturnTo");

router.get("/register", users.renderRegister);

router.post("/register", tryCatchAsync(users.register));

router.get("/login", users.renderLogin);

router.post("/login", storeReturnTo, passport.authenticate("local", { failureFlash: true, failureRedirect: "/login" }), tryCatchAsync(users.login));

router.get("/logout", isLoggedIn, users.logout);

module.exports = router;
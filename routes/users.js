const express = require("express");
const router = express.Router();
const passport = require("passport");

const tryCatchAsync = require("../helpers/trycatchasync")
const User = require("../models/user");
const isLoggedIn = require("../helpers/isLoggedIn");

router.get("/register", (req, res) =>
{
    res.render("users/register");
})

router.post("/register", tryCatchAsync(async (req, res, next) =>
{
    try
    {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        console.log(registeredUser);
        req.login(registeredUser, (err) =>
        {
            if (err)
            {
                return next(err);
            }
            req.flash("success", `Welcome to Yelp Camp, ${username}`);
            res.redirect("/campgrounds");
        });
    }
    catch (error)
    {
        req.flash("error", error.message);
        res.redirect("/register");
    }
}));

router.get("/login", (req, res) =>
{
    res.render("users/login")
});

router.post("/login", passport.authenticate("local", { failureFlash: true, failureRedirect: "/login" }), tryCatchAsync(async (req, res, next) =>
{
    const { username } = req.body;
    req.flash("success", `Welcome back, ${username}`);
    res.redirect("/campgrounds");
}));

router.get("/logout", isLoggedIn, (req, res, next) =>
{
    const { username } = req.user;
    req.logout(function (err)
    {
        if (err)
        {
            return next(err)
        }
        req.flash("success", `Goodbye, ${username}`);
        res.redirect("/campgrounds");
    });
});

module.exports = router;
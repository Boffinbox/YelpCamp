const express = require("express");
const router = express.Router();

const tryCatchAsync = require("../helpers/trycatchasync")
const User = require("../models/user");

router.get("/register", (req, res) =>
{
    res.render("users/register.ejs");
})

router.post("/register", tryCatchAsync(async (req, res, next) =>
{
    try
    {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        console.log(registeredUser);
        req.flash("success", `Welcome to Yelp Camp, ${username}`);
        res.redirect("/campgrounds");
    }
    catch (error)
    {
        req.flash("error", error.message);
        res.redirect("/register");
    }
}));

module.exports = router;
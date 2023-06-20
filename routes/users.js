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
    res.send(req.body);
}));

module.exports = router;
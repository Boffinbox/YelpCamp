const User = require("../models/user");

module.exports.renderRegister = (req, res) =>
{
    res.render("users/register");
}

module.exports.register = async (req, res, next) =>
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
};

module.exports.renderLogin = (req, res) =>
{
    res.render("users/login");
}

module.exports.login = async (req, res) =>
{
    const { username } = req.body;
    req.flash("success", `Welcome back, ${username}`);
    const urlToRedirectTo = res.locals.returnTo || "/campgrounds";
    delete res.locals.returnTo;
    res.redirect(urlToRedirectTo);
}

module.exports.logout = (req, res, next) =>
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
}
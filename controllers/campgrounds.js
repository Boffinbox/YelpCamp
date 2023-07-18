const Campground = require("../models/campground");
const ExpressError = require("../helpers/expresserror")
const { cloudinary } = require("../cloudinary");

module.exports.index = async (req, res) =>
{
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
}

module.exports.renderNewForm = (req, res) =>
{
    res.render("campgrounds/new");
}

module.exports.createCampground = async (req, res) =>
{
    const campground = new Campground(req.body.campground);
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.author = await req.user._id;
    await campground.save();
    req.flash("success", "Successfully made a new campground!");
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.showCampground = async (req, res) =>
{
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground)
    {
        req.flash("error", "Cannot find that campground!");
        return res.redirect("/campgrounds");
    }
    await campground.populate(
        {
            path: "reviews",
            populate:
            {
                path: "author"
            }
        });
    await campground.populate("author");
    res.render("campgrounds/show", { campground });
}

module.exports.renderEditForm = async (req, res) =>
{
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground)
    {
        req.flash("error", "Cannot find that campground!");
        return res.redirect("/campgrounds");
    }
    res.render("campgrounds/edit", { campground });
}

module.exports.updateCampground = async (req, res) =>
{
    if (!req.body.campground) throw new ExpressError(400, "No Campground sent in request body.");
    const { id } = req.params;
    // ...add the text data first
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    // ...then push the images onto the campground
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }))
    campground.images.push(...imgs);
    if (req.body.deleteImages)
    {
        for (let filename of req.body.deleteImages)
        {
            await cloudinary.uploader.destroy(filename);
        }
        // this one's a doozy
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    await campground.save();
    if (!campground)
    {
        throw new ExpressError(404, `No campground found with id:${id} can be updated`);
    }
    req.flash("success", "Campground updated successfully.")
    res.redirect(`/campgrounds/${id}`);
}

module.exports.renderDeleteForm = async (req, res) =>
{
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground)
    {
        throw new ExpressError(404, `No campground found with id:${id} can be deleted`);
    }
    res.render("campgrounds/delete", { campground });
}

module.exports.destroyCampground = async (req, res) =>
{
    const { id } = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    if (!campground)
    {
        throw new ExpressError(404, `No campground found with id:${id} exists to delete`);
    }
    req.flash("success", "Campground deleted successfully")
    res.redirect("/campgrounds");
}
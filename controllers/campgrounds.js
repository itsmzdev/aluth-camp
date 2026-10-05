const Campground = require("../models/campground");
const { imageUpload } = require("../helper/imageUpload");
const { cloudinary } = require("../cloudinary");
const maptilerClient = require("@maptiler/client");

maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

module.exports.index = async (req, res) => {
  const campgrounds = await Campground.find({}); // find all camps in the db
  res.render("campgrounds/index", { campgrounds }); // render it to campground page
};

module.exports.renderNewForm = (req, res) => {
  res.render("campgrounds/new");
};

module.exports.createCampground = async (req, res) => {
  // Debugging the body and header
  // console.log("BODY:", req.body);
  // console.log("HEADERS:", req.headers["content-type"]);

  // if (!req.body.campground) throw new ExpressError("Invalid Campground Data", 400);

  try {
    // Maptiler map configs
    const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
    // console.log(geoData);
    if (!geoData.features?.length) {
      req.flash("error", "Could not geocode that location. Please try again and enter a valid location.");
      return res.redirect("/campgrounds/new");
    }

    // Call helper and get array of uploaded images to cloudinary
    const images = await imageUpload(req.files);

    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.features[0].geometry;
    campground.location = geoData.features[0].place_name;
    campground.images = images;
    campground.author = req.user._id;
    await campground.save();
    console.log(campground);
    req.flash("success", "Successfully made a new campground!");
    res.redirect(`/campgrounds/${campground._id}`);

    // Respond back with success details in the browser
    // return res.status(200).json({
    //   success: true,
    //   message: "Upload successful!",
    //   files: fileData, // Returns an array of uploaded image details
    // });
  } catch (error) {
    // If request got any error like your internet disconnects, or Cloudinary rejects the image
    // return res.status(500).json({ success: false, message: "Upload failed", error: error.message });

    console.error("Cloudinary Upload Error:", error);
    req.flash("error", "Something went wrong while uploading your images. Please try again.");
    return res.redirect("/campgrounds/new");
  }
};

module.exports.showCampground = async (req, res) => {
  // const { id } = req.params;
  // Used async await to get the data
  const campground = await Campground.findById(req.params.id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("author");
  if (!campground) {
    req.flash("error", "Cannot find the campground!");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/show", { campground });
  // You could use thennable method like below or callback method
  // Campground.findById(id).then((campground) => {
  //   res.render("campgrounds/show", { campground });
  // });
};

module.exports.renderEditForm = async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  if (!campground) {
    req.flash("error", "Cannot find the campground!");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/edit", { campground });
};

module.exports.updateCampground = async (req, res) => {
  // const { id } = req.params;
  // await Campground.updateOne({ _id: id }, { $set: req.body.campground });
  // Instead above method, there is better way findByIDAndUpdate()
  const { id } = req.params;
  const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
  // console.log(geoData);
  if (!geoData.features?.length) {
    req.flash("error", "Could not geocode that location. Please try again and enter a valid location.");
    return res.redirect(`/campgrounds/${id}/edit`);
  }
  const campground = await Campground.findByIdAndUpdate(id, req.body.campground, { runValidators: true, returnDocument: "after" });
  // const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground}) // Colt spread the data and send a copy of the object like this instead of send the whole body object like i did above, both are valid way
  campground.geometry = geoData.features[0].geometry;
  campground.location = geoData.features[0].place_name;

  // Call helper and get array of uploaded file data
  const images = await imageUpload(req.files);
  campground.images.push(...images);
  await campground.save();

  // Delete images & url from from DB and cloudinary by update
  if (req.body.deleteImages) {
    for (const filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    console.log(campground);
  }
  req.flash("success", "Successfully updated campground!");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async (req, res) => {
  /**
   * To do
   * Need to implement delete images when delete a camp
   */
  await Campground.findByIdAndDelete(req.params.id);
  req.flash("success", "Successfully deleted campground!");
  res.redirect("/campgrounds");
};

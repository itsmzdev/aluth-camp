const Campground = require("../models/campground");

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
  const campground = new Campground(req.body.campground);
  campground.author = req.user._id;
  await campground.save();
  req.flash("success", "Successfully made a new campground!");
  res.redirect(`/campgrounds/${campground._id}`);
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
  const campground = await Campground.findByIdAndUpdate(id, req.body.campground, { runValidators: true, returnDocument: "after" });
  // Colt spread the data and send a copy of the object like below instead of send the whole body object like i did above, both are valid way
  // const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground})
  req.flash("success", "Successfully updated campground!");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async (req, res) => {
  await Campground.findByIdAndDelete(req.params.id);
  req.flash("success", "Successfully deleted campground!");
  res.redirect("/campgrounds");
};

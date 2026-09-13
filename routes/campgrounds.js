const express = require("express");
const router = express.Router();
const ExpressError = require("../helper/ExpressError");
const Campground = require("../models/campground");
const { campgroundSchema } = require("../schemas");
const { isLoggedIn } = require("../middleware");

const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  // console.log(error);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg);
  } else {
    next();
  }
};

router.get("/", async (req, res) => {
  const campgrounds = await Campground.find({}); // find all camps in the db
  res.render("campgrounds/index", { campgrounds }); // render it to campground page
});

router.get("/new", isLoggedIn, (req, res) => {
  res.render("campgrounds/new");
});

router.post("/", isLoggedIn, validateCampground, async (req, res) => {
  // Debugging the body and header
  // console.log("BODY:", req.body);
  // console.log("HEADERS:", req.headers["content-type"]);

  // if (!req.body.campground) throw new ExpressError("Invalid Campground Data", 400);
  const campground = new Campground(req.body.campground);
  await campground.save();
  req.flash("success", "Successfully made a new campground!");
  res.redirect(`/campgrounds/${campground._id}`);
});

router.get("/:id", async (req, res) => {
  // const { id } = req.params;
  // Used async await to get the data
  const campground = await Campground.findById(req.params.id).populate("reviews");
  if (!campground) {
    req.flash("error", "Cannot find the campground!");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/show", { campground });
  // You could use thennable method like below or callback method
  // Campground.findById(id).then((campground) => {
  //   res.render("campgrounds/show", { campground });
  // });
});

router.get("/:id/edit", isLoggedIn, async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  if (!campground) {
    req.flash("error", "Cannot find the campground!");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/edit", { campground });
});
router.put("/:id", validateCampground, async (req, res) => {
  // res.send("It worked!!");
  // const { id } = req.params;
  // await Campground.updateOne({ _id: id }, { $set: req.body.campground });
  // Instead above method, there is better way findByIDAndUpdate()
  const { id } = req.params;
  const campground = await Campground.findByIdAndUpdate(id, req.body.campground, { runValidators: true, returnDocument: "after" });
  // Colt spread the data and send a copy of the object like below instead of send the whole body object like i did above, both are valid way
  // const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground})
  req.flash("success", "Successfully updated campground!");
  res.redirect(`/campgrounds/${campground._id}`);
});

router.delete("/:id", isLoggedIn, async (req, res) => {
  await Campground.findByIdAndDelete(req.params.id);
  req.flash("success", "Successfully deleted campground!");
  res.redirect("/campgrounds");
});

module.exports = router;

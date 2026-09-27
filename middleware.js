const ExpressError = require("./utils/ExpressError");
const Campground = require("./models/campground");
const Review = require("./models/review");
const { campgroundSchema, reviewSchema } = require("./schemas");

module.exports.isLoggedIn = (req, res, next) => {
  // isAthenticated method coming from passport
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash("error", "You must be signed in");
    return res.redirect("/login");
  }
  next();
};

module.exports.storeReturnTo = (req, res, next) => {
  if (req.session.returnTo) {
    res.locals.returnTo = req.session.returnTo;
  }
  next();
};

module.exports.validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  // console.log(error);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg);
  } else {
    next();
  }
};

module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  // Here i have used res.locals.currentUser._id to find
  if (!campground.author.equals(res.locals.currentUser._id)) {
    req.flash("error", "You are not authorized to do that");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  // Here i have used req.user._id to find, both holds the same data. I just wanted to test if locals working on middleware too. and its working. Use req.user thats the prefered way for this
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You are not authorized to do that");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};

module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg);
  } else {
    next();
  }
};

module.exports.validateImage = (req, res, next) => {
  const files = req.files;
  const MAX_IMAGES = 5; // You can limit in the multer or upload.array("image", 5) too , check it i have commented it, i ahve done it here to redirect with flash

  // Checks if user submited a form without img and checks user selected empty array of images (this validation works only when create not update)
  if (req.method === "POST" && (!files || files.length === 0)) {
    // return res.status(400).json({ success: false, message: "No file uploaded" });
    req.flash("error", "You must upload at least one image!");
    return res.redirect("/campgrounds/new");
  }
  // Maximum limit for BOTH creating POST and updating PUT
  if (files && files.length > MAX_IMAGES) {
    req.flash("error", "Please select upto 5 images");
    return res.redirect(`/campgrounds/${req.params.id}/edit`);
  }

  next();
};

const express = require("express");
const router = express.Router();
const campgrounds = require("../controllers/campgrounds");
const { isLoggedIn, isAuthor, validateCampground, validateImage } = require("../middleware");
const { upload } = require("../cloudinary");

router
  .route("/")
  .get(campgrounds.index)
  .post(
    isLoggedIn,
    validateCampground,
    upload.array("image"),
    validateImage,
    campgrounds.createCampground,
  );

router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router
  .route("/:id")
  .get(campgrounds.showCampground)
  .put(
    isLoggedIn,
    isAuthor,
    upload.array("image"),
    validateImage,
    validateCampground,
    campgrounds.updateCampground,
  )
  .delete(isLoggedIn, isAuthor, campgrounds.deleteCampground);

router.get("/:id/edit", isLoggedIn, isAuthor, campgrounds.renderEditForm);

module.exports = router;

const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");
const { storeReturnTo } = require("../middleware");

router.get("/register", (req, res) => {
  res.render("users/register");
});

router.post("/register", async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const user = await new User({ username, email });
    // Add users data and insert into db with salt and hashed password
    const newUser = await User.register(user, password);
    req.login(newUser, (err) => {
      if (err) return next(err);
      req.flash("success", `Welcome to Aluth Camp ${username}`);
      res.redirect("/campgrounds");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/register");
  }
});

router.get("/login", (req, res) => {
  res.render("users/login");
});

router.post("/login", storeReturnTo, passport.authenticate("local", { failureFlash: true, failureRedirect: "/login" }), (req, res) => {
  req.flash("success", "Hey! Welcome Back");
  const returnUrl = res.locals.returnTo || "/campgrounds";
  res.redirect(returnUrl);
});

router.get("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.flash("success", "Goodbye!");
    res.redirect("/campgrounds");
  });
});

module.exports = router;

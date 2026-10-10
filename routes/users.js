const express = require("express");
const router = express.Router();
const users = require("../controllers/users");
const passport = require("passport");
const { storeReturnTo, isAdmin } = require("../middleware");

router.route("/register").get(isAdmin, users.renderRegister).post(isAdmin, users.register);

router
  .route("/login")
  .get(users.renderLogin)
  .post(
    storeReturnTo,
    passport.authenticate("local", { failureFlash: true, failureRedirect: "/login" }),
    users.login,
  );

router.get("/logout", users.logout);

module.exports = router;

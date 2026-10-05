/** Try to understand the full code at home when you pull */
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ quiet: true });
}
const express = require("express");
const app = express();
app.set("query parser", "extended"); // for sanitizer
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override");
const passport = require("passport");
const User = require("./models/user");
const helmet = require("helmet");

const sanitizeV5 = require("./utils/mongoSanitizeV5.js"); // for sanitizer

const campgrundsRouter = require("./routes/campgrounds");
const reviewsRouter = require("./routes/reviews");
const userRouter = require("./routes/users");

// Connecting to database
mongoose.connect("mongodb://localhost:27017/aluth-camp");

// Databse connection error checking
const db = mongoose.connection;
db.on("error", (err) => {
  console.error("Mongoose connection error", err);
});
db.once("open", () => {
  console.log("Database connected");
});

// App settings
app.engine("ejs", ejsMate);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Middelwares
app.use(express.urlencoded({ extended: true })); // to load/parse form data by req
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public"))); // to serve the public folder directory with absolute path
app.use(sanitizeV5({ replaceWith: "_" })); // for sanitizer

// Session
const sessionConfig = {
  secret: "findbettersecret",
  resave: false,
  saveUninitialized: true, // false: does not save empty session. Reccomended for modern apps (use: login, carts...), unless you wanna track every users visit the website (use: tracking user permission, server-sdie analytics...) make it true
  cookie: {
    name: "session", // default 'connect.sid'
    httpOnly: true,
    // secure: true, // enable only if you have https (ssl)
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));
app.use(flash());
app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
); // Helmet helps secure web apps by automatically setting and managing HTTP response headers

const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
  "https://cdn.maptiler.com/", // add this
];

const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net",
  "https://cdn.maptiler.com/", // add this
];

const connectSrcUrls = [
  "https://api.maptiler.com/", // add this
];

const fontSrcUrls = [];

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: ["'self'", "blob:", "data:", `https://res.cloudinary.com/${process.env.CLOUD_NAME}/`, "https://images.unslash.com/", "https://api.maptiler.com/"],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  }),
);

app.use(passport.initialize());
app.use(passport.session());
// use authenticate method of model in LocalStrategy to insert data
// passport.use(new LocalStrategy(User.authenticate()));
passport.use(User.createStrategy()); // new way

// Store/remove data into the session
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Create global object to pass data through the application during the request-response cycle. It allows you to store variables that can be accessed by your templates and other middleware functions.
app.use((req, res, next) => {
  // console.log(req.session);
  // console.log(req.query);
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// Router
app.use("/", userRouter);
app.use("/campgrounds", campgrundsRouter);
app.use("/campgrounds/:id/reviews", reviewsRouter);

app.get("/", (req, res) => {
  res.render("home");
});

app.all("/{*path}", (req, res, next) => {
  // res.send("404!");
  next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  // res.send("Oh Boy We Got Hit By Something!!!");

  // Intercept Multer validation or file size errors
  if ((err.message && err.message.includes("Invalid file format")) || err.code === "LIMIT_FILE_SIZE") {
    const errorMsg = err.code === "LIMIT_FILE_SIZE" ? "File is too large! Maximum limit is 5MB." : err.message;

    req.flash("error", errorMsg);
    return res.redirect("/campgrounds/new");
  }

  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Oh No, Something went wrong!";
  res.status(statusCode).render("error", { err });
});

app.listen(3000, () => {
  console.log(`Listening on port 3000`);
});

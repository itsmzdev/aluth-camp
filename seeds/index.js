if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ quiet: true });
}
const mongoose = require("mongoose");
const Campground = require("../models/campground");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const dbUrl = process.env.MONGODB_URI;

// Connecting to database
mongoose.connect(dbUrl);

// Databse connection error checking
const db = mongoose.connection;
db.on("error", (err) => {
  console.error("Mongoose connection error", err);
});
db.once("open", () => {
  console.log("Database connected");
});

// Generating random seeds from seed files and stored in DB
const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 25; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      // Place your userID from db
      author: "6ac51087d2357e2fa8f05dc8",
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      geometry: {
        type: "Point",
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude,
        ],
      },
      title: `${sample(descriptors)} ${sample(places)}`,
      description:
        "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Repudiandae dolorum odio doloremque. Commodi minima similique voluptatem.",
      price,
      images: [
        {
          url: "https://res.cloudinary.com/itsmzdev/image/upload/v1791187614/aluth-camp/camp7_boyxfp.jpg",
          filename: "aluth-camp/camp5_eeqcmp",
        },
        {
          url: "https://res.cloudinary.com/itsmzdev/image/upload/v1791187613/aluth-camp/camp10_wcnufn.jpg",
          filename: "aluth-camp/camp4_ryvpwx",
        },
      ],
    });
    await camp.save();
  }
};

seedDB().then(() => {
  // Close the database connection after the seedDB function
  mongoose.connection.close();
});

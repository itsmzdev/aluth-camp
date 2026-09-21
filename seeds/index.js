const mongoose = require("mongoose");
const Campground = require("../models/campground");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");

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

// Generating random seeds from seed files and stored in DB
const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      author: "6aa67da07d7b61255308e9fa",
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      description: "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Repudiandae dolorum odio doloremque. Commodi minima similique voluptatem.",
      price,
      images: [
        {
          url: "https://res.cloudinary.com/itsmzdev/image/upload/v1789982690/aluth-camp/camp5_eeqcmp.jpg",
          filename: "aluth-camp/camp5_eeqcmp",
        },
        {
          url: "https://res.cloudinary.com/itsmzdev/image/upload/v1789982690/aluth-camp/camp4_ryvpwx.jpg",
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

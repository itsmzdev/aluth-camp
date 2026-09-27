const mongoose = require("mongoose");
const Review = require("./review");
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
  url: String,
  filename: String,
});
// Here virtual does not store the url in the database instead it is derving croped thumbnail size from db url virtually
ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_250");
});

//By default, Mongoose does not include virtuals when you convert a document to JSON, but our clustor map stringify into json so, in order to work with virtual we need this option
const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema(
  {
    title: String,
    images: [ImageSchema],
    price: Number,
    description: String,
    location: String,
    geometry: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  opts,
);

// Getting id,title and desc as virtual properties.popUpMarkup
CampgroundSchema.virtual("properties.popUpMarkup").get(function () {
  return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
    <p>${this.description.substring(0, 20)}...</p>`;
});

// Create mongoose delete middleware
CampgroundSchema.post("findOneAndDelete", async function (doc) {
  // console.log(doc);
  if (doc) {
    await Review.deleteMany({ _id: { $in: doc.reviews } });
  }
});

// Compile and export the model
module.exports = mongoose.model("Campground", CampgroundSchema);

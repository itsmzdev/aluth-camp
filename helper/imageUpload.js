const { handleUpload } = require("../cloudinary");

module.exports.imageUpload = async (files) => {
  // If no files provided, return an empty array or throw an error
  if (!files || files.length === 0) {
    // return res.status(400).json({ success: false, message: "No file uploaded" });
    req.flash("error", "You must upload at least one image!");
    return res.redirect("/campgrounds/new");
  }

  // Map through all files and trigger handleUpload
  const uploadPromises = files.map((file) => handleUpload(file.buffer, file.originalname));

  const uploadResults = await Promise.all(uploadPromises);
  // console.log(uploadResults);

  // Return formatted array of objects
  return uploadResults.map((result) => ({
    url: result.secure_url,
    filename: result.public_id,
  }));
};

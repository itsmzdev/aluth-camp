const { handleUpload } = require("../cloudinary");

module.exports.imageUpload = async (files) => {
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

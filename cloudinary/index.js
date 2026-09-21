const cloudinary = require("cloudinary").v2;
const multer = require("multer");

// 1. Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

// 2. Use standard Multer memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit to prevent memory exhaustion attacks
  },
  fileFilter: (req, file, cb) => {
    // Define the only file types you want to accept
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

    if (allowedMimeTypes.includes(file.mimetype)) {
      // Accept the file
      cb(null, true);
    } else {
      // Reject the file and return a custom error message
      cb(new Error("Invalid file format. Only JPG, JPEG, PNG, and WEBP images are allowed!"), false);
    }
  },
});

// Helper utility to wrap the Cloudinary stream in a Promise
const handleUpload = async (fileBuffer, originalName) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "aluth-camp",
        filename_override: originalName,
        use_filename: true,
        // Optional: set to true if you want the public_id url to include the readable name
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );
    // Write raw buffer directly to Cloudinary via the stream
    uploadStream.end(fileBuffer);
  });
};

module.exports = {
  cloudinary,
  upload,
  handleUpload,
};

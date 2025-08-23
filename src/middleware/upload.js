const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Multer disk storage configuration
const storage = multer.diskStorage({
  /**
   * Determines the destination directory for the uploaded file based on the request URL.
   */
  destination: (req, file, cb) => {
    let uploadPath = '';

    // Check the request path to determine the correct folder
    if (req.path.includes('/me/image')) {
      // Handles requests to /api/users/me/image
      uploadPath = 'uploads/profile_images/';
    } else if (req.path.includes('/product-image')) {
      // Handles requests to /api/eating-history/product-image
      uploadPath = 'uploads/nutrients_images/';
    } else {
      // If the path is unrecognized, return an error
      return cb(new Error('Unknown upload path'), null);
    }

    // Create the directory if it doesn't exist
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  /**
   * Generates a unique filename for the uploaded file.
   */
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const extension = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
  }
});

// Create the Multer instance with the configured storage
const upload = multer({ storage: storage });

module.exports = upload;

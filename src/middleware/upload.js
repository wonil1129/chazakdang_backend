const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Example: specify folder based on URL path or a request parameter
    if (req.url.includes('profile')) {
      cb(null, 'uploads/profile_images/');
    } else if (req.url.includes('nutrients')) {
      cb(null, 'uploads/nutrients_images/');
    } else if (req.url.includes('product')) {
      cb(null, 'uploads/product_images/');
    } else {
      cb(new Error('Unknown upload path'), null);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + ext;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

module.exports = upload;
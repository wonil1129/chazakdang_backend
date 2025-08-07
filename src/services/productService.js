const crawlCoupang = require('../utils/crawlCoupang');
const downloadImage = require('../utils/downloadImage');
const path = require('path');

async function fetchProductImage(foodName) {
  try {
    const result = await crawlCoupang(foodName);
    if (!result) return null;

    const filename = await downloadImage(result, path.join(__dirname, '../../uploads/product_images'));
    return `uploads/product_images/${filename}`;
  } catch (error) {
    console.error('Error fetching product image:', error);
    return null;
  }
}

module.exports = { fetchProductImage };

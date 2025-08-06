const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const downloadImage = (url, folder) => {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const ext = path.extname(new URL(url).pathname) || '.jpg';
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    const filepath = path.join(folder, filename);

    const fileStream = fs.createWriteStream(filepath);

    protocol.get(url.startsWith('http') ? url : `https:${url}`, (response) => {
      if (response.statusCode !== 200) {
        return reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
      }

      response.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close(() => resolve(filename));
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => reject(err));
    });
  });
};

module.exports = downloadImage;

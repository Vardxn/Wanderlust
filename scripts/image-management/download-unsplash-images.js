// Script to download all Unsplash images used in the project and save them to public/images/
// Usage: node download-unsplash-images.js

const fs = require('fs');
const https = require('https');
const path = require('path');

// List of Unsplash image URLs used in your project (add more as needed)
const unsplashUrls = [
  // Example URLs (replace/add as needed)
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
  'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60',
  // Add more Unsplash URLs here from your data.js or model defaults
];

const destDir = path.join(__dirname, 'public', 'images');
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, response => {
      response.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', err => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

(async () => {
  for (const url of unsplashUrls) {
    const filename = path.basename(url.split('?')[0]);
    const dest = path.join(destDir, filename);
    console.log(`Downloading ${url} -> ${dest}`);
    try {
      await download(url, dest);
    } catch (err) {
      console.error(`Failed to download ${url}:`, err.message);
    }
  }
  console.log('All downloads complete!');
})();

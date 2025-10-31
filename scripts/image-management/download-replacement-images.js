const https = require('https');
const fs = require('fs');
const path = require('path');

// Image numbers that need replacement
const brokenImageNumbers = [10, 16, 24, 25, 48, 50, 65, 67, 71, 76, 83, 95, 96, 99];

// Curated Unsplash image URLs for property/travel photos
const replacementImageUrls = [
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop', // Modern house
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop', // Luxury home
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop', // Beautiful property
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop', // Modern interior
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop', // Cozy home
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop', // Elegant house
  'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&h=600&fit=crop', // Stylish property
  'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&h=600&fit=crop', // Modern villa
  'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&h=600&fit=crop', // Beautiful estate
  'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800&h=600&fit=crop', // Luxury property
  'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=800&h=600&fit=crop', // Scenic home
  'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=800&h=600&fit=crop', // Contemporary house
  'https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800&h=600&fit=crop', // Elegant residence
  'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=600&fit=crop', // Modern dwelling
];

const outputDir = path.join(__dirname, 'public', 'images', 'listings');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(outputDir, filename);
    
    // Check if file already exists
    if (fs.existsSync(filePath)) {
      console.log(`⏭️  Skipping ${filename} (already exists)`);
      resolve();
      return;
    }

    console.log(`📥 Downloading ${filename}...`);
    
    const file = fs.createWriteStream(filePath);
    
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`✅ Downloaded ${filename}`);
          resolve();
        });
      } else {
        fs.unlink(filePath, () => {});
        reject(new Error(`Failed to download ${filename}: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      fs.unlink(filePath, () => {});
      reject(err);
    });
  });
}

async function downloadAllImages() {
  console.log(`🚀 Starting download of ${brokenImageNumbers.length} replacement images...\n`);
  
  for (let i = 0; i < brokenImageNumbers.length; i++) {
    const imageNumber = brokenImageNumbers[i];
    const filename = `image-${imageNumber}.jpg`;
    const url = replacementImageUrls[i];
    
    try {
      await downloadImage(url, filename);
      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`❌ Error downloading ${filename}:`, error.message);
    }
  }
  
  console.log('\n✅ All replacement images downloaded successfully!');
  console.log(`📁 Images saved to: ${outputDir}`);
}

downloadAllImages();

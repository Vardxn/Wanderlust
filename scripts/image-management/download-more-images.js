// Download Additional Images (51-100)
// This script downloads 50 more images to complement the existing ones
// Usage: node download-more-images.js

const https = require('https');
const fs = require('fs');
const path = require('path');

// Additional curated Unsplash image URLs (51-100)
const unsplashImageUrls = [
  // Luxury Properties (51-60)
  'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=1200&q=80',
  'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&q=80',
  'https://images.unsplash.com/photo-1600566753229-f5ca0e1e0c08?w=1200&q=80',
  'https://images.unsplash.com/photo-1600585152915-d208bec867a1?w=1200&q=80',
  'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=1200&q=80',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80',
  'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80',
  'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=1200&q=80',
  'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1200&q=80',
  
  // Beach & Coastal (61-70)
  'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80',
  'https://images.unsplash.com/photo-1561409037-c7be81613c1f?w=1200&q=80',
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&q=80',
  'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=1200&q=80',
  'https://images.unsplash.com/photo-1570213489059-0aac6626cade?w=1200&q=80',
  'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=1200&q=80',
  'https://images.unsplash.com/photo-1619994403073-2cec844b8e4c?w=1200&q=80',
  'https://images.unsplash.com/photo-1615880484746-a134be9a6ecf?w=1200&q=80',
  'https://images.unsplash.com/photo-1621277224630-81d9af65e40e?w=1200&q=80',
  'https://images.unsplash.com/photo-1601918774946-25832a4be0d6?w=1200&q=80',
  
  // Urban & City (71-80)
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80',
  'https://images.unsplash.com/photo-1600566752229-250ed79c5e08?w=1200&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
  'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200&q=80',
  'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=1200&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80',
  'https://images.unsplash.com/photo-1560185127-6a7e4c0c4dee?w=1200&q=80',
  'https://images.unsplash.com/photo-1560184897-ae75f418493e?w=1200&q=80',
  'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=1200&q=80',
  'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=1200&q=80',
  
  // Modern Interiors (81-90)
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80',
  'https://images.unsplash.com/photo-1556912998-c57cc6b63cd7?w=1200&q=80',
  'https://images.unsplash.com/photo-1556912167-f556f1f39faa?w=1200&q=80',
  'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=1200&q=80',
  'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=1200&q=80',
  'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=1200&q=80',
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80',
  'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&q=80',
  'https://images.unsplash.com/photo-1615876234886-fd9a39fda97f?w=1200&q=80',
  'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&q=80',
  
  // Unique Properties (91-100)
  'https://images.unsplash.com/photo-1615873968403-89e068629265?w=1200&q=80',
  'https://images.unsplash.com/photo-1600047509358-9dc75507daeb?w=1200&q=80',
  'https://images.unsplash.com/photo-1600047509782-20d39509f26d?w=1200&q=80',
  'https://images.unsplash.com/photo-1600047509920-082d840e5ded?w=1200&q=80',
  'https://images.unsplash.com/photo-1600047510358-4d2c92d8d643?w=1200&q=80',
  'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200&q=80',
  'https://images.unsplash.com/photo-1566195992011-5f6b21e539aa?w=1200&q=80',
  'https://images.unsplash.com/photo-1567428485548-95ec27ade111?w=1200&q=80',
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&q=80',
  'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&q=80',
];

const destDir = path.join(__dirname, 'public', 'images', 'listings');

// Create directory if it doesn't exist
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
  console.log(`Created directory: ${destDir}`);
}

function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const filepath = path.join(destDir, filename);
    
    // Skip if file already exists
    if (fs.existsSync(filepath)) {
      console.log(`⏭️  Skipped (exists): ${filename}`);
      resolve();
      return;
    }

    const file = fs.createWriteStream(filepath);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`✅ Downloaded: ${filename}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

async function downloadAllImages() {
  console.log('🚀 Starting download of images 51-100...\n');
  console.log(`📁 Destination: ${destDir}\n`);
  
  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < unsplashImageUrls.length; i++) {
    const url = unsplashImageUrls[i];
    const imageNumber = i + 51; // Start from 51
    const filename = `image-${imageNumber}.jpg`;
    
    try {
      await downloadImage(url, filename);
      if (fs.existsSync(path.join(destDir, filename))) {
        const stats = fs.statSync(path.join(destDir, filename));
        if (stats.size > 0) {
          successCount++;
        } else {
          skipCount++;
        }
      } else {
        skipCount++;
      }
      
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`❌ Error downloading ${filename}: ${error.message}`);
      errorCount++;
    }
  }
  
  // Check total count
  const allImages = fs.readdirSync(destDir).filter(f => f.endsWith('.jpg'));
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 Download Summary:');
  console.log(`✅ Successfully downloaded: ${successCount}`);
  console.log(`⏭️  Skipped (already exist): ${skipCount}`);
  console.log(`❌ Failed: ${errorCount}`);
  console.log(`📦 Total images in folder: ${allImages.length}`);
  console.log('='.repeat(50));
  
  if (allImages.length >= 100) {
    console.log('\n🎉 Congratulations! You now have 100+ images!');
  }
}

// Run the downloader
downloadAllImages().catch(console.error);

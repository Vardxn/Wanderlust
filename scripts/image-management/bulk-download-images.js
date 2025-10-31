// Bulk Image Downloader for Wanderlust Project
// Downloads high-quality property images from Unsplash
// Usage: node bulk-download-images.js

const https = require('https');
const fs = require('fs');
const path = require('path');

// Unsplash search queries for different property types
const searchQueries = [
  'luxury-villa', 'beachfront-property', 'mountain-cabin', 'city-apartment',
  'desert-resort', 'tropical-villa', 'modern-loft', 'historic-mansion',
  'penthouse-view', 'cottage-countryside', 'ski-chalet', 'island-resort',
  'traditional-ryokan', 'safari-lodge', 'treehouse-retreat', 'lake-house'
];

// Curated Unsplash image URLs - high quality vacation rental properties
const unsplashImageUrls = [
  // Luxury Villas & Resorts (1-10)
  'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=1200&q=80', // Luxury villa
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80', // Modern house
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80', // Villa with pool
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80', // House exterior
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80', // Modern interior
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80', // Apartment
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80', // Living room
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=80', // Kitchen
  'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200&q=80', // Bedroom
  'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=1200&q=80', // Bathroom
  
  // Beach & Ocean Properties (11-20)
  'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1200&q=80', // Beach house
  'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1200&q=80', // Tropical resort
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80', // Beach villa
  'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=1200&q=80', // Ocean view
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80', // Beach resort
  'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&q=80', // Island villa
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80', // Luxury hotel
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80', // Pool view
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80', // Hotel room
  'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=1200&q=80', // Boutique hotel
  
  // Mountain & Cabin Properties (21-30)
  'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1200&q=80', // Mountain cabin
  'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=1200&q=80', // Ski resort
  'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=1200&q=80', // Mountain house
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80', // Mountain view
  'https://images.unsplash.com/photo-1486304873000-235643847519?w=1200&q=80', // Chalet
  'https://images.unsplash.com/photo-1464093515883-ec948246accb?w=1200&q=80', // Alpine cabin
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80', // Lake house
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&q=80', // Lakefront
  'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=1200&q=80', // Nature retreat
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80', // Forest cabin
  
  // City Apartments & Penthouses (31-40)
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80', // City apartment
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80', // Penthouse
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80', // Modern loft
  'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=1200&q=80', // Urban apartment
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80', // Studio apartment
  'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=1200&q=80', // High rise
  'https://images.unsplash.com/photo-1494526585095-c41746248156?w=1200&q=80', // City view
  'https://images.unsplash.com/photo-1515263487990-61b07816b324?w=1200&q=80', // Skyline view
  'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1200&q=80', // Urban loft
  'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=1200&q=80', // City lights
  
  // Unique Properties (41-50)
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80', // Boutique hotel
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80', // Desert resort
  'https://images.unsplash.com/photo-1568495248636-6432b97bd949?w=1200&q=80', // Traditional house
  'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80', // Castle
  'https://images.unsplash.com/photo-1601918774946-25832a4be0d6?w=1200&q=80', // Countryside
  'https://images.unsplash.com/photo-1600047509782-20d39509f26d?w=1200&q=80', // Garden view
  'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=1200&q=80', // Resort pool
  'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=1200&q=80', // Infinity pool
  'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1200&q=80', // Spa resort
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80', // Premium view
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
  console.log('🚀 Starting bulk image download...\n');
  console.log(`📁 Destination: ${destDir}\n`);
  
  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < unsplashImageUrls.length; i++) {
    const url = unsplashImageUrls[i];
    const filename = `image-${i + 1}.jpg`;
    
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
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 Download Summary:');
  console.log(`✅ Successfully downloaded: ${successCount}`);
  console.log(`⏭️  Skipped (already exist): ${skipCount}`);
  console.log(`❌ Failed: ${errorCount}`);
  console.log(`📦 Total images in folder: ${fs.readdirSync(destDir).filter(f => f.endsWith('.jpg')).length}`);
  console.log('='.repeat(50));
}

// Run the downloader
downloadAllImages().catch(console.error);

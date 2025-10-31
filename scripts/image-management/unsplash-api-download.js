// Unsplash API Image Downloader
// Uses Unsplash API to download curated property images
// 
// SETUP:
// 1. Sign up at https://unsplash.com/developers
// 2. Create a new application
// 3. Copy your Access Key
// 4. Replace YOUR_ACCESS_KEY below
//
// Usage: node unsplash-api-download.js

const https = require('https');
const fs = require('fs');
const path = require('path');

// ⚠️ REPLACE WITH YOUR UNSPLASH ACCESS KEY
const UNSPLASH_ACCESS_KEY = '8ZAK92bcMyAoWkZHghNCVqG2FnArqUgGsJ-OebcfmwQ';

// Property categories to search for
const categories = [
  'luxury villa',
  'beach house',
  'mountain cabin',
  'city apartment',
  'penthouse',
  'cottage',
  'resort',
  'hotel room',
  'vacation rental',
  'airbnb property'
];

const destDir = path.join(__dirname, 'public', 'images', 'listings');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

function searchUnsplash(query, perPage = 10) {
  return new Promise((resolve, reject) => {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=landscape`;
    
    const options = {
      headers: {
        'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
      }
    };
    
    https.get(url, options, (response) => {
      let data = '';
      
      response.on('data', chunk => data += chunk);
      response.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          
          if (parsed.errors) {
            console.error('   ⚠️  API Error:', parsed.errors);
            resolve([]);
            return;
          }
          
          resolve(parsed.results || []);
        } catch (err) {
          console.error('   ⚠️  Parse Error:', err.message);
          resolve([]);
        }
      });
    }).on('error', (err) => {
      console.error('   ⚠️  Request Error:', err.message);
      resolve([]);
    });
  });
}

function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const filepath = path.join(destDir, filename);
    
    if (fs.existsSync(filepath)) {
      console.log(`⏭️  Skipped: ${filename}`);
      resolve();
      return;
    }

    const file = fs.createWriteStream(filepath);
    
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Follow redirect
        https.get(response.headers.location, (redirectResponse) => {
          redirectResponse.pipe(file);
          file.on('finish', () => {
            file.close();
            console.log(`✅ Downloaded: ${filename}`);
            resolve();
          });
        }).on('error', reject);
      } else {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`✅ Downloaded: ${filename}`);
          resolve();
        });
      }
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

async function main() {
  if (UNSPLASH_ACCESS_KEY === 'YOUR_ACCESS_KEY_HERE') {
    console.error('❌ ERROR: Please set your Unsplash Access Key first!');
    console.log('\n📝 Steps to get your Access Key:');
    console.log('1. Go to https://unsplash.com/developers');
    console.log('2. Register as a developer');
    console.log('3. Create a new application');
    console.log('4. Copy your Access Key');
    console.log('5. Replace YOUR_ACCESS_KEY_HERE in this file\n');
    process.exit(1);
  }

  console.log('🚀 Starting Unsplash API image download...\n');
  
  let imageCount = 1;
  let totalDownloaded = 0;
  
  for (const category of categories) {
    console.log(`\n🔍 Searching for: "${category}"`);
    
    try {
      const results = await searchUnsplash(category, 5);
      
      console.log(`   Found ${results.length} images`);
      
      for (const photo of results) {
        const imageUrl = photo.urls.regular; // High quality
        const filename = `image-${imageCount}.jpg`;
        
        try {
          await downloadImage(imageUrl, filename);
          totalDownloaded++;
        } catch (err) {
          console.error(`   ❌ Failed to download ${filename}: ${err.message}`);
        }
        
        imageCount++;
        
        // Respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`❌ Error searching for "${category}":`, error.message);
    }
  }
  
  console.log(`\n${'='.repeat(50)}`);
  console.log(`✅ Download complete!`);
  console.log(`📊 Total images processed: ${imageCount - 1}`);
  console.log(`📥 Successfully downloaded: ${totalDownloaded}`);
  console.log(`📁 Location: ${destDir}`);
  console.log('='.repeat(50));
}

main().catch(console.error);

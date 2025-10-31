// Comprehensive Image Checker
// Checks all images in database and identifies broken ones
// Usage: node check-all-images.js

const mongoose = require('mongoose');
const Listing = require('./models/listing');
const fs = require('fs');
const path = require('path');

mongoose.connect('mongodb://localhost:27017/wanderlust')
  .then(async () => {
    console.log('🔍 COMPREHENSIVE IMAGE CHECK\n');
    console.log('='.repeat(90));
    
    const listings = await Listing.find({});
    console.log(`Total listings in database: ${listings.length}\n`);
    
    // Check available images in folder
    const imagesDir = path.join(__dirname, 'public/images/listings');
    const availableImages = fs.readdirSync(imagesDir)
      .filter(f => f.endsWith('.jpg'))
      .sort();
    
    console.log(`Total images in folder: ${availableImages.length}`);
    console.log('='.repeat(90));
    
    // Group listings by their image filename
    const imageUsage = {};
    const brokenListings = [];
    const workingListings = [];
    
    for (const listing of listings) {
      const imgFilename = listing.image.filename;
      const imgPath = path.join(imagesDir, imgFilename);
      const exists = fs.existsSync(imgPath);
      
      if (!imageUsage[imgFilename]) {
        imageUsage[imgFilename] = {
          count: 0,
          exists: exists,
          listings: []
        };
      }
      
      imageUsage[imgFilename].count++;
      imageUsage[imgFilename].listings.push(listing.title);
      
      if (!exists) {
        brokenListings.push({
          title: listing.title,
          location: listing.location,
          country: listing.country,
          imageFile: imgFilename
        });
      } else {
        workingListings.push({
          title: listing.title,
          imageFile: imgFilename
        });
      }
    }
    
    // Display broken images
    if (brokenListings.length > 0) {
      console.log('\n🚨 BROKEN IMAGES (' + brokenListings.length + ' listings affected):\n');
      brokenListings.forEach((listing, i) => {
        console.log(`  ${(i+1).toString().padStart(3)}. ${listing.title.padEnd(45)} -> ${listing.imageFile}`);
      });
    } else {
      console.log('\n✅ NO BROKEN IMAGES - All listings have valid images!');
    }
    
    // Display duplicate image usage
    const duplicates = Object.keys(imageUsage).filter(k => imageUsage[k].count > 1 && imageUsage[k].exists);
    if (duplicates.length > 0) {
      console.log('\n⚠️  DUPLICATE IMAGE USAGE (' + duplicates.length + ' images used multiple times):\n');
      duplicates.forEach(imgName => {
        console.log(`  ${imgName} - used ${imageUsage[imgName].count} times:`);
        imageUsage[imgName].listings.forEach(title => {
          console.log(`    - ${title}`);
        });
      });
    }
    
    // Summary
    console.log('\n' + '='.repeat(90));
    console.log('📊 SUMMARY:');
    console.log('  Total Listings: ' + listings.length);
    console.log('  ✅ Working Images: ' + workingListings.length);
    console.log('  ❌ Broken Images: ' + brokenListings.length);
    console.log('  📁 Images in Folder: ' + availableImages.length);
    console.log('  🔄 Duplicates: ' + duplicates.length);
    console.log('='.repeat(90));
    
    // Suggest fixes
    if (brokenListings.length > 0) {
      console.log('\n💡 SUGGESTED FIX:');
      console.log('  Run: node complete-fix-images.js');
      console.log('  Then: node init/index.js');
    }
    
    await mongoose.connection.close();
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });

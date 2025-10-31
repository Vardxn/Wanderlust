// Fix Image Assignments - Assign Sequential Images to Listings
// This script updates data.js to assign image-1.jpg to listing 1, image-2.jpg to listing 2, etc.
// Usage: node fix-image-assignments.js

const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, 'init', 'data.js');

console.log('🔧 Fixing image assignments in data.js...\n');

// Read the file
let content = fs.readFileSync(dataFilePath, 'utf8');

// Track listings
const listings = require('./init/data.js');
console.log(`Found ${listings.length} listings\n`);

// Create a mapping of old to new image names
const replacements = [];

listings.forEach((listing, index) => {
  const listingNumber = index + 1;
  const newImageName = `image-${listingNumber}.jpg`;
  const oldImageName = listing.image.filename;
  
  if (oldImageName !== newImageName) {
    replacements.push({
      listing: listingNumber,
      title: listing.title,
      old: oldImageName,
      new: newImageName
    });
  }
});

console.log(`📊 Found ${replacements.length} images that need reassignment\n`);

if (replacements.length === 0) {
  console.log('✅ All images are already correctly assigned!');
  process.exit(0);
}

console.log('Making replacements...\n');

// Replace image filenames in the file
replacements.forEach((rep, i) => {
  // Replace filename
  const filenameRegex = new RegExp(`filename:\\s*["']${rep.old.replace(/[()]/g, '\\$&')}["']`, 'g');
  const urlRegex = new RegExp(`url:\\s*["']/images/listings/${rep.old.replace(/[()]/g, '\\$&')}["']`, 'g');
  
  const newFilename = `filename: "${rep.new}"`;
  const newUrl = `url: "/images/listings/${rep.new}"`;
  
  content = content.replace(filenameRegex, newFilename);
  content = content.replace(urlRegex, newUrl);
  
  console.log(`  ${(i+1).toString().padStart(3, ' ')}. Listing ${rep.listing.toString().padStart(3, ' ')} - ${rep.title.substring(0, 35).padEnd(35, ' ')} : ${rep.old} → ${rep.new}`);
});

// Write back to file
fs.writeFileSync(dataFilePath, content, 'utf8');

console.log('\n' + '='.repeat(70));
console.log('✅ Successfully updated image assignments!');
console.log(`📝 ${replacements.length} images reassigned`);
console.log('📁 File updated: init/data.js');
console.log('='.repeat(70));
console.log('\n⚠️  Next step: Run "node init/index.js" to update the database');

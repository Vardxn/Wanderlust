// Complete Fix - Reassign ALL images sequentially from 1 to 100
// This script reads the entire data.js and rewrites ALL image assignments
// Usage: node complete-fix-images.js

const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, 'init', 'data.js');

console.log('🔧 Complete Image Assignment Fix\n');
console.log('This will reassign ALL 100 listings to use images 1-100 sequentially.\n');

// Read the current file
let content = fs.readFileSync(dataFilePath, 'utf8');

// Load the current listings to see their order
const listings = require('./init/data.js');
console.log(`Found ${listings.length} listings\n`);

// Create an array to track all changes
const changes = [];

// For each listing, we'll replace its image assignment
listings.forEach((listing, index) => {
  const listingNum = index + 1;
  const correctImage = `image-${listingNum}.jpg`;
  const currentImage = listing.image.filename;
  
  if (currentImage !== correctImage) {
    changes.push({
      num: listingNum,
      title: listing.title,
      old: currentImage,
      new: correctImage
    });
  }
});

console.log(`📊 Need to fix: ${changes.length} listings\n`);

if (changes.length === 0) {
  console.log('✅ All images already correctly assigned!');
  process.exit(0);
}

// Read the file line by line and rebuild it
const lines = content.split('\n');
const newLines = [];
let currentListingIndex = 0;
let inImageBlock = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Check if we're entering an image block
  if (line.trim().startsWith('image: {')) {
    inImageBlock = true;
  }
  
  // Replace filename line
  if (inImageBlock && line.includes('filename:')) {
    const correctImage = `image-${currentListingIndex + 1}.jpg`;
    newLines.push(line.replace(/filename:\s*["'][^"']+["']/, `filename: "${correctImage}"`));
  }
  // Replace url line
  else if (inImageBlock && line.includes('url:')) {
    const correctImage = `image-${currentListingIndex + 1}.jpg`;
    newLines.push(line.replace(/url:\s*["'][^"']+["']/, `url: "/images/listings/${correctImage}"`));
    inImageBlock = false;
  }
  // Check for price line (indicates we've completed a listing)
  else if (line.trim().startsWith('price:')) {
    newLines.push(line);
    // After price, we're done with this listing
  }
  // Check for closing brace of a listing
  else if (line.trim() === '},') {
    newLines.push(line);
    // Check if this completes a listing (next non-empty line is either '{' or ']')
    let nextLineIndex = i + 1;
    while (nextLineIndex < lines.length && lines[nextLineIndex].trim() === '') {
      nextLineIndex++;
    }
    if (nextLineIndex < lines.length) {
      const nextLine = lines[nextLineIndex].trim();
      if (nextLine.startsWith('{') || nextLine.startsWith('//')) {
        currentListingIndex++;
      }
    }
  }
  else {
    newLines.push(line);
  }
}

// Write the corrected content
fs.writeFileSync(dataFilePath, newLines.join('\n'), 'utf8');

console.log('='.repeat(70));
console.log('✅ Successfully updated ALL image assignments!');
console.log(`📝 Fixed ${changes.length} image assignments`);
console.log('📁 File updated: init/data.js');
console.log('='.repeat(70));
console.log('\n⚠️  Next step: Run "node init/index.js" to update the database');

// Rename Images Sequentially (1-100)
// This script renames all images to image-1.jpg through image-100.jpg
// Usage: node rename-images-sequential.js

const fs = require('fs');
const path = require('path');

const listingsDir = path.join(__dirname, 'public', 'images', 'listings');

console.log('🔄 Starting image renaming process...\n');
console.log(`📁 Directory: ${listingsDir}\n`);

// Get all JPG files
const allFiles = fs.readdirSync(listingsDir)
  .filter(f => f.toLowerCase().endsWith('.jpg'))
  .sort();

console.log(`📊 Found ${allFiles.length} images\n`);

// Create a temporary directory to avoid conflicts
const tempDir = path.join(listingsDir, 'temp_rename');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

console.log('Step 1: Moving images to temporary directory...\n');

// Move all files to temp directory first
allFiles.forEach((file, index) => {
  const oldPath = path.join(listingsDir, file);
  const tempPath = path.join(tempDir, `temp-${index + 1}.jpg`);
  fs.renameSync(oldPath, tempPath);
  console.log(`  Moved: ${file} → temp-${index + 1}.jpg`);
});

console.log('\nStep 2: Renaming to final sequential names (1-100)...\n');

// Now rename from temp to final names (limit to 100)
const filesToRename = Math.min(allFiles.length, 100);

for (let i = 0; i < filesToRename; i++) {
  const tempPath = path.join(tempDir, `temp-${i + 1}.jpg`);
  const finalPath = path.join(listingsDir, `image-${i + 1}.jpg`);
  fs.renameSync(tempPath, finalPath);
  console.log(`  ✅ Created: image-${i + 1}.jpg`);
}

// If there are more than 100, keep the rest in temp or delete
if (allFiles.length > 100) {
  console.log(`\n⚠️  Found ${allFiles.length - 100} extra images beyond 100.`);
  console.log('Keeping them in temp directory. Delete temp_rename folder if not needed.\n');
} else {
  // Remove temp directory if empty
  const remainingTemp = fs.readdirSync(tempDir);
  if (remainingTemp.length === 0) {
    fs.rmdirSync(tempDir);
    console.log('\n🗑️  Removed temporary directory\n');
  }
}

console.log('='.repeat(60));
console.log('✅ Renaming Complete!');
console.log(`📊 Renamed ${filesToRename} images sequentially (image-1.jpg to image-${filesToRename}.jpg)`);
console.log('='.repeat(60));

// List final count
const finalImages = fs.readdirSync(listingsDir)
  .filter(f => f.toLowerCase().endsWith('.jpg') && f.startsWith('image-'))
  .sort((a, b) => {
    const numA = parseInt(a.match(/\d+/)[0]);
    const numB = parseInt(b.match(/\d+/)[0]);
    return numA - numB;
  });

console.log(`\n📦 Total sequential images: ${finalImages.length}`);
console.log(`📋 First: ${finalImages[0]}`);
console.log(`📋 Last: ${finalImages[finalImages.length - 1]}`);

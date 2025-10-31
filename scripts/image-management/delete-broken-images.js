const fs = require('fs');
const path = require('path');

// Image numbers that need replacement
const brokenImageNumbers = [10, 16, 24, 25, 48, 50, 65, 67, 71, 76, 83, 95, 96, 99];

const outputDir = path.join(__dirname, 'public', 'images', 'listings');

console.log('🗑️  Deleting broken images...\n');

brokenImageNumbers.forEach(num => {
  const filename = `image-${num}.jpg`;
  const filePath = path.join(outputDir, filename);
  
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`✅ Deleted ${filename}`);
  } else {
    console.log(`⚠️  ${filename} not found`);
  }
});

console.log('\n✅ All broken images deleted successfully!');

const fs = require('fs');
const path = require('path');

// Image numbers that were replaced
const replacedImageNumbers = [10, 16, 24, 25, 48, 50, 65, 67, 71, 76, 83, 95, 96, 99];

const outputDir = path.join(__dirname, 'public', 'images', 'listings');

console.log('🔍 Verifying replacement images...\n');

let allGood = true;

replacedImageNumbers.forEach(num => {
  const filename = `image-${num}.jpg`;
  const filePath = path.join(outputDir, filename);
  
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    console.log(`✅ ${filename.padEnd(15)} - ${sizeKB} KB`);
  } else {
    console.log(`❌ ${filename.padEnd(15)} - MISSING!`);
    allGood = false;
  }
});

console.log('\n' + '='.repeat(50));
if (allGood) {
  console.log('✅ SUCCESS! All 14 replacement images are present and valid!');
} else {
  console.log('❌ FAILED! Some images are missing.');
}
console.log('='.repeat(50));

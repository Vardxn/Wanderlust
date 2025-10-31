const fs = require('fs');
const path = require('path');

// Listing numbers to remove sequence from (the ones that had broken images)
const listingsToFix = [10, 16, 24, 25, 48, 50, 65, 67, 71, 76, 83, 95, 96, 99];

const dataFilePath = path.join(__dirname, 'init', 'data.js');
const data = fs.readFileSync(dataFilePath, 'utf8');

// Split the file into lines
const lines = data.split('\n');
let currentListingNumber = 0;
let updatedLines = [];

for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  
  // Check if this line contains a title
  if (line.trim().startsWith('title:')) {
    currentListingNumber++;
    
    // Only process if this is one of the listings we want to fix
    if (listingsToFix.includes(currentListingNumber)) {
      // Extract the current title
      const match = line.match(/title:\s*"(.+?)"/);
      if (match) {
        const currentTitle = match[1];
        
        // Check if the title starts with a number followed by a dot
        const numberMatch = currentTitle.match(/^(\d+)\.\s(.+)/);
        if (numberMatch) {
          const titleWithoutNumber = numberMatch[2];
          line = line.replace(`title: "${currentTitle}"`, `title: "${titleWithoutNumber}"`);
          console.log(`${currentListingNumber}. Removed number: "${currentTitle}" -> "${titleWithoutNumber}"`);
        } else {
          console.log(`${currentListingNumber}. No number to remove: "${currentTitle}"`);
        }
      }
    }
  }
  
  updatedLines.push(line);
}

// Write back to file
const updatedContent = updatedLines.join('\n');
fs.writeFileSync(dataFilePath, updatedContent, 'utf8');

console.log('\n✅ Sequence numbers removed from the 14 specified listings!');
console.log(`Listings updated: ${listingsToFix.join(', ')}`);

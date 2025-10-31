const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, 'init', 'data.js');
const data = fs.readFileSync(dataFilePath, 'utf8');

// Split the file into lines
const lines = data.split('\n');
let currentListingNumber = 0;
let insideTitleLine = false;
let updatedLines = [];

for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  
  // Check if this line contains a title
  if (line.trim().startsWith('title:')) {
    currentListingNumber++;
    
    // Extract the current title
    const match = line.match(/title:\s*"(.+?)"/);
    if (match) {
      const currentTitle = match[1];
      
      // Check if the title already starts with a number followed by a dot
      const hasNumber = /^\d+\.\s/.test(currentTitle);
      
      if (!hasNumber) {
        // Add the sequence number
        const newTitle = `${currentListingNumber}. ${currentTitle}`;
        line = line.replace(`title: "${currentTitle}"`, `title: "${newTitle}"`);
        console.log(`${currentListingNumber}. Added number to: "${currentTitle}" -> "${newTitle}"`);
      } else {
        console.log(`${currentListingNumber}. Already has number: "${currentTitle}"`);
      }
    }
  }
  
  updatedLines.push(line);
}

// Write back to file
const updatedContent = updatedLines.join('\n');
fs.writeFileSync(dataFilePath, updatedContent, 'utf8');

console.log('\n✅ All listing titles updated with sequence numbers!');
console.log(`Total listings processed: ${currentListingNumber}`);

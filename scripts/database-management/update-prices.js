const fs = require('fs');
const path = require('path');

const dataFilePath = path.join(__dirname, 'init', 'data.js');
const data = fs.readFileSync(dataFilePath, 'utf8');

// Function to generate random price between 25000 and 100000, rounded to nearest 1000
function generateRandomPrice() {
  const min = 25000;
  const max = 100000;
  const randomPrice = Math.floor(Math.random() * (max - min + 1)) + min;
  // Round to nearest 1000
  return Math.round(randomPrice / 1000) * 1000;
}

// Split the file into lines
const lines = data.split('\n');
let currentListingNumber = 0;
let updatedLines = [];

for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  
  // Check if this line contains a price
  if (line.trim().startsWith('price:')) {
    currentListingNumber++;
    
    // Extract the current price
    const match = line.match(/price:\s*(\d+)/);
    if (match) {
      const oldPrice = match[1];
      const newPrice = generateRandomPrice();
      
      line = line.replace(`price: ${oldPrice}`, `price: ${newPrice}`);
      console.log(`${currentListingNumber.toString().padStart(3)}. Updated price: ₹${oldPrice.padStart(6)} -> ₹${newPrice.toLocaleString('en-IN')}`);
    }
  }
  
  updatedLines.push(line);
}

// Write back to file
const updatedContent = updatedLines.join('\n');
fs.writeFileSync(dataFilePath, updatedContent, 'utf8');

console.log('\n✅ All listing prices updated!');
console.log(`Total listings processed: ${currentListingNumber}`);
console.log('Price range: ₹25,000 - ₹1,00,000 per night (rounded to nearest ₹1,000)');

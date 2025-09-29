const mongoose = require('mongoose');
const data = require('./data');
const Listing = require('../models/listing');

// Connect to MongoDB - FIXED to match app.js
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust'); // Changed this line

    // Seed the database
    await Listing.deleteMany({});
    await Listing.insertMany(data);

    console.log('Database seeded with', data.length, 'listings!');
    mongoose.connection.close();
}

main().catch((err) => {
    console.error('Error seeding database:', err);
});
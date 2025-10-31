const mongoose = require('mongoose');
const data = require('./data');
const Listing = require('../models/listing');

// Connect to MongoDB - Use same connection string as app.js
async function main() {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wanderlust';
    await mongoose.connect(MONGODB_URI);

    // Seed the database
    await Listing.deleteMany({});
    await Listing.insertMany(data);

    console.log('Database seeded with', data.length, 'listings!');
    mongoose.connection.close();
}

main().catch((err) => {
    console.error('Error seeding database:', err);
});
const mongoose = require('mongoose');
const data = require('./data');
const Listing = require('../models/listing');

// Connect to MongoDB
async function main() {
    await mongoose.connect('mongodb://localhost:27017/wanderlust');

    // Seed the database
    await Listing.deleteMany({});
    await Listing.insertMany(data);

    console.log('Database seeded!');
    mongoose.connection.close();
}

main().catch((err) => {
    console.error('Error seeding database:', err);
});
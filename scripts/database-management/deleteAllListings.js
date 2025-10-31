// deleteAllListings.js
// Run this script with: node deleteAllListings.js

const mongoose = require('mongoose');
const Listing = require('./models/listing');

// Replace with your actual MongoDB connection string if different
const dbUrl = 'mongodb://127.0.0.1:27017/wanderlust';

mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', async () => {
  try {
    const result = await Listing.deleteMany({});
    console.log(`Deleted ${result.deletedCount} listings.`);
  } catch (err) {
    console.error('Error deleting listings:', err);
  } finally {
    mongoose.connection.close();
  }
});

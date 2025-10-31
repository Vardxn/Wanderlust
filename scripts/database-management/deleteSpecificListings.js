// deleteSpecificListings.js
// Run this script with: node deleteSpecificListings.js

const mongoose = require('mongoose');
const Listing = require('./models/listing');

const dbUrl = 'mongodb://127.0.0.1:27017/wanderlust';

mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', async () => {
  try {
    const titlesToDelete = [
      'Cozy Chalet in the French Alps',
      'Traditional Riad in Marrakech',
      'Vineyard Estate in Napa Valley',
      'Luxury Apartment in Paris'
    ];
    const result = await Listing.deleteMany({ title: { $in: titlesToDelete } });
    console.log(`Deleted ${result.deletedCount} listings.`);
  } catch (err) {
    console.error('Error deleting listings:', err);
  } finally {
    mongoose.connection.close();
  }
});

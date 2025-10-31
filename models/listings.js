const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    image: String,
    price: Number,
    location: String,
    country: String
});

module.exports = mongoose.model('Listing', listingSchema);
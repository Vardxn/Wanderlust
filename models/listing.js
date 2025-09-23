const mongoose = require('mongoose');
const { Schema } = mongoose;

const listingSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: {
        type: {
            filename: String,
            url: String
        },
        required: true,
        default: {
            filename: "listingimage",
            url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
        }
    },
    location: { type: String, required: true },
    price: { type: Number, required: true },
    country: { type: String, required: true },
});

const Listing = mongoose.model('Listing', listingSchema);

module.exports = Listing;

const mongoose = require('mongoose');
const { Schema } = mongoose;
const Review = require('./review');

const listingSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    image: {
        url: String,
        filename: String
    },
    price: Number,
    location: String,
    country: String,
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }]
});

// Middleware to delete associated reviews when listing is deleted
listingSchema.post('findOneAndDelete', async function (listing) {
    if (listing.reviews.length) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
});

module.exports = mongoose.model("Listing", listingSchema);

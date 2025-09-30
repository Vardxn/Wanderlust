const mongoose = require('mongoose');
const { Schema } = mongoose;
const Review = require('./review');

const listingSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        url: {
            type: String,
            default: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8aG90ZWxzfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60'
        },
        filename: String
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    location: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Auto-populate an Unsplash image based on location/country if image is missing
listingSchema.pre('validate', function (next) {
    const hasCustomImage = this.image && typeof this.image.url === 'string' && this.image.url.trim().length > 0;
    if (!hasCustomImage) {
        const placeParts = [this.location, this.country].filter(Boolean);
        const place = placeParts.join(' ').trim() || this.title || 'travel';
        const encoded = encodeURIComponent(place);
        // Use Unsplash Source to fetch a relevant place photo
        this.image = this.image || {};
        this.image.url = `https://source.unsplash.com/800x800/?${encoded},city,landmark,travel`;
        if (!this.image.filename) {
            this.image.filename = 'unsplash-source';
        }
    }
    next();
});

// Delete all associated reviews when a listing is deleted
listingSchema.post('findOneAndDelete', async function (listing) {
    if (listing?.reviews?.length) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
});

const Listing = mongoose.model('Listing', listingSchema);
module.exports = Listing;

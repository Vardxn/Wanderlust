const mongoose = require('mongoose');
const { Schema } = mongoose;
const Review = require('./review');

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload', '/upload/w_200');
});

const opts = { toJSON: { virtuals: true } };

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
    coordinates: {
        lat: {
            type: Number,
            required: false
        },
        lng: {
            type: Number,
            required: false
        }
    },
    neighborhood: {
        description: {
            type: String,
            default: ''
        },
        highlights: [String]
    },
    locationDetails: {
        nearbyRestaurants: [{
            name: String,
            address: String,
            rating: Number,
            distance: Number
        }],
        nearbyCafes: [{
            name: String,
            address: String,
            rating: Number,
            distance: Number
        }],
        nearbyGroceryStores: [{
            name: String,
            address: String,
            rating: Number,
            distance: Number
        }],
        nearbyAttractions: [{
            name: String,
            address: String,
            rating: Number,
            distance: Number
        }],
        nearbyPublicTransport: [{
            name: String,
            address: String,
            distance: Number
        }],
        nearbyAirports: [{
            name: String,
            address: String,
            distance: Number
        }],
        walkabilityScore: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        },
        thingsToDo: [{
            name: String,
            description: String,
            category: String // culture, nature, food, adventure, etc.
        }]
    },
    // New filter fields
    propertyType: {
        type: String,
        enum: ['Villa', 'Apartment', 'Cabin', 'Penthouse', 'Cottage', 'Mansion', 'Treehouse', 'Houseboat', 'Castle', 'Other'],
        default: 'Apartment'
    },
    bedrooms: {
        type: Number,
        default: 1,
        min: 0
    },
    bathrooms: {
        type: Number,
        default: 1,
        min: 0
    },
    maxGuests: {
        type: Number,
        default: 2,
        min: 1
    },
    amenities: [{
        type: String,
        enum: [
            'WiFi', 
            'Kitchen', 
            'Air Conditioning', 
            'Heating', 
            'Swimming Pool', 
            'Hot Tub', 
            'Parking', 
            'Gym', 
            'Washer/Dryer', 
            'TV', 
            'Workspace', 
            'Pet-friendly',
            'Smoke Alarm',
            'First Aid Kit',
            'Fire Extinguisher',
            'Balcony',
            'Garden',
            'BBQ Grill'
        ]
    }],
    instantBook: {
        type: Boolean,
        default: false
    },
    // Property Details
    propertySize: {
        sqft: {
            type: Number,
            min: 0
        },
        sqm: {
            type: Number,
            min: 0
        }
    },
    bedConfiguration: [{
        roomName: String, // "Master Bedroom", "Guest Room 1", etc.
        bedType: {
            type: String,
            enum: ['King', 'Queen', 'Double', 'Single', 'Bunk Bed', 'Sofa Bed', 'Floor Mattress']
        },
        quantity: {
            type: Number,
            min: 1,
            default: 1
        }
    }],
    // House Rules
    houseRules: {
        checkInTime: {
            type: String,
            default: '2:00 PM'
        },
        checkOutTime: {
            type: String,
            default: '11:00 AM'
        },
        quietHours: {
            start: {
                type: String,
                default: '10:00 PM'
            },
            end: {
                type: String,
                default: '8:00 AM'
            }
        },
        smokingAllowed: {
            type: Boolean,
            default: false
        },
        partiesAllowed: {
            type: Boolean,
            default: false
        },
        petsAllowed: {
            type: Boolean,
            default: false
        },
        additionalRules: [{
            type: String
        }]
    },
    // Cancellation Policy
    cancellationPolicy: {
        type: {
            type: String,
            enum: ['Flexible', 'Moderate', 'Strict', 'Super Strict'],
            default: 'Moderate'
        },
        description: String
    },
    // Safety Features
    safetyFeatures: {
        smokeAlarm: {
            type: Boolean,
            default: false
        },
        carbonMonoxideAlarm: {
            type: Boolean,
            default: false
        },
        fireExtinguisher: {
            type: Boolean,
            default: false
        },
        firstAidKit: {
            type: Boolean,
            default: false
        },
        securityCameras: {
            present: {
                type: Boolean,
                default: false
            },
            locations: [{
                type: String // "Front Door", "Driveway", "Pool Area", etc.
            }]
        }
    },
    // Booking-related fields
    cleaningFee: {
        type: Number,
        default: 0,
        min: 0
    },
    serviceFee: {
        type: Number,
        default: 0,
        min: 0
    },
    minimumStay: {
        type: Number,
        default: 1,
        min: 1
    },
    maximumStay: {
        type: Number,
        default: 365
    },
    weeklyDiscount: {
        type: Number,
        default: 0,
        min: 0,
        max: 100 // Percentage
    },
    monthlyDiscount: {
        type: Number,
        default: 0,
        min: 0,
        max: 100 // Percentage
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
}, opts);

// Virtual for review count
listingSchema.virtual('reviewCount').get(function() {
    return this.reviews ? this.reviews.length : 0;
});

// Virtual for average rating
listingSchema.virtual('averageRating').get(function() {
    if (!this.reviews || this.reviews.length === 0) return 0;
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    return Math.round((sum / this.reviews.length) * 10) / 10;
});

// Index for geospatial queries
listingSchema.index({ coordinates: '2dsphere' });
listingSchema.index({ location: 1, price: 1 });
listingSchema.index({ country: 1 });
listingSchema.index({ createdAt: -1 });

// Text index for search
listingSchema.index({ 
    title: 'text', 
    description: 'text', 
    location: 'text', 
    country: 'text' 
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

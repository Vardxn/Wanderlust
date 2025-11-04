/**
 * Listing Schema (MongoDB)
 * Central collection for vacation rental properties
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * GeoJSON Point Schema for Location Coordinates
 */
const pointSchema = new Schema({
    type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point'
    },
    coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        validate: {
            validator: function(coords) {
                return coords.length === 2 &&
                       coords[0] >= -180 && coords[0] <= 180 && // longitude
                       coords[1] >= -90 && coords[1] <= 90;      // latitude
            },
            message: 'Coordinates must be [longitude, latitude] with valid ranges'
        }
    }
}, { _id: false });

/**
 * Location Sub-document Schema
 */
const locationSchema = new Schema({
    address: {
        type: String,
        required: [true, 'Street address is required'],
        trim: true
    },
    city: {
        type: String,
        required: [true, 'City is required'],
        trim: true,
        index: true
    },
    state: {
        type: String,
        required: [true, 'State is required'],
        trim: true
    },
    country: {
        type: String,
        required: [true, 'Country is required'],
        trim: true,
        index: true
    },
    zipCode: {
        type: String,
        required: [true, 'Zip code is required'],
        trim: true
    },
    coordinates: {
        type: pointSchema,
        required: false,
        index: '2dsphere' // Geospatial index for location-based queries
    }
}, { _id: false });

/**
 * Capacity Sub-document Schema
 */
const capacitySchema = new Schema({
    accommodates: {
        type: Number,
        required: [true, 'Accommodates is required'],
        min: [1, 'Must accommodate at least 1 guest'],
        max: [50, 'Accommodates cannot exceed 50 guests']
    },
    bedrooms: {
        type: Number,
        required: [true, 'Number of bedrooms is required'],
        min: [0, 'Bedrooms cannot be negative'],
        max: [50, 'Bedrooms cannot exceed 50']
    },
    beds: {
        type: Number,
        required: [true, 'Number of beds is required'],
        min: [0, 'Beds cannot be negative'],
        max: [100, 'Beds cannot exceed 100']
    },
    bathrooms: {
        type: Number,
        required: [true, 'Number of bathrooms is required'],
        min: [0, 'Bathrooms cannot be negative'],
        max: [50, 'Bathrooms cannot exceed 50'],
        // Allow decimal values like 1.5, 2.5
        get: v => Math.round(v * 10) / 10
    }
}, { _id: false });

/**
 * Pricing Sub-document Schema
 * All prices stored in cents to avoid floating-point issues
 */
const pricingSchema = new Schema({
    pricePerNight: {
        type: Number,
        required: [true, 'Price per night is required'],
        min: [100, 'Price must be at least $1.00 (100 cents)'], // $1.00 minimum
        validate: {
            validator: Number.isInteger,
            message: 'Price must be in cents (integer)'
        }
    },
    securityDeposit: {
        type: Number,
        default: 0,
        min: [0, 'Security deposit cannot be negative'],
        validate: {
            validator: Number.isInteger,
            message: 'Security deposit must be in cents (integer)'
        }
    },
    cleaningFee: {
        type: Number,
        default: 0,
        min: [0, 'Cleaning fee cannot be negative'],
        validate: {
            validator: Number.isInteger,
            message: 'Cleaning fee must be in cents (integer)'
        }
    }
}, { _id: false });

/**
 * Booking Rules Sub-document Schema
 */
const bookingRulesSchema = new Schema({
    minimumNights: {
        type: Number,
        default: 1,
        min: [1, 'Minimum nights must be at least 1'],
        max: [365, 'Minimum nights cannot exceed 365']
    },
    maximumNights: {
        type: Number,
        default: 365,
        min: [1, 'Maximum nights must be at least 1'],
        max: [1095, 'Maximum nights cannot exceed 1095 (3 years)'],
        validate: {
            validator: function(value) {
                return value >= this.minimumNights;
            },
            message: 'Maximum nights must be greater than or equal to minimum nights'
        }
    },
    checkInTime: {
        type: String,
        default: '15:00',
        match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Check-in time must be in HH:MM format']
    },
    checkOutTime: {
        type: String,
        default: '11:00',
        match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Check-out time must be in HH:MM format']
    },
    cancellationPolicy: {
        type: String,
        required: [true, 'Cancellation policy is required'],
        enum: {
            values: ['Flexible', 'Moderate', 'Strict', 'Super Strict 30', 'Super Strict 60'],
            message: '{VALUE} is not a valid cancellation policy'
        },
        default: 'Moderate'
    },
    instantBookable: {
        type: Boolean,
        default: false
    }
}, { _id: false });

/**
 * Photo Sub-document Schema
 */
const photoSchema = new Schema({
    url: {
        type: String,
        required: [true, 'Photo URL is required'],
        validate: {
            validator: function(v) {
                return /^https?:\/\/.+/.test(v);
            },
            message: 'Photo URL must be a valid URL'
        }
    },
    caption: {
        type: String,
        default: '',
        maxlength: [255, 'Caption is too long']
    },
    isCover: {
        type: Boolean,
        default: false
    },
    sortOrder: {
        type: Number,
        default: 0,
        min: [0, 'Sort order cannot be negative']
    }
}, { _id: true }); // Keep _id for individual photo tracking

/**
 * Review Scores Sub-document Schema
 * Aggregated from reviews for quick access
 */
const reviewScoresSchema = new Schema({
    rating: {
        type: Number,
        default: null,
        min: [1, 'Rating must be between 1 and 5'],
        max: [5, 'Rating must be between 1 and 5']
    },
    cleanliness: {
        type: Number,
        default: null,
        min: [1, 'Cleanliness rating must be between 1 and 5'],
        max: [5, 'Cleanliness rating must be between 1 and 5']
    },
    accuracy: {
        type: Number,
        default: null,
        min: [1, 'Accuracy rating must be between 1 and 5'],
        max: [5, 'Accuracy rating must be between 1 and 5']
    },
    checkin: {
        type: Number,
        default: null,
        min: [1, 'Check-in rating must be between 1 and 5'],
        max: [5, 'Check-in rating must be between 1 and 5']
    },
    communication: {
        type: Number,
        default: null,
        min: [1, 'Communication rating must be between 1 and 5'],
        max: [5, 'Communication rating must be between 1 and 5']
    },
    location: {
        type: Number,
        default: null,
        min: [1, 'Location rating must be between 1 and 5'],
        max: [5, 'Location rating must be between 1 and 5']
    },
    value: {
        type: Number,
        default: null,
        min: [1, 'Value rating must be between 1 and 5'],
        max: [5, 'Value rating must be between 1 and 5']
    },
    totalReviews: {
        type: Number,
        default: 0,
        min: [0, 'Total reviews cannot be negative']
    }
}, { _id: false });

/**
 * Main Listing Schema
 */
const listingSchema = new Schema({
    host: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Host is required'],
        index: true
    },
    name: {
        type: String,
        required: [true, 'Listing name is required'],
        trim: true,
        minlength: [10, 'Name must be at least 10 characters'],
        maxlength: [255, 'Name is too long']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        minlength: [50, 'Description must be at least 50 characters'],
        maxlength: [5000, 'Description is too long']
    },
    summary: {
        type: String,
        default: '',
        trim: true,
        maxlength: [500, 'Summary is too long']
    },
    space: {
        type: String,
        default: '',
        trim: true,
        maxlength: [2000, 'Space description is too long']
    },
    transitInfo: {
        type: String,
        default: '',
        trim: true,
        maxlength: [1000, 'Transit info is too long']
    },
    houseRules: {
        type: String,
        default: '',
        trim: true,
        maxlength: [2000, 'House rules are too long']
    },
    propertyType: {
        type: String,
        required: [true, 'Property type is required'],
        enum: {
            values: [
                'Apartment', 'House', 'Villa', 'Cottage', 'Condominium',
                'Townhouse', 'Loft', 'Bungalow', 'Cabin', 'Chalet',
                'Castle', 'Treehouse', 'Boat', 'Camper/RV', 'Tent',
                'Yurt', 'Tipi', 'Igloo', 'Cave', 'Farm Stay',
                'Bed & Breakfast', 'Boutique Hotel', 'Hostel', 'Resort',
                'Serviced Apartment', 'Studio', 'Guest Suite', 'Guesthouse'
            ],
            message: '{VALUE} is not a valid property type'
        }
    },
    roomType: {
        type: String,
        required: [true, 'Room type is required'],
        enum: {
            values: ['Entire home/apt', 'Private room', 'Shared room', 'Hotel room'],
            message: '{VALUE} is not a valid room type'
        }
    },
    location: {
        type: locationSchema,
        required: [true, 'Location is required']
    },
    capacity: {
        type: capacitySchema,
        required: [true, 'Capacity information is required']
    },
    pricing: {
        type: pricingSchema,
        required: [true, 'Pricing information is required']
    },
    bookingRules: {
        type: bookingRulesSchema,
        required: true,
        default: () => ({})
    },
    amenities: {
        type: [String],
        default: [],
        validate: {
            validator: function(arr) {
                return arr.length <= 100;
            },
            message: 'Cannot have more than 100 amenities'
        }
    },
    photos: {
        type: [photoSchema],
        default: [],
        validate: {
            validator: function(arr) {
                return arr.length >= 1 && arr.length <= 50;
            },
            message: 'Must have between 1 and 50 photos'
        }
    },
    reviewScores: {
        type: reviewScoresSchema,
        default: () => ({})
    },
    // Additional useful fields
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    viewCount: {
        type: Number,
        default: 0,
        min: [0, 'View count cannot be negative']
    },
    bookingCount: {
        type: Number,
        default: 0,
        min: [0, 'Booking count cannot be negative']
    }
}, {
    timestamps: true, // Adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

/**
 * Indexes
 */
listingSchema.index({ host: 1, isActive: 1 });
listingSchema.index({ 'location.city': 1, 'location.country': 1 });
listingSchema.index({ 'pricing.pricePerNight': 1 });
listingSchema.index({ propertyType: 1, roomType: 1 });
listingSchema.index({ 'capacity.accommodates': 1 });
listingSchema.index({ 'reviewScores.rating': -1 });
listingSchema.index({ createdAt: -1 });
listingSchema.index({ 'bookingRules.instantBookable': 1 });

// Compound text index for search
listingSchema.index({ 
    name: 'text', 
    description: 'text', 
    'location.city': 'text',
    'location.country': 'text'
});

/**
 * Virtual: Bookings
 */
listingSchema.virtual('bookings', {
    ref: 'Booking',
    localField: '_id',
    foreignField: 'listing'
});

/**
 * Virtual: Reviews
 */
listingSchema.virtual('reviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'listing'
});

/**
 * Virtual: Price in Dollars
 */
listingSchema.virtual('pricing.pricePerNightDollars').get(function() {
    return this.pricing.pricePerNight / 100;
});

/**
 * Virtual: Cover Photo
 */
listingSchema.virtual('coverPhoto').get(function() {
    if (this.photos && this.photos.length > 0) {
        const cover = this.photos.find(p => p.isCover);
        return cover || this.photos[0];
    }
    return null;
});

/**
 * Instance Method: Update Review Scores
 */
listingSchema.methods.updateReviewScores = async function() {
    const Review = mongoose.model('Review');
    
    const reviews = await Review.find({ listing: this._id });
    
    if (reviews.length === 0) {
        this.reviewScores = {
            rating: null,
            cleanliness: null,
            accuracy: null,
            checkin: null,
            communication: null,
            location: null,
            value: null,
            totalReviews: 0
        };
    } else {
        const sum = reviews.reduce((acc, review) => {
            acc.rating += review.ratings.overall;
            acc.cleanliness += review.ratings.cleanliness;
            acc.accuracy += review.ratings.accuracy;
            acc.checkin += review.ratings.checkin;
            acc.communication += review.ratings.communication;
            acc.location += review.ratings.location;
            acc.value += review.ratings.value;
            return acc;
        }, {
            rating: 0, cleanliness: 0, accuracy: 0, 
            checkin: 0, communication: 0, location: 0, value: 0
        });
        
        const count = reviews.length;
        
        this.reviewScores = {
            rating: Math.round((sum.rating / count) * 10) / 10,
            cleanliness: Math.round((sum.cleanliness / count) * 10) / 10,
            accuracy: Math.round((sum.accuracy / count) * 10) / 10,
            checkin: Math.round((sum.checkin / count) * 10) / 10,
            communication: Math.round((sum.communication / count) * 10) / 10,
            location: Math.round((sum.location / count) * 10) / 10,
            value: Math.round((sum.value / count) * 10) / 10,
            totalReviews: count
        };
    }
    
    return this.save();
};

/**
 * Instance Method: Check Availability
 */
listingSchema.methods.isAvailable = async function(checkIn, checkOut) {
    const Booking = mongoose.model('Booking');
    
    const overlappingBooking = await Booking.findOne({
        listing: this._id,
        status: { $in: ['pending', 'confirmed'] },
        $or: [
            {
                checkInDate: { $lte: checkIn },
                checkOutDate: { $gt: checkIn }
            },
            {
                checkInDate: { $lt: checkOut },
                checkOutDate: { $gte: checkOut }
            },
            {
                checkInDate: { $gte: checkIn },
                checkOutDate: { $lte: checkOut }
            }
        ]
    });
    
    return !overlappingBooking;
};

/**
 * Instance Method: Calculate Total Price
 */
listingSchema.methods.calculateTotalPrice = function(nights) {
    const basePrice = this.pricing.pricePerNight * nights;
    const cleaningFee = this.pricing.cleaningFee;
    const serviceFee = Math.round(basePrice * 0.14); // 14% service fee
    
    return {
        basePrice,
        cleaningFee,
        serviceFee,
        securityDeposit: this.pricing.securityDeposit,
        total: basePrice + cleaningFee + serviceFee
    };
};

/**
 * Static Method: Search Listings
 */
listingSchema.statics.searchListings = function(filters = {}) {
    const query = { isActive: true };
    
    if (filters.city) {
        query['location.city'] = new RegExp(filters.city, 'i');
    }
    if (filters.country) {
        query['location.country'] = new RegExp(filters.country, 'i');
    }
    if (filters.propertyType) {
        query.propertyType = filters.propertyType;
    }
    if (filters.roomType) {
        query.roomType = filters.roomType;
    }
    if (filters.minPrice) {
        query['pricing.pricePerNight'] = { $gte: filters.minPrice };
    }
    if (filters.maxPrice) {
        query['pricing.pricePerNight'] = query['pricing.pricePerNight'] || {};
        query['pricing.pricePerNight'].$lte = filters.maxPrice;
    }
    if (filters.guests) {
        query['capacity.accommodates'] = { $gte: filters.guests };
    }
    if (filters.bedrooms) {
        query['capacity.bedrooms'] = { $gte: filters.bedrooms };
    }
    if (filters.amenities && filters.amenities.length > 0) {
        query.amenities = { $all: filters.amenities };
    }
    if (filters.instantBookable) {
        query['bookingRules.instantBookable'] = true;
    }
    
    return this.find(query)
        .populate('host', 'firstName lastName profilePictureUrl hostProfile')
        .sort(filters.sort || { createdAt: -1 });
};

/**
 * Pre-save Middleware: Validate Photos
 */
listingSchema.pre('save', function(next) {
    // Ensure only one cover photo
    const coverPhotos = this.photos.filter(p => p.isCover);
    if (coverPhotos.length > 1) {
        // Keep only the first cover photo
        this.photos.forEach((photo, index) => {
            if (index > 0) {
                photo.isCover = false;
            }
        });
    } else if (coverPhotos.length === 0 && this.photos.length > 0) {
        // Set first photo as cover if no cover exists
        this.photos[0].isCover = true;
    }
    
    next();
});

/**
 * Pre-remove Middleware: Cleanup
 */
listingSchema.pre('remove', async function(next) {
    const Booking = mongoose.model('Booking');
    const Review = mongoose.model('Review');
    
    // Cancel all future bookings
    await Booking.updateMany(
        { 
            listing: this._id, 
            status: { $in: ['pending', 'confirmed'] },
            checkInDate: { $gte: new Date() }
        },
        { status: 'cancelled' }
    );
    
    // Delete all reviews
    await Review.deleteMany({ listing: this._id });
    
    next();
});

/**
 * Export Model
 */
module.exports = mongoose.model('Listing', listingSchema);

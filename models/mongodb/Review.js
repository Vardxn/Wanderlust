/**
 * Review Schema (MongoDB)
 * Detailed multi-category feedback from guests
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Ratings Sub-document Schema
 * All ratings must be between 1 and 5
 */
const ratingsSchema = new Schema({
    overall: {
        type: Number,
        required: [true, 'Overall rating is required'],
        min: [1, 'Overall rating must be between 1 and 5'],
        max: [5, 'Overall rating must be between 1 and 5'],
        validate: {
            validator: Number.isInteger,
            message: 'Overall rating must be an integer'
        }
    },
    cleanliness: {
        type: Number,
        required: [true, 'Cleanliness rating is required'],
        min: [1, 'Cleanliness rating must be between 1 and 5'],
        max: [5, 'Cleanliness rating must be between 1 and 5'],
        validate: {
            validator: Number.isInteger,
            message: 'Cleanliness rating must be an integer'
        }
    },
    accuracy: {
        type: Number,
        required: [true, 'Accuracy rating is required'],
        min: [1, 'Accuracy rating must be between 1 and 5'],
        max: [5, 'Accuracy rating must be between 1 and 5'],
        validate: {
            validator: Number.isInteger,
            message: 'Accuracy rating must be an integer'
        }
    },
    checkin: {
        type: Number,
        required: [true, 'Check-in rating is required'],
        min: [1, 'Check-in rating must be between 1 and 5'],
        max: [5, 'Check-in rating must be between 1 and 5'],
        validate: {
            validator: Number.isInteger,
            message: 'Check-in rating must be an integer'
        }
    },
    communication: {
        type: Number,
        required: [true, 'Communication rating is required'],
        min: [1, 'Communication rating must be between 1 and 5'],
        max: [5, 'Communication rating must be between 1 and 5'],
        validate: {
            validator: Number.isInteger,
            message: 'Communication rating must be an integer'
        }
    },
    location: {
        type: Number,
        required: [true, 'Location rating is required'],
        min: [1, 'Location rating must be between 1 and 5'],
        max: [5, 'Location rating must be between 1 and 5'],
        validate: {
            validator: Number.isInteger,
            message: 'Location rating must be an integer'
        }
    },
    value: {
        type: Number,
        required: [true, 'Value rating is required'],
        min: [1, 'Value rating must be between 1 and 5'],
        max: [5, 'Value rating must be between 1 and 5'],
        validate: {
            validator: Number.isInteger,
            message: 'Value rating must be an integer'
        }
    }
}, { _id: false });

/**
 * Main Review Schema
 */
const reviewSchema = new Schema({
    booking: {
        type: Schema.Types.ObjectId,
        ref: 'Booking',
        required: [true, 'Booking reference is required'],
        unique: true, // One review per booking
        index: true
    },
    guest: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Guest reference is required'],
        index: true
    },
    listing: {
        type: Schema.Types.ObjectId,
        ref: 'Listing',
        required: [true, 'Listing reference is required'],
        index: true
    },
    ratings: {
        type: ratingsSchema,
        required: [true, 'Ratings are required']
    },
    commentPublic: {
        type: String,
        default: '',
        trim: true,
        maxlength: [2000, 'Public comment is too long (max 2000 characters)']
    },
    commentPrivate: {
        type: String,
        default: '',
        trim: true,
        maxlength: [1000, 'Private comment is too long (max 1000 characters)']
    },
    // Additional useful fields
    isPublished: {
        type: Boolean,
        default: true
    },
    isFlagged: {
        type: Boolean,
        default: false
    },
    flagReason: {
        type: String,
        default: null,
        maxlength: [500, 'Flag reason is too long']
    },
    hostResponse: {
        type: String,
        default: null,
        trim: true,
        maxlength: [1000, 'Host response is too long']
    },
    hostRespondedAt: {
        type: Date,
        default: null
    },
    helpfulCount: {
        type: Number,
        default: 0,
        min: [0, 'Helpful count cannot be negative']
    },
    reportedCount: {
        type: Number,
        default: 0,
        min: [0, 'Reported count cannot be negative']
    }
}, {
    timestamps: true, // Adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

/**
 * Indexes
 */
reviewSchema.index({ listing: 1, createdAt: -1 });
reviewSchema.index({ guest: 1, createdAt: -1 });
reviewSchema.index({ 'ratings.overall': -1 });
reviewSchema.index({ isPublished: 1, isFlagged: 1 });
reviewSchema.index({ createdAt: -1 });

// Compound index for efficient queries
reviewSchema.index({ listing: 1, isPublished: 1, isFlagged: 1 });

/**
 * Virtual: Average Rating
 */
reviewSchema.virtual('averageRating').get(function() {
    if (!this.ratings) return 0;
    
    const sum = this.ratings.overall +
                this.ratings.cleanliness +
                this.ratings.accuracy +
                this.ratings.checkin +
                this.ratings.communication +
                this.ratings.location +
                this.ratings.value;
    
    return Math.round((sum / 7) * 10) / 10;
});

/**
 * Virtual: Has Public Comment
 */
reviewSchema.virtual('hasPublicComment').get(function() {
    return this.commentPublic && this.commentPublic.trim().length > 0;
});

/**
 * Virtual: Has Private Comment
 */
reviewSchema.virtual('hasPrivateComment').get(function() {
    return this.commentPrivate && this.commentPrivate.trim().length > 0;
});

/**
 * Virtual: Has Host Response
 */
reviewSchema.virtual('hasHostResponse').get(function() {
    return this.hostResponse && this.hostResponse.trim().length > 0;
});

/**
 * Virtual: Days Since Review
 */
reviewSchema.virtual('daysSinceReview').get(function() {
    if (!this.createdAt) return 0;
    
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.floor((new Date() - this.createdAt) / oneDay);
});

/**
 * Instance Method: Add Host Response
 */
reviewSchema.methods.addHostResponse = async function(responseText, hostId) {
    // Verify that the host owns the listing
    const Listing = mongoose.model('Listing');
    const listing = await Listing.findById(this.listing);
    
    if (!listing) {
        throw new Error('Listing not found');
    }
    
    if (listing.host.toString() !== hostId.toString()) {
        throw new Error('Only the listing host can respond to this review');
    }
    
    if (this.hostResponse) {
        throw new Error('Host has already responded to this review');
    }
    
    this.hostResponse = responseText;
    this.hostRespondedAt = new Date();
    
    return this.save();
};

/**
 * Instance Method: Flag Review
 */
reviewSchema.methods.flag = function(reason) {
    this.isFlagged = true;
    this.flagReason = reason;
    this.reportedCount += 1;
    
    return this.save();
};

/**
 * Instance Method: Unflag Review
 */
reviewSchema.methods.unflag = function() {
    this.isFlagged = false;
    this.flagReason = null;
    
    return this.save();
};

/**
 * Instance Method: Mark as Helpful
 */
reviewSchema.methods.markHelpful = function() {
    this.helpfulCount += 1;
    return this.save();
};

/**
 * Instance Method: Publish Review
 */
reviewSchema.methods.publish = function() {
    this.isPublished = true;
    return this.save();
};

/**
 * Instance Method: Unpublish Review
 */
reviewSchema.methods.unpublish = function() {
    this.isPublished = false;
    return this.save();
};

/**
 * Static Method: Get Listing Average Ratings
 */
reviewSchema.statics.getListingAverages = async function(listingId) {
    const reviews = await this.find({ 
        listing: listingId, 
        isPublished: true,
        isFlagged: false
    });
    
    if (reviews.length === 0) {
        return {
            overall: null,
            cleanliness: null,
            accuracy: null,
            checkin: null,
            communication: null,
            location: null,
            value: null,
            totalReviews: 0
        };
    }
    
    const sum = reviews.reduce((acc, review) => {
        acc.overall += review.ratings.overall;
        acc.cleanliness += review.ratings.cleanliness;
        acc.accuracy += review.ratings.accuracy;
        acc.checkin += review.ratings.checkin;
        acc.communication += review.ratings.communication;
        acc.location += review.ratings.location;
        acc.value += review.ratings.value;
        return acc;
    }, {
        overall: 0,
        cleanliness: 0,
        accuracy: 0,
        checkin: 0,
        communication: 0,
        location: 0,
        value: 0
    });
    
    const count = reviews.length;
    
    return {
        overall: Math.round((sum.overall / count) * 10) / 10,
        cleanliness: Math.round((sum.cleanliness / count) * 10) / 10,
        accuracy: Math.round((sum.accuracy / count) * 10) / 10,
        checkin: Math.round((sum.checkin / count) * 10) / 10,
        communication: Math.round((sum.communication / count) * 10) / 10,
        location: Math.round((sum.location / count) * 10) / 10,
        value: Math.round((sum.value / count) * 10) / 10,
        totalReviews: count
    };
};

/**
 * Static Method: Get Recent Reviews for Listing
 */
reviewSchema.statics.getRecentForListing = function(listingId, limit = 10) {
    return this.find({ 
        listing: listingId, 
        isPublished: true,
        isFlagged: false
    })
    .populate('guest', 'firstName lastName profilePictureUrl')
    .sort({ createdAt: -1 })
    .limit(limit);
};

/**
 * Static Method: Get Guest's Reviews
 */
reviewSchema.statics.getGuestReviews = function(guestId) {
    return this.find({ guest: guestId })
        .populate('listing', 'name location.city photos')
        .sort({ createdAt: -1 });
};

/**
 * Static Method: Get Host's Received Reviews
 */
reviewSchema.statics.getHostReceivedReviews = async function(hostId) {
    const Listing = mongoose.model('Listing');
    const listings = await Listing.find({ host: hostId }).select('_id');
    const listingIds = listings.map(l => l._id);
    
    return this.find({ 
        listing: { $in: listingIds },
        isPublished: true,
        isFlagged: false
    })
    .populate('guest', 'firstName lastName profilePictureUrl')
    .populate('listing', 'name')
    .sort({ createdAt: -1 });
};

/**
 * Static Method: Get Statistics
 */
reviewSchema.statics.getStatistics = async function(listingId) {
    const reviews = await this.find({ 
        listing: listingId,
        isPublished: true,
        isFlagged: false
    });
    
    if (reviews.length === 0) {
        return {
            totalReviews: 0,
            averageOverall: 0,
            distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            withComments: 0,
            withHostResponse: 0
        };
    }
    
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sumOverall = 0;
    let withComments = 0;
    let withHostResponse = 0;
    
    reviews.forEach(review => {
        sumOverall += review.ratings.overall;
        distribution[review.ratings.overall]++;
        
        if (review.hasPublicComment) withComments++;
        if (review.hasHostResponse) withHostResponse++;
    });
    
    return {
        totalReviews: reviews.length,
        averageOverall: Math.round((sumOverall / reviews.length) * 10) / 10,
        distribution,
        withComments,
        withHostResponse
    };
};

/**
 * Pre-save Middleware: Validate Review Eligibility
 */
reviewSchema.pre('save', async function(next) {
    if (this.isNew) {
        // Verify booking exists and is completed
        const Booking = mongoose.model('Booking');
        const booking = await Booking.findById(this.booking);
        
        if (!booking) {
            return next(new Error('Booking not found'));
        }
        
        if (booking.status !== 'completed') {
            return next(new Error('Can only review completed bookings'));
        }
        
        // Verify guest matches
        if (booking.guest.toString() !== this.guest.toString()) {
            return next(new Error('Guest mismatch'));
        }
        
        // Verify listing matches
        if (booking.listing.toString() !== this.listing.toString()) {
            return next(new Error('Listing mismatch'));
        }
        
        // Check if review already exists for this booking
        const existingReview = await mongoose.model('Review').findOne({ 
            booking: this.booking 
        });
        
        if (existingReview && existingReview._id.toString() !== this._id.toString()) {
            return next(new Error('Review already exists for this booking'));
        }
    }
    
    next();
});

/**
 * Post-save Middleware: Update Listing Review Scores
 */
reviewSchema.post('save', async function(doc) {
    if (doc.isPublished && !doc.isFlagged) {
        const Listing = mongoose.model('Listing');
        const listing = await Listing.findById(doc.listing);
        
        if (listing) {
            await listing.updateReviewScores();
        }
    }
});

/**
 * Post-remove Middleware: Update Listing Review Scores
 */
reviewSchema.post('remove', async function(doc) {
    const Listing = mongoose.model('Listing');
    const listing = await Listing.findById(doc.listing);
    
    if (listing) {
        await listing.updateReviewScores();
    }
});

/**
 * Post Update Hook: Update Listing Scores if published/flagged status changes
 */
reviewSchema.post('findOneAndUpdate', async function(doc) {
    if (doc) {
        const Listing = mongoose.model('Listing');
        const listing = await Listing.findById(doc.listing);
        
        if (listing) {
            await listing.updateReviewScores();
        }
    }
});

/**
 * Export Model
 */
module.exports = mongoose.model('Review', reviewSchema);

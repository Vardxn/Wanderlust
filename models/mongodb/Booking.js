/**
 * Booking Schema (MongoDB)
 * Transactional collection for all reservations
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Price Breakdown Sub-document Schema
 */
const priceBreakdownSchema = new Schema({
    basePrice: {
        type: Number,
        required: [true, 'Base price is required'],
        min: [0, 'Base price cannot be negative']
    },
    cleaningFee: {
        type: Number,
        default: 0,
        min: [0, 'Cleaning fee cannot be negative']
    },
    serviceFee: {
        type: Number,
        required: [true, 'Service fee is required'],
        min: [0, 'Service fee cannot be negative']
    },
    securityDeposit: {
        type: Number,
        default: 0,
        min: [0, 'Security deposit cannot be negative']
    },
    discount: {
        type: Number,
        default: 0,
        min: [0, 'Discount cannot be negative']
    },
    taxes: {
        type: Number,
        default: 0,
        min: [0, 'Taxes cannot be negative']
    }
}, { _id: false });

/**
 * Main Booking Schema
 */
const bookingSchema = new Schema({
    guest: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Guest is required'],
        index: true
    },
    listing: {
        type: Schema.Types.ObjectId,
        ref: 'Listing',
        required: [true, 'Listing is required'],
        index: true
    },
    checkInDate: {
        type: Date,
        required: [true, 'Check-in date is required'],
        validate: {
            validator: function(value) {
                // Check-in must be today or in the future
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return value >= today;
            },
            message: 'Check-in date must be today or in the future'
        }
    },
    checkOutDate: {
        type: Date,
        required: [true, 'Check-out date is required'],
        validate: {
            validator: function(value) {
                // Check-out must be after check-in
                return value > this.checkInDate;
            },
            message: 'Check-out date must be after check-in date'
        }
    },
    numberOfGuests: {
        type: Number,
        required: [true, 'Number of guests is required'],
        min: [1, 'Must have at least 1 guest'],
        max: [50, 'Cannot exceed 50 guests'],
        validate: {
            validator: Number.isInteger,
            message: 'Number of guests must be an integer'
        }
    },
    totalPrice: {
        type: Number,
        required: [true, 'Total price is required'],
        min: [100, 'Total price must be at least $1.00 (100 cents)'],
        validate: {
            validator: Number.isInteger,
            message: 'Total price must be in cents (integer)'
        }
    },
    priceBreakdown: {
        type: priceBreakdownSchema,
        required: [true, 'Price breakdown is required']
    },
    status: {
        type: String,
        required: [true, 'Status is required'],
        enum: {
            values: ['pending', 'confirmed', 'cancelled', 'completed', 'declined'],
            message: '{VALUE} is not a valid booking status'
        },
        default: 'pending',
        index: true
    },
    // Additional useful fields
    cancellationReason: {
        type: String,
        default: null,
        maxlength: [1000, 'Cancellation reason is too long']
    },
    cancelledAt: {
        type: Date,
        default: null
    },
    cancelledBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    confirmationCode: {
        type: String,
        unique: true,
        sparse: true,
        uppercase: true
    },
    specialRequests: {
        type: String,
        default: '',
        maxlength: [1000, 'Special requests are too long']
    },
    hostPayout: {
        type: Number,
        default: null,
        min: [0, 'Host payout cannot be negative']
    },
    paymentIntentId: {
        type: String,
        default: null
    },
    refundAmount: {
        type: Number,
        default: null,
        min: [0, 'Refund amount cannot be negative']
    },
    checkInCompleted: {
        type: Boolean,
        default: false
    },
    checkOutCompleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true, // Adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

/**
 * Indexes
 */
bookingSchema.index({ guest: 1, status: 1 });
bookingSchema.index({ listing: 1, status: 1 });
bookingSchema.index({ checkInDate: 1, checkOutDate: 1 });
bookingSchema.index({ status: 1, checkInDate: 1 });
bookingSchema.index({ confirmationCode: 1 });
bookingSchema.index({ createdAt: -1 });

// Compound index for availability checks
bookingSchema.index({ 
    listing: 1, 
    status: 1, 
    checkInDate: 1, 
    checkOutDate: 1 
});

/**
 * Virtual: Number of Nights
 */
bookingSchema.virtual('nights').get(function() {
    if (!this.checkInDate || !this.checkOutDate) return 0;
    
    const oneDay = 24 * 60 * 60 * 1000; // milliseconds in a day
    const diffDays = Math.round(
        Math.abs((this.checkOutDate - this.checkInDate) / oneDay)
    );
    return diffDays;
});

/**
 * Virtual: Total Price in Dollars
 */
bookingSchema.virtual('totalPriceDollars').get(function() {
    return this.totalPrice / 100;
});

/**
 * Virtual: Review (reverse population)
 */
bookingSchema.virtual('review', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'booking',
    justOne: true
});

/**
 * Virtual: Is Past Booking
 */
bookingSchema.virtual('isPast').get(function() {
    return this.checkOutDate < new Date();
});

/**
 * Virtual: Is Upcoming
 */
bookingSchema.virtual('isUpcoming').get(function() {
    return this.checkInDate > new Date() && this.status === 'confirmed';
});

/**
 * Virtual: Is Active (currently in stay period)
 */
bookingSchema.virtual('isActive').get(function() {
    const now = new Date();
    return this.checkInDate <= now && 
           this.checkOutDate > now && 
           this.status === 'confirmed';
});

/**
 * Virtual: Days Until Check-in
 */
bookingSchema.virtual('daysUntilCheckIn').get(function() {
    if (this.checkInDate <= new Date()) return 0;
    
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.ceil((this.checkInDate - new Date()) / oneDay);
});

/**
 * Instance Method: Generate Confirmation Code
 */
bookingSchema.methods.generateConfirmationCode = function() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    
    for (let i = 0; i < 8; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    this.confirmationCode = code;
    return code;
};

/**
 * Instance Method: Confirm Booking
 */
bookingSchema.methods.confirm = async function() {
    if (this.status !== 'pending') {
        throw new Error('Only pending bookings can be confirmed');
    }
    
    // Check if listing is still available
    const Listing = mongoose.model('Listing');
    const listing = await Listing.findById(this.listing);
    
    if (!listing) {
        throw new Error('Listing not found');
    }
    
    const isAvailable = await listing.isAvailable(
        this.checkInDate, 
        this.checkOutDate
    );
    
    if (!isAvailable) {
        throw new Error('Listing is no longer available for these dates');
    }
    
    this.status = 'confirmed';
    
    if (!this.confirmationCode) {
        this.generateConfirmationCode();
    }
    
    // Calculate host payout (total price - service fee)
    this.hostPayout = this.totalPrice - this.priceBreakdown.serviceFee;
    
    return this.save();
};

/**
 * Instance Method: Cancel Booking
 */
bookingSchema.methods.cancel = async function(reason, cancelledBy) {
    if (!['pending', 'confirmed'].includes(this.status)) {
        throw new Error('Only pending or confirmed bookings can be cancelled');
    }
    
    this.status = 'cancelled';
    this.cancellationReason = reason;
    this.cancelledAt = new Date();
    this.cancelledBy = cancelledBy;
    
    // Calculate refund based on cancellation policy
    // This is a simplified version - implement full logic based on policy
    const Listing = mongoose.model('Listing');
    const listing = await Listing.findById(this.listing);
    
    if (listing) {
        const daysUntilCheckIn = this.daysUntilCheckIn;
        const policy = listing.bookingRules.cancellationPolicy;
        
        let refundPercentage = 0;
        
        switch (policy) {
            case 'Flexible':
                refundPercentage = daysUntilCheckIn >= 1 ? 1.0 : 0.0;
                break;
            case 'Moderate':
                refundPercentage = daysUntilCheckIn >= 5 ? 1.0 : 0.5;
                break;
            case 'Strict':
                refundPercentage = daysUntilCheckIn >= 7 ? 1.0 : 
                                  daysUntilCheckIn >= 1 ? 0.5 : 0.0;
                break;
            case 'Super Strict 30':
                refundPercentage = daysUntilCheckIn >= 30 ? 1.0 : 0.0;
                break;
            case 'Super Strict 60':
                refundPercentage = daysUntilCheckIn >= 60 ? 1.0 : 0.0;
                break;
        }
        
        this.refundAmount = Math.round(this.totalPrice * refundPercentage);
    }
    
    return this.save();
};

/**
 * Instance Method: Complete Booking
 */
bookingSchema.methods.complete = async function() {
    if (this.status !== 'confirmed') {
        throw new Error('Only confirmed bookings can be completed');
    }
    
    if (this.checkOutDate > new Date()) {
        throw new Error('Cannot complete booking before check-out date');
    }
    
    this.status = 'completed';
    this.checkOutCompleted = true;
    
    return this.save();
};

/**
 * Static Method: Find Overlapping Bookings
 */
bookingSchema.statics.findOverlapping = function(listingId, checkIn, checkOut, excludeBookingId = null) {
    const query = {
        listing: listingId,
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
    };
    
    if (excludeBookingId) {
        query._id = { $ne: excludeBookingId };
    }
    
    return this.findOne(query);
};

/**
 * Static Method: Get Upcoming Bookings
 */
bookingSchema.statics.getUpcoming = function(userId, userType = 'guest') {
    const field = userType === 'guest' ? 'guest' : 'listing';
    const query = {
        status: 'confirmed',
        checkInDate: { $gte: new Date() }
    };
    
    if (userType === 'guest') {
        query.guest = userId;
    } else {
        // For hosts, we need to find bookings for their listings
        // This requires aggregation or pre-populated listing data
        return this.find(query)
            .populate({
                path: 'listing',
                match: { host: userId }
            })
            .then(bookings => bookings.filter(b => b.listing !== null));
    }
    
    return this.find(query)
        .populate('listing')
        .populate('guest', 'firstName lastName profilePictureUrl')
        .sort({ checkInDate: 1 });
};

/**
 * Static Method: Get Booking Statistics
 */
bookingSchema.statics.getStatistics = async function(listingId, startDate, endDate) {
    const match = {
        listing: listingId,
        status: { $in: ['confirmed', 'completed'] }
    };
    
    if (startDate || endDate) {
        match.checkInDate = {};
        if (startDate) match.checkInDate.$gte = startDate;
        if (endDate) match.checkInDate.$lte = endDate;
    }
    
    const stats = await this.aggregate([
        { $match: match },
        {
            $group: {
                _id: null,
                totalBookings: { $sum: 1 },
                totalRevenue: { $sum: '$totalPrice' },
                totalNights: { 
                    $sum: { 
                        $divide: [
                            { $subtract: ['$checkOutDate', '$checkInDate'] },
                            1000 * 60 * 60 * 24
                        ]
                    }
                },
                avgGuestsPerBooking: { $avg: '$numberOfGuests' }
            }
        }
    ]);
    
    return stats[0] || {
        totalBookings: 0,
        totalRevenue: 0,
        totalNights: 0,
        avgGuestsPerBooking: 0
    };
};

/**
 * Pre-save Middleware: Validate Dates and Availability
 */
bookingSchema.pre('save', async function(next) {
    // Only validate on new bookings or when dates change
    if (this.isNew || this.isModified('checkInDate') || this.isModified('checkOutDate')) {
        // Check for overlapping bookings
        const overlapping = await mongoose.model('Booking').findOverlapping(
            this.listing,
            this.checkInDate,
            this.checkOutDate,
            this._id
        );
        
        if (overlapping) {
            return next(new Error('Dates overlap with existing booking'));
        }
        
        // Validate guest capacity
        if (this.isNew || this.isModified('listing') || this.isModified('numberOfGuests')) {
            const Listing = mongoose.model('Listing');
            const listing = await Listing.findById(this.listing);
            
            if (listing && this.numberOfGuests > listing.capacity.accommodates) {
                return next(new Error(
                    `Number of guests (${this.numberOfGuests}) exceeds listing capacity (${listing.capacity.accommodates})`
                ));
            }
            
            // Validate minimum/maximum nights
            const nights = this.nights;
            if (listing) {
                if (nights < listing.bookingRules.minimumNights) {
                    return next(new Error(
                        `Stay must be at least ${listing.bookingRules.minimumNights} night(s)`
                    ));
                }
                if (nights > listing.bookingRules.maximumNights) {
                    return next(new Error(
                        `Stay cannot exceed ${listing.bookingRules.maximumNights} night(s)`
                    ));
                }
            }
        }
    }
    
    // Generate confirmation code for confirmed bookings
    if (this.status === 'confirmed' && !this.confirmationCode) {
        this.generateConfirmationCode();
    }
    
    next();
});

/**
 * Post-save Middleware: Update Listing Stats
 */
bookingSchema.post('save', async function(doc) {
    if (doc.status === 'confirmed') {
        const Listing = mongoose.model('Listing');
        await Listing.findByIdAndUpdate(doc.listing, {
            $inc: { bookingCount: 1 }
        });
    }
});

/**
 * Post-save Middleware: Update Host Stats
 */
bookingSchema.post('save', async function(doc) {
    const Listing = mongoose.model('Listing');
    const listing = await Listing.findById(doc.listing).populate('host');
    
    if (listing && listing.host && listing.host.isHost) {
        // Update host acceptance rate, response rate, etc.
        // This is a placeholder for more complex logic
        // In production, you'd calculate these metrics properly
    }
});

/**
 * Export Model
 */
module.exports = mongoose.model('Booking', bookingSchema);

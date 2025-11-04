const mongoose = require('mongoose');
const { Schema } = mongoose;

const bookingSchema = new Schema({
    listing: {
        type: Schema.Types.ObjectId,
        ref: 'Listing',
        required: true
    },
    guest: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    host: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    checkIn: {
        type: Date,
        required: true
    },
    checkOut: {
        type: Date,
        required: true
    },
    guests: {
        adults: {
            type: Number,
            required: true,
            min: 1,
            default: 1
        },
        children: {
            type: Number,
            min: 0,
            default: 0
        },
        infants: {
            type: Number,
            min: 0,
            default: 0
        },
        pets: {
            type: Number,
            min: 0,
            default: 0
        }
    },
    totalGuests: {
        type: Number,
        required: true
    },
    nights: {
        type: Number,
        required: true,
        min: 1
    },
    pricing: {
        basePrice: {
            type: Number,
            required: true
        },
        nightlyRate: {
            type: Number,
            required: true
        },
        cleaningFee: {
            type: Number,
            default: 0
        },
        serviceFee: {
            type: Number,
            default: 0
        },
        taxes: {
            type: Number,
            default: 0
        },
        discount: {
            type: Number,
            default: 0
        },
        discountType: {
            type: String,
            enum: ['none', 'weekly', 'monthly'],
            default: 'none'
        },
        total: {
            type: Number,
            required: true
        }
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed', 'rejected'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'refunded', 'failed'],
        default: 'pending'
    },
    paymentId: {
        type: String
    },
    paymentMethod: {
        type: String
    },
    cancellationReason: {
        type: String
    },
    specialRequests: {
        type: String
    },
    reminderSent: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
bookingSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Calculate total guests
bookingSchema.pre('save', function(next) {
    this.totalGuests = this.guests.adults + this.guests.children;
    next();
});

// Virtual for booking duration in a readable format
bookingSchema.virtual('duration').get(function() {
    return `${this.nights} night${this.nights > 1 ? 's' : ''}`;
});

// Instance method to check if booking is active
bookingSchema.methods.isActive = function() {
    return this.status === 'confirmed' && this.checkOut > new Date();
};

// Instance method to check if booking can be cancelled
bookingSchema.methods.canBeCancelled = function() {
    const now = new Date();
    const checkInDate = new Date(this.checkIn);
    const hoursUntilCheckIn = (checkInDate - now) / (1000 * 60 * 60);
    
    // Can cancel if more than 24 hours until check-in
    return this.status === 'confirmed' && hoursUntilCheckIn > 24;
};

// Static method to find overlapping bookings
bookingSchema.statics.findOverlapping = function(listingId, checkIn, checkOut, excludeBookingId = null) {
    const query = {
        listing: listingId,
        status: { $in: ['pending', 'confirmed'] },
        $or: [
            // New booking starts during existing booking
            { checkIn: { $lte: checkIn }, checkOut: { $gt: checkIn } },
            // New booking ends during existing booking
            { checkIn: { $lt: checkOut }, checkOut: { $gte: checkOut } },
            // New booking encompasses existing booking
            { checkIn: { $gte: checkIn }, checkOut: { $lte: checkOut } }
        ]
    };
    
    if (excludeBookingId) {
        query._id = { $ne: excludeBookingId };
    }
    
    return this.find(query);
};

// Static method to check availability
bookingSchema.statics.checkAvailability = async function(listingId, checkIn, checkOut) {
    const overlapping = await this.findOverlapping(listingId, checkIn, checkOut);
    return overlapping.length === 0;
};

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;

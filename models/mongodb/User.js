/**
 * User Schema (MongoDB)
 * Handles both guest and host user profiles
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

/**
 * Host Profile Sub-document Schema
 * Embedded in User document when user becomes a host
 */
const hostProfileSchema = new Schema({
    hostSince: {
        type: Date,
        default: Date.now,
        required: true
    },
    responseRate: {
        type: Number,
        min: [0, 'Response rate must be between 0 and 1'],
        max: [1, 'Response rate must be between 0 and 1'],
        default: null
    },
    acceptanceRate: {
        type: Number,
        min: [0, 'Acceptance rate must be between 0 and 1'],
        max: [1, 'Acceptance rate must be between 0 and 1'],
        default: null
    },
    responseTime: {
        type: String,
        enum: ['within an hour', 'within a few hours', 'within a day', 'a few days or more'],
        default: null
    },
    isSuperhost: {
        type: Boolean,
        default: false
    },
    totalListingsCount: {
        type: Number,
        default: 0,
        min: [0, 'Total listings count cannot be negative']
    }
}, { _id: false }); // No separate _id for sub-document

/**
 * Main User Schema
 */
const userSchema = new Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        minlength: [1, 'First name cannot be empty'],
        maxlength: [100, 'First name is too long']
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        minlength: [1, 'Last name cannot be empty'],
        maxlength: [100, 'Last name is too long']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    passwordHash: {
        type: String,
        // Note: passport-local-mongoose handles password hashing
        // This field is for manual password management if needed
    },
    profilePictureUrl: {
        type: String,
        default: null,
        validate: {
            validator: function(v) {
                if (!v) return true;
                return /^https?:\/\/.+/.test(v);
            },
            message: 'Profile picture must be a valid URL'
        }
    },
    aboutText: {
        type: String,
        default: '',
        maxlength: [2000, 'About text is too long']
    },
    phoneNumber: {
        type: String,
        unique: true,
        sparse: true, // Allows multiple null values
        trim: true,
        validate: {
            validator: function(v) {
                if (!v) return true;
                // Basic phone validation (adjust regex based on requirements)
                return /^[\d\s\-\+\(\)]+$/.test(v);
            },
            message: 'Please provide a valid phone number'
        }
    },
    isHost: {
        type: Boolean,
        default: false,
        index: true // Index for quick host lookups
    },
    identityVerified: {
        type: Boolean,
        default: false
    },
    hostProfile: {
        type: hostProfileSchema,
        default: null
    },
    // Additional useful fields
    isActive: {
        type: Boolean,
        default: true
    },
    lastLoginAt: {
        type: Date,
        default: null
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: {
        type: String,
        default: null
    }
}, {
    timestamps: true, // Adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

/**
 * Indexes
 */
userSchema.index({ email: 1 });
userSchema.index({ isHost: 1 });
userSchema.index({ createdAt: -1 });

/**
 * Virtual: Full Name
 */
userSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
});

/**
 * Virtual: Listings (reverse population)
 */
userSchema.virtual('listings', {
    ref: 'Listing',
    localField: '_id',
    foreignField: 'host'
});

/**
 * Virtual: Bookings as Guest
 */
userSchema.virtual('bookingsAsGuest', {
    ref: 'Booking',
    localField: '_id',
    foreignField: 'guest'
});

/**
 * Virtual: Reviews Written
 */
userSchema.virtual('reviewsWritten', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'guest'
});

/**
 * Instance Method: Promote to Host
 */
userSchema.methods.promoteToHost = function() {
    if (!this.isHost) {
        this.isHost = true;
        this.hostProfile = {
            hostSince: new Date(),
            responseRate: null,
            acceptanceRate: null,
            isSuperhost: false,
            totalListingsCount: 0
        };
    }
    return this.save();
};

/**
 * Instance Method: Update Host Stats
 */
userSchema.methods.updateHostStats = async function(stats) {
    if (!this.isHost || !this.hostProfile) {
        throw new Error('User is not a host');
    }
    
    if (stats.responseRate !== undefined) {
        this.hostProfile.responseRate = stats.responseRate;
    }
    if (stats.acceptanceRate !== undefined) {
        this.hostProfile.acceptanceRate = stats.acceptanceRate;
    }
    if (stats.responseTime !== undefined) {
        this.hostProfile.responseTime = stats.responseTime;
    }
    if (stats.totalListingsCount !== undefined) {
        this.hostProfile.totalListingsCount = stats.totalListingsCount;
    }
    
    // Auto-determine superhost status based on criteria
    const qualifiesForSuperhost = 
        this.hostProfile.responseRate >= 0.9 &&
        this.hostProfile.acceptanceRate >= 0.88 &&
        this.hostProfile.totalListingsCount >= 1;
    
    this.hostProfile.isSuperhost = qualifiesForSuperhost;
    
    return this.save();
};

/**
 * Static Method: Find Active Hosts
 */
userSchema.statics.findActiveHosts = function() {
    return this.find({ 
        isHost: true, 
        isActive: true,
        'hostProfile.totalListingsCount': { $gt: 0 }
    }).select('firstName lastName email profilePictureUrl hostProfile');
};

/**
 * Static Method: Find Superhosts
 */
userSchema.statics.findSuperhosts = function() {
    return this.find({ 
        isHost: true,
        'hostProfile.isSuperhost': true,
        isActive: true
    });
};

/**
 * Pre-save Middleware: Validate Host Profile
 */
userSchema.pre('save', function(next) {
    // If user is a host but has no host profile, create one
    if (this.isHost && !this.hostProfile) {
        this.hostProfile = {
            hostSince: new Date(),
            responseRate: null,
            acceptanceRate: null,
            isSuperhost: false,
            totalListingsCount: 0
        };
    }
    
    // If user is not a host, remove host profile
    if (!this.isHost && this.hostProfile) {
        this.hostProfile = null;
    }
    
    next();
});

/**
 * Pre-remove Middleware: Cleanup
 */
userSchema.pre('remove', async function(next) {
    // Note: In production, you'd want to handle this more carefully
    // (e.g., prevent deletion if active bookings exist)
    const Listing = mongoose.model('Listing');
    const Booking = mongoose.model('Booking');
    
    // Delete user's listings
    await Listing.deleteMany({ host: this._id });
    
    // Cancel user's bookings
    await Booking.updateMany(
        { guest: this._id, status: { $in: ['pending', 'confirmed'] } },
        { status: 'cancelled' }
    );
    
    next();
});

// Add passport-local-mongoose plugin for authentication
userSchema.plugin(passportLocalMongoose, {
    usernameField: 'email',
    errorMessages: {
        UserExistsError: 'A user with this email already exists.',
        IncorrectPasswordError: 'Password is incorrect',
        IncorrectUsernameError: 'Email is incorrect or does not exist',
        MissingUsernameError: 'Email is required',
        MissingPasswordError: 'Password is required'
    }
});

/**
 * Export Model
 */
module.exports = mongoose.model('User', userSchema);

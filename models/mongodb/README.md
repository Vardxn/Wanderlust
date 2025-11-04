# MongoDB Schema Documentation

## Overview

This directory contains the complete Mongoose schema definitions for the Wanderlust vacation rental platform. All schemas are written in JavaScript with comprehensive validation, indexes, virtuals, and business logic methods.

---

## Collections

### 1. **Users** (`User.js`)

Stores all user accounts (both guests and hosts).

#### Core Fields
- `firstName`, `lastName` - User's full name (required)
- `email` - Unique email address with validation
- `passwordHash` - Managed by passport-local-mongoose
- `profilePictureUrl` - Optional profile picture
- `aboutText` - User bio (max 2000 chars)
- `phoneNumber` - Unique phone number
- `isHost` - Boolean indicating if user is a host
- `identityVerified` - Email/ID verification status

#### Host Profile (Sub-document)
Embedded when `isHost = true`:
- `hostSince` - Date user became a host
- `responseRate` - 0-1 scale (90% = 0.9)
- `acceptanceRate` - 0-1 scale
- `responseTime` - Enum: 'within an hour', 'within a few hours', etc.
- `isSuperhost` - Auto-calculated based on metrics
- `totalListingsCount` - Number of active listings

#### Key Methods
```javascript
// Promote user to host
await user.promoteToHost();

// Update host statistics
await user.updateHostStats({
    responseRate: 0.95,
    acceptanceRate: 0.88,
    totalListingsCount: 5
});
```

#### Static Methods
```javascript
// Find all active hosts
const hosts = await User.findActiveHosts();

// Find superhosts
const superhosts = await User.findSuperhosts();
```

#### Virtuals
- `fullName` - Combined first and last name
- `listings` - Reverse population of user's listings
- `bookingsAsGuest` - User's bookings
- `reviewsWritten` - Reviews written by user

---

### 2. **Listings** (`Listing.js`)

Central collection for vacation rental properties.

#### Core Fields
- `host` - Reference to User (required)
- `name` - Listing title (10-255 chars)
- `description` - Full description (50-5000 chars)
- `summary`, `space`, `transitInfo`, `houseRules` - Additional descriptions
- `propertyType` - Enum: 'Apartment', 'House', 'Villa', etc.
- `roomType` - Enum: 'Entire home/apt', 'Private room', 'Shared room', 'Hotel room'

#### Location (Sub-document)
```javascript
location: {
    address: String,        // Street address
    city: String,          // Indexed
    state: String,
    country: String,       // Indexed
    zipCode: String,
    coordinates: {         // GeoJSON Point with 2dsphere index
        type: 'Point',
        coordinates: [longitude, latitude]
    }
}
```

#### Capacity (Sub-document)
```javascript
capacity: {
    accommodates: Number,  // 1-50 guests
    bedrooms: Number,      // 0-50
    beds: Number,          // 0-100
    bathrooms: Number      // Allows decimals (1.5, 2.5)
}
```

#### Pricing (Sub-document)
All prices in **cents** (integers):
```javascript
pricing: {
    pricePerNight: Number,    // In cents ($100 = 10000)
    securityDeposit: Number,  // Optional, in cents
    cleaningFee: Number       // Optional, in cents
}
```

#### Booking Rules (Sub-document)
```javascript
bookingRules: {
    minimumNights: Number,           // Default: 1
    maximumNights: Number,           // Default: 365
    checkInTime: String,             // HH:MM format
    checkOutTime: String,            // HH:MM format
    cancellationPolicy: String,      // Enum
    instantBookable: Boolean
}
```

#### Photos (Array of Sub-documents)
```javascript
photos: [{
    url: String,        // Photo URL (required)
    caption: String,    // Optional caption
    isCover: Boolean,   // Only one can be true
    sortOrder: Number   // Display order
}]
```

#### Review Scores (Sub-document)
Aggregated from reviews for fast access:
```javascript
reviewScores: {
    rating: Number,          // 1-5 average
    cleanliness: Number,     // 1-5 average
    accuracy: Number,
    checkin: Number,
    communication: Number,
    location: Number,
    value: Number,
    totalReviews: Number
}
```

#### Key Methods
```javascript
// Check availability for dates
const available = await listing.isAvailable(checkIn, checkOut);

// Calculate total price for stay
const pricing = listing.calculateTotalPrice(nights);
// Returns: { basePrice, cleaningFee, serviceFee, total }

// Update review scores from all reviews
await listing.updateReviewScores();
```

#### Static Methods
```javascript
// Advanced search with filters
const results = await Listing.searchListings({
    city: 'Paris',
    minPrice: 5000,      // $50/night in cents
    maxPrice: 20000,     // $200/night
    guests: 4,
    bedrooms: 2,
    amenities: ['WiFi', 'Pool'],
    instantBookable: true
});
```

#### Virtuals
- `pricing.pricePerNightDollars` - Price in dollars
- `coverPhoto` - First photo marked as cover (or first photo)
- `bookings` - All bookings for this listing
- `reviews` - All reviews for this listing

#### Indexes
- Geospatial index on `location.coordinates`
- Text index on `name`, `description`, `city`, `country`
- Multiple single and compound indexes for filtering

---

### 3. **Bookings** (`Booking.js`)

Transactional collection for all reservations.

#### Core Fields
- `guest` - Reference to User (required)
- `listing` - Reference to Listing (required)
- `checkInDate`, `checkOutDate` - Date objects (required)
- `numberOfGuests` - Integer (1-50)
- `totalPrice` - In cents (integer)
- `status` - Enum: 'pending', 'confirmed', 'cancelled', 'completed', 'declined'

#### Price Breakdown (Sub-document)
```javascript
priceBreakdown: {
    basePrice: Number,        // Nights × price per night
    cleaningFee: Number,
    serviceFee: Number,       // Platform fee (14%)
    securityDeposit: Number,
    discount: Number,
    taxes: Number
}
```

#### Additional Fields
- `confirmationCode` - 8-character unique code
- `specialRequests` - Guest notes (max 1000 chars)
- `cancellationReason` - Why booking was cancelled
- `cancelledAt`, `cancelledBy` - Cancellation tracking
- `hostPayout` - Amount host receives (total - service fee)
- `refundAmount` - Calculated based on cancellation policy
- `checkInCompleted`, `checkOutCompleted` - Check-in/out status

#### Key Methods
```javascript
// Confirm a pending booking
await booking.confirm();
// - Generates confirmation code
// - Validates availability
// - Calculates host payout

// Cancel a booking
await booking.cancel(reason, userId);
// - Calculates refund based on policy
// - Updates status and metadata

// Complete a booking (after checkout)
await booking.complete();
```

#### Static Methods
```javascript
// Find overlapping bookings
const overlap = await Booking.findOverlapping(
    listingId, 
    checkIn, 
    checkOut
);

// Get upcoming bookings for user
const upcoming = await Booking.getUpcoming(userId, 'guest');

// Get booking statistics for listing
const stats = await Booking.getStatistics(
    listingId,
    startDate,
    endDate
);
// Returns: { totalBookings, totalRevenue, totalNights, avgGuests }
```

#### Virtuals
- `nights` - Calculated number of nights
- `totalPriceDollars` - Price in dollars
- `isPast` - If checkout date has passed
- `isUpcoming` - If checkin is in future
- `isActive` - Currently in stay period
- `daysUntilCheckIn` - Days remaining until checkin
- `review` - Associated review (reverse population)

#### Validation
- Prevents overlapping bookings (pre-save hook)
- Validates guest capacity doesn't exceed listing limit
- Validates minimum/maximum nights
- Validates check-in date is not in the past
- Validates check-out is after check-in

#### Cancellation Policy Logic
```javascript
'Flexible':        Full refund if cancelled ≥1 day before
'Moderate':        Full refund if ≥5 days, 50% if ≥1 day
'Strict':          Full refund if ≥7 days, 50% if ≥1 day
'Super Strict 30': Full refund if ≥30 days
'Super Strict 60': Full refund if ≥60 days
```

---

### 4. **Reviews** (`Review.js`)

Detailed multi-category feedback from guests.

#### Core Fields
- `booking` - Reference to Booking (required, unique - one review per booking)
- `guest` - Reference to User (required)
- `listing` - Reference to Listing (required)

#### Ratings (Sub-document)
All ratings are integers 1-5:
```javascript
ratings: {
    overall: Number,        // Overall experience
    cleanliness: Number,    // How clean was property
    accuracy: Number,       // Listing accuracy
    checkin: Number,        // Check-in process
    communication: Number,  // Host communication
    location: Number,       // Location quality
    value: Number          // Value for money
}
```

#### Comments
- `commentPublic` - Public review (max 2000 chars)
- `commentPrivate` - Private feedback to host (max 1000 chars)

#### Additional Fields
- `isPublished` - If review is visible (default: true)
- `isFlagged` - If review has been reported
- `flagReason` - Why review was flagged
- `hostResponse` - Host's response to review
- `hostRespondedAt` - When host responded
- `helpfulCount` - Number of "helpful" votes
- `reportedCount` - Number of times reported

#### Key Methods
```javascript
// Add host response
await review.addHostResponse(responseText, hostId);

// Flag inappropriate review
await review.flag('Contains offensive language');

// Unflag review
await review.unflag();

// Mark as helpful
await review.markHelpful();

// Publish/unpublish
await review.publish();
await review.unpublish();
```

#### Static Methods
```javascript
// Get average ratings for listing
const averages = await Review.getListingAverages(listingId);
// Returns all 7 category averages + total count

// Get recent reviews
const recent = await Review.getRecentForListing(listingId, 10);

// Get all reviews by guest
const guestReviews = await Review.getGuestReviews(guestId);

// Get all reviews for host's listings
const hostReviews = await Review.getHostReceivedReviews(hostId);

// Get review statistics
const stats = await Review.getStatistics(listingId);
// Returns: totalReviews, averageOverall, distribution, etc.
```

#### Virtuals
- `averageRating` - Average of all 7 categories
- `hasPublicComment` - If public comment exists
- `hasPrivateComment` - If private comment exists
- `hasHostResponse` - If host has responded
- `daysSinceReview` - Days since review was created

#### Validation
- Can only review completed bookings
- One review per booking (enforced by unique constraint)
- Guest must match booking guest
- Listing must match booking listing
- All ratings must be 1-5 integers

#### Post-Save Hook
Automatically updates listing's `reviewScores` when:
- New review is created
- Review is published/unpublished
- Review is flagged/unflagged
- Review is deleted

---

## Common Patterns

### Creating Documents

```javascript
const { User, Listing, Booking, Review } = require('./models/mongodb');

// Create a user
const user = new User({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com'
});
await user.setPassword('securePassword123');
await user.save();

// Create a listing
const listing = new Listing({
    host: user._id,
    name: 'Beautiful Apartment in Paris',
    description: 'A cozy apartment...',
    propertyType: 'Apartment',
    roomType: 'Entire home/apt',
    location: {
        address: '123 Rue de Example',
        city: 'Paris',
        state: 'Île-de-France',
        country: 'France',
        zipCode: '75001',
        coordinates: {
            type: 'Point',
            coordinates: [2.3522, 48.8566] // [lng, lat]
        }
    },
    capacity: {
        accommodates: 4,
        bedrooms: 2,
        beds: 2,
        bathrooms: 1
    },
    pricing: {
        pricePerNight: 15000, // $150.00
        cleaningFee: 5000     // $50.00
    },
    photos: [{
        url: 'https://example.com/photo.jpg',
        isCover: true
    }]
});
await listing.save();

// Create a booking
const booking = new Booking({
    guest: guestUser._id,
    listing: listing._id,
    checkInDate: new Date('2025-12-01'),
    checkOutDate: new Date('2025-12-05'),
    numberOfGuests: 2,
    totalPrice: 65000, // $650.00
    priceBreakdown: {
        basePrice: 60000,
        cleaningFee: 5000,
        serviceFee: 8400
    }
});
await booking.save();

// Create a review
const review = new Review({
    booking: booking._id,
    guest: guestUser._id,
    listing: listing._id,
    ratings: {
        overall: 5,
        cleanliness: 5,
        accuracy: 5,
        checkin: 5,
        communication: 5,
        location: 5,
        value: 4
    },
    commentPublic: 'Amazing stay! Highly recommend.'
});
await review.save();
```

### Querying with Population

```javascript
// Get listing with host details
const listing = await Listing.findById(listingId)
    .populate('host', 'firstName lastName profilePictureUrl hostProfile');

// Get booking with all related data
const booking = await Booking.findById(bookingId)
    .populate('guest', 'firstName lastName email')
    .populate({
        path: 'listing',
        select: 'name location pricing photos',
        populate: {
            path: 'host',
            select: 'firstName lastName'
        }
    });

// Get user with all their reviews
const user = await User.findById(userId)
    .populate({
        path: 'reviewsWritten',
        populate: {
            path: 'listing',
            select: 'name location.city'
        }
    });
```

### Using Virtuals

```javascript
// Access virtual fields
const user = await User.findById(userId);
console.log(user.fullName); // "John Doe"

const booking = await Booking.findById(bookingId);
console.log(booking.nights); // 4
console.log(booking.daysUntilCheckIn); // 10
console.log(booking.isUpcoming); // true

const review = await Review.findById(reviewId);
console.log(review.averageRating); // 4.7
```

---

## Indexes

All schemas include strategic indexes for performance:

### User
- Email (unique)
- isHost
- createdAt

### Listing
- host + isActive
- city + country
- pricePerNight
- propertyType + roomType
- accommodates
- rating (descending)
- coordinates (2dsphere for geospatial)
- Text index on name, description, city, country

### Booking
- guest + status
- listing + status
- checkInDate + checkOutDate
- confirmationCode (unique)
- Compound: listing + status + dates

### Review
- booking (unique)
- listing + createdAt
- guest + createdAt
- overall rating
- isPublished + isFlagged

---

## Validation Rules

### Email
- Required, unique, lowercase
- Regex: `/^\S+@\S+\.\S+$/`

### Phone Number
- Unique (sparse index allows nulls)
- Regex: `/^[\d\s\-\+\(\)]+$/`

### Prices
- Must be integers (cents)
- Minimum $1.00 (100 cents)
- Cannot be negative

### Ratings
- Must be integers 1-5
- All 7 categories required

### Dates
- Check-in must be today or future
- Check-out must be after check-in
- No overlapping bookings allowed

### Capacity
- Accommodates: 1-50
- Bedrooms: 0-50
- Beds: 0-100
- Bathrooms: 0-50 (decimal allowed)

---

## Best Practices

### 1. Always Use Transactions for Related Updates
```javascript
const session = await mongoose.startSession();
session.startTransaction();

try {
    await booking.save({ session });
    await listing.updateReviewScores({ session });
    await session.commitTransaction();
} catch (error) {
    await session.abortTransaction();
    throw error;
} finally {
    session.endSession();
}
```

### 2. Populate Only What You Need
```javascript
// ❌ Bad - loads everything
const booking = await Booking.findById(id).populate('guest listing');

// ✅ Good - selective fields
const booking = await Booking.findById(id)
    .populate('guest', 'firstName lastName')
    .populate('listing', 'name pricing.pricePerNight');
```

### 3. Use Lean for Read-Only Queries
```javascript
// Returns plain JavaScript object (faster)
const listings = await Listing.find().lean();
```

### 4. Always Handle Validation Errors
```javascript
try {
    await listing.save();
} catch (error) {
    if (error.name === 'ValidationError') {
        // Handle validation errors
        console.error(error.errors);
    }
}
```

---

## Migration from Current Schema

If you have existing data, here's how to migrate:

```javascript
// Example: Migrate existing User model to new schema
const oldUsers = await OldUserModel.find();

for (const oldUser of oldUsers) {
    const newUser = new User({
        firstName: oldUser.first_name,
        lastName: oldUser.last_name,
        email: oldUser.email,
        // ... map other fields
    });
    
    if (oldUser.is_host) {
        await newUser.promoteToHost();
    }
    
    await newUser.save();
}
```

---

## Testing

```javascript
// Example test
const { User, Listing } = require('./models/mongodb');

describe('User Model', () => {
    it('should promote user to host', async () => {
        const user = new User({
            firstName: 'Test',
            lastName: 'User',
            email: 'test@example.com'
        });
        
        await user.save();
        await user.promoteToHost();
        
        expect(user.isHost).toBe(true);
        expect(user.hostProfile).toBeDefined();
        expect(user.hostProfile.hostSince).toBeDefined();
    });
});
```

---

## Schema Files

- `User.js` - User and host profiles
- `Listing.js` - Property listings
- `Booking.js` - Reservations and transactions
- `Review.js` - Guest reviews and ratings
- `index.js` - Central export for all models

---

## Next Steps

1. Import these schemas in your application
2. Replace old schema references
3. Test thoroughly with existing data
4. Run migration scripts if needed
5. Update API endpoints to use new schema methods

For PostgreSQL migration, see `database/` directory.

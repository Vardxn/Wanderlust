// Add this at the very top of the file, before any other requires
require('dotenv').config();

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');

// Models
const Listing = require('./models/listing');
const Review = require('./models/review');
const HostReview = require('./models/hostReview');
const User = require('./models/user');
const Booking = require('./models/booking');

// Utility functions
// Create ExpressError class for error handling
class ExpressError extends Error {
    constructor(message, statusCode) {
        super();
        this.message = message;
        this.statusCode = statusCode;
    }
}

// Async error wrapper function
const wrapAsync = function (fn) {
    return function (req, res, next) {
        fn(req, res, next).catch(next);
    };
};

const normalizeRedirect = (value, fallback = '/') => {
    if (typeof value !== 'string') return fallback;
    const trimmed = value.trim();
    if (!trimmed.startsWith('/')) return fallback;
    if (trimmed.startsWith('//')) return fallback;
    return trimmed;
};

// Import validation schemas
const { listingSchema, reviewSchema, hostReviewSchema, bookingSchema } = require('./schemas/validationSchemas');

// Import authentication middleware
const { isLoggedIn, isOwner, isReviewAuthor, isBookingGuest, storeReturnTo } = require('./middleware/auth');

// Initialize Express app
const app = express();

// MongoDB Connection with optimized settings
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wanderlust';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10, // Optimize connection pool
    serverSelectionTimeoutMS: 5000, // Faster timeout
    socketTimeoutMS: 45000,
})
.then(() => {
    console.log('✅ MongoDB Connected Successfully!');
    console.log('📊 Database:', MONGODB_URI);
})
.catch((err) => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
});

// MongoDB connection events
mongoose.connection.on('connected', () => {
    console.log('🔗 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('⚠️ Mongoose disconnected from MongoDB');
});

// Set up view engine - MODIFIED: Fix the layouts path issue
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
// Add this line to configure layout directory for ejs-mate
app.locals.rmWhitespace = true;
app.locals._layoutFile = 'layouts/boilerplate';
// Helper to build Unsplash Source URLs from a place string with optional categories
app.locals.unsplashForPlace = function (place, categories) {
    try {
        const base = (place && place.trim().length) ? place.trim() : 'travel';
        const list = Array.isArray(categories) ? categories : (typeof categories === 'string' ? categories.split(',') : []);
        const keywords = [base, ...list.map(s => String(s).trim()).filter(Boolean), 'city', 'landmark', 'travel']
            .join(',');
        const encoded = encodeURIComponent(keywords);
        return `https://source.unsplash.com/800x800/?${encoded}`;
    } catch (e) {
        return 'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60';
    }
};

// Validation middleware functions
const validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

const validateHostReview = (req, res, next) => {
    const { error } = hostReviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

const validateBooking = (req, res, next) => {
    const { error } = bookingSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

// Middleware - ORDER MATTERS FOR PERFORMANCE!

// 1. COMPRESSION - Compress all responses (GZIP)
app.use(compression({
    level: 6, // Compression level (0-9)
    threshold: 1024, // Only compress responses > 1KB
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression.filter(req, res);
    }
}));

// 2. Static file serving with caching
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: '1d', // Cache static files for 1 day
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
        // Cache CSS/JS/Images longer
        if (path.endsWith('.css') || path.endsWith('.js')) {
            res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day
        } else if (path.match(/\.(jpg|jpeg|png|gif|svg|webp|ico)$/)) {
            res.setHeader('Cache-Control', 'public, max-age=604800'); // 7 days
        }
    }
}));

app.use((req, res, next) => {
    if (req.method === 'GET') {
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');
    }
    next();
});

// 3. Body parsers with size limits
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));
app.use(methodOverride('_method'));

// Session configuration
const sessionConfig = {
    secret: process.env.SESSION_SECRET || require('crypto').randomBytes(32).toString('hex'),
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 week
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};

app.use(session(sessionConfig));
app.use(flash());

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash middleware
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

app.use(mongoSanitize());

// Home route
// ============================================
// HOME PAGE ROUTE - Main landing page
// ============================================
app.get('/', wrapAsync(async (req, res) => {
    // Get all listings
    const allListings = await Listing.find({});
    
    // Get featured listings (first 12 for carousel)
    const featuredListings = allListings.slice(0, 12);
    
    // Group listings by location
    const listingsByLocation = {};
    allListings.forEach(listing => {
        const location = listing.location;
        if (!listingsByLocation[location]) {
            listingsByLocation[location] = [];
        }
        listingsByLocation[location].push(listing);
    });
    
    // Get top locations (locations with most listings)
    const topLocations = Object.keys(listingsByLocation)
        .sort((a, b) => listingsByLocation[b].length - listingsByLocation[a].length)
        .slice(0, 5); // Get top 5 locations
    
    // Get recent bookings count
    const totalBookings = await Booking.countDocuments();
    
    // Get unique locations count
    const uniqueLocations = [...new Set(allListings.map(l => l.location))];
    
    res.render("home-bento", { 
        pageTitle: "Wanderlust - Find Your Perfect Stay",
        listings: featuredListings,
        listingsByLocation: listingsByLocation,
        topLocations: topLocations,
        allListings: allListings,
        featuredListings: featuredListings,
        totalListings: allListings.length,
        totalBookings: totalBookings,
        totalLocations: uniqueLocations.length
    });
}));

// ============================================
// AUTH ROUTES - Register / Login / Logout
// ============================================

app.get('/register', (req, res) => {
    const safeRedirect = normalizeRedirect(req.query.redirect, '/');
    res.render('users/register', {
        pageTitle: 'Create your account',
        redirect: safeRedirect
    });
});

app.post('/register', wrapAsync(async (req, res, next) => {
    try {
        const { username, email, password, redirect } = req.body;
        const user = new User({ username, email });
        const registeredUser = await User.register(user, password);

        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash('success', `Welcome to Wanderlust, ${registeredUser.username}!`);
            const redirectUrl = normalizeRedirect(redirect, '/');
            res.redirect(redirectUrl);
        });
    } catch (error) {
        req.flash('error', error.message || 'Could not create account. Please try again.');
        res.redirect('/register');
    }
}));

app.get('/login', (req, res) => {
    const safeRedirect = normalizeRedirect(req.query.redirect, '/');
    if (req.query.redirect) {
        req.session.returnTo = safeRedirect;
    }

    res.render('users/login', {
        pageTitle: 'Log in to Wanderlust',
        redirect: safeRedirect
    });
});

app.post('/login', (req, res, next) => {
    if (req.body.redirect && req.body.redirect.trim()) {
        req.session.returnTo = normalizeRedirect(req.body.redirect, '/');
    }
    next();
}, storeReturnTo, passport.authenticate('local', {
    failureFlash: true,
    failureRedirect: '/login'
}), (req, res) => {
    req.flash('success', `Welcome back, ${req.user.username}!`);
    const redirectUrl = normalizeRedirect(res.locals.returnTo, '/');
    delete req.session.returnTo;
    res.redirect(redirectUrl);
});

app.post('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash('success', 'You have been logged out successfully.');
        res.redirect('/');
    });
});

// API Routes
const listingsRouter = require('./routes/api/v1/listings');
const bookingsRouter = require('./routes/api/v1/bookings');
const profileRouter = require('./routes/api/v1/profile');

app.use('/api/v1/listings', listingsRouter);
app.use('/api/v1/bookings', bookingsRouter);
app.use('/api/v1/profile', profileRouter);

// API Routes for search features

// Autocomplete API for locations
app.get('/api/autocomplete', wrapAsync(async (req, res) => {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
        return res.json({ locations: [], properties: [] });
    }
    
    const searchTerm = q.trim();
    
    // Get unique locations and countries
    const listings = await Listing.find({
        $or: [
            { location: new RegExp(searchTerm, 'i') },
            { country: new RegExp(searchTerm, 'i') },
            { title: new RegExp(searchTerm, 'i') }
        ]
    }).select('location country title').limit(20);
    
    // Extract unique locations
    const locationSet = new Set();
    const countrySet = new Set();
    const properties = [];
    
    listings.forEach(listing => {
        if (listing.location && listing.location.toLowerCase().includes(searchTerm.toLowerCase())) {
            locationSet.add(listing.location);
        }
        if (listing.country && listing.country.toLowerCase().includes(searchTerm.toLowerCase())) {
            countrySet.add(listing.country);
        }
        if (listing.title && listing.title.toLowerCase().includes(searchTerm.toLowerCase())) {
            properties.push({
                id: listing._id,
                title: listing.title,
                location: listing.location
            });
        }
    });
    
    const suggestions = [
        ...Array.from(locationSet).map(loc => ({ type: 'location', value: loc })),
        ...Array.from(countrySet).map(country => ({ type: 'country', value: country })),
        ...properties.slice(0, 5).map(prop => ({ type: 'property', value: prop.title, id: prop.id, location: prop.location }))
    ];
    
    res.json({ suggestions: suggestions.slice(0, 10) });
}));

// Get recent searches
app.get('/api/recent-searches', (req, res) => {
    const recentSearches = req.session.recentSearches || [];
    res.json({ recentSearches });
});

// Clear recent searches
app.delete('/api/recent-searches', (req, res) => {
    req.session.recentSearches = [];
    res.json({ message: 'Recent searches cleared' });
});

// Nearby properties (simplified - would need geolocation data in production)
app.get('/api/nearby', wrapAsync(async (req, res) => {
    const { location } = req.query;
    
    if (!location) {
        return res.json({ nearby: [] });
    }
    
    // Find properties in the same location
    const nearbyListings = await Listing.find({
        location: new RegExp(location, 'i')
    }).select('title location price image').limit(10);
    
    res.json({ 
        nearby: nearbyListings.map(listing => ({
            id: listing._id,
            title: listing.title,
            location: listing.location,
            price: listing.price,
            image: listing.image.url
        }))
    });
}));

// Booking API Routes

// Calculate price for a potential booking
app.post('/api/calculate-price', wrapAsync(async (req, res) => {
    const { listingId, checkIn, checkOut, adults, children, infants, pets } = req.body;
    
    const listing = await Listing.findById(listingId);
    if (!listing) {
        return res.status(404).json({ error: 'Listing not found' });
    }
    
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    // Calculate number of nights
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    
    if (nights < listing.minimumStay) {
        return res.status(400).json({ 
            error: `Minimum stay is ${listing.minimumStay} night${listing.minimumStay > 1 ? 's' : ''}` 
        });
    }
    
    if (nights > listing.maximumStay) {
        return res.status(400).json({ 
            error: `Maximum stay is ${listing.maximumStay} nights` 
        });
    }
    
    // Calculate total guests
    const totalGuests = (parseInt(adults) || 0) + (parseInt(children) || 0);
    
    if (totalGuests > listing.maxGuests) {
        return res.status(400).json({ 
            error: `This property accommodates a maximum of ${listing.maxGuests} guests` 
        });
    }
    
    // Base price calculation
    const basePrice = listing.price * nights;
    let discount = 0;
    let discountType = 'none';
    
    // Apply discounts
    if (nights >= 28 && listing.monthlyDiscount > 0) {
        discount = (basePrice * listing.monthlyDiscount) / 100;
        discountType = 'monthly';
    } else if (nights >= 7 && listing.weeklyDiscount > 0) {
        discount = (basePrice * listing.weeklyDiscount) / 100;
        discountType = 'weekly';
    }
    
    // Service fee (typically 10-15% of base price)
    const serviceFee = listing.serviceFee || Math.round(basePrice * 0.12);
    
    // Taxes (typically 10-12%)
    const taxes = Math.round((basePrice - discount) * 0.10);
    
    // Total calculation
    const total = basePrice - discount + listing.cleaningFee + serviceFee + taxes;
    
    res.json({
        nights,
        nightlyRate: listing.price,
        basePrice,
        cleaningFee: listing.cleaningFee,
        serviceFee,
        taxes,
        discount,
        discountType,
        discountPercentage: discountType === 'weekly' ? listing.weeklyDiscount : 
                          discountType === 'monthly' ? listing.monthlyDiscount : 0,
        total,
        currency: '₹'
    });
}));

// Check availability
app.post('/api/check-availability', wrapAsync(async (req, res) => {
    const { listingId, checkIn, checkOut } = req.body;
    
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    const isAvailable = await Booking.checkAvailability(listingId, checkInDate, checkOutDate);
    
    res.json({ 
        available: isAvailable,
        message: isAvailable ? 'Dates are available' : 'Dates are not available'
    });
}));

// Get booked dates for a listing
app.get('/api/listings/:id/booked-dates', wrapAsync(async (req, res) => {
    const bookings = await Booking.find({
        listing: req.params.id,
        status: { $in: ['confirmed', 'pending'] }
    }).select('checkIn checkOut');
    
    const bookedDates = bookings.map(booking => ({
        checkIn: booking.checkIn,
        checkOut: booking.checkOut
    }));
    
    res.json({ bookedDates });
}));

// ============================================
// STAYS/LISTINGS ROUTES - Browse all accommodations
// ============================================

// Redirect /listings to /stays for better URL structure
app.get('/listings', (req, res) => {
    const queryString = new URLSearchParams(req.query).toString();
    res.redirect(queryString ? `/stays?${queryString}` : '/stays');
});

// Main stays/listings page with filters
app.get('/stays', wrapAsync(async (req, res) => {
    const { 
        location, 
        country, 
        search, 
        name,
        minPrice,
        maxPrice,
        propertyType,
        guests,
        bedrooms,
        bathrooms,
        amenities,
        instantBook
    } = req.query;
    
    let query = {};
    
    // Search by property name (title)
    if (name && name.trim()) {
        query.title = new RegExp(name.trim(), 'i');
    }
    
    // General search across multiple fields
    if (search && search.trim()) {
        const searchTerm = search.trim();
        query.$or = [
            { title: new RegExp(searchTerm, 'i') },
            { location: new RegExp(searchTerm, 'i') },
            { country: new RegExp(searchTerm, 'i') },
            { description: new RegExp(searchTerm, 'i') }
        ];
    }
    
    // Filter by location if provided (city)
    if (location && !search) {
        query.location = new RegExp(location, 'i'); // Case-insensitive search
    }
    
    // Filter by country/region if provided
    if (country && !search) {
        query.country = new RegExp(country, 'i');
    }
    
    // Price range filter
    if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    
    // Property type filter
    if (propertyType && propertyType.trim()) {
        query.propertyType = propertyType.trim();
    }
    
    // Number of guests filter
    if (guests) {
        query.maxGuests = { $gte: Number(guests) };
    }
    
    // Number of bedrooms filter
    if (bedrooms) {
        query.bedrooms = { $gte: Number(bedrooms) };
    }
    
    // Number of bathrooms filter
    if (bathrooms) {
        query.bathrooms = { $gte: Number(bathrooms) };
    }
    
    // Amenities filter (must have all selected amenities)
    if (amenities) {
        const amenitiesList = Array.isArray(amenities) ? amenities : [amenities];
        if (amenitiesList.length > 0) {
            query.amenities = { $all: amenitiesList };
        }
    }
    
    // Instant book filter
    if (instantBook === 'true') {
        query.instantBook = true;
    }
    
    const listings = await Listing.find(query);
    
    // Store recent search in session
    if (search || location || country || name) {
        if (!req.session.recentSearches) {
            req.session.recentSearches = [];
        }
        
        const searchQuery = search || location || country || name;
        // Avoid duplicates and limit to 5 recent searches
        req.session.recentSearches = [
            searchQuery,
            ...req.session.recentSearches.filter(s => s !== searchQuery)
        ].slice(0, 5);
    }
    
    let pageTitle = 'All Listings';
    if (search) {
        pageTitle = `Search results for "${search}"`;
    } else if (name) {
        pageTitle = `Properties matching "${name}"`;
    } else if (location) {
        pageTitle = `Listings in ${location}`;
    } else if (country) {
        pageTitle = `Listings in ${country}`;
    }
    
    res.render('listings/index', { 
        pageTitle: pageTitle,
        listings: listings
    });
}));

// Protect listing routes
app.get('/listings/new', isLoggedIn, (req, res) => {
    res.render('listings/new', { pageTitle: 'Add New Listing' });
});

app.post('/listings', isLoggedIn, validateListing, wrapAsync(async (req, res) => {
    const listing = new Listing(req.body);
    listing.owner = req.user._id;
    await listing.save();
    req.flash('success', 'Successfully created a new listing!');
    res.redirect(`/listings/${listing._id}`);
}));

app.get('/listings/:id/edit', isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
        throw new ExpressError('Listing not found', 404);
    }
    res.render('listings/edit', {
        listing,
        pageTitle: 'Edit Listing'
    });
}));

app.put('/listings/:id', isLoggedIn, isOwner, validateListing, wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndUpdate(id, req.body, {
        runValidators: true,
        new: true
    });
    req.flash('success', 'Successfully updated listing!');
    res.redirect(`/listings/${id}`);
}));

app.delete('/listings/:id', isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    await Listing.findByIdAndDelete(req.params.id);
    req.flash('success', 'Successfully deleted listing');
    res.redirect('/listings');
}));

// Protect review routes
app.post('/listings/:id/reviews', isLoggedIn, validateReview, wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
        throw new ExpressError('Listing not found', 404);
    }

    const review = new Review(req.body);
    review.author = req.user._id;
    listing.reviews.push(review);

    await review.save();
    await listing.save();

    req.flash('success', 'Successfully created review!');
    res.redirect(`/listings/${listing._id}`);
}));

app.delete('/listings/:id/reviews/:reviewId', isLoggedIn, isReviewAuthor, wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, {
        $pull: { reviews: reviewId }
    });
    await Review.findByIdAndDelete(reviewId);

    req.flash('success', 'Successfully deleted review');
    res.redirect(`/listings/${id}`);
}));

// Host Review Routes
// Create host review (guests review the host after stay)
app.post('/listings/:id/host-reviews', isLoggedIn, validateHostReview, wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
        throw new ExpressError('Listing not found', 404);
    }

    const hostReview = new HostReview(req.body);
    hostReview.author = req.user._id;
    hostReview.listing = listing._id;
    
    listing.hostReviews.push(hostReview);

    await hostReview.save();
    await listing.save();

    req.flash('success', 'Thank you for reviewing your host!');
    res.redirect(`/listings/${listing._id}`);
}));

// Get all host reviews for a listing
app.get('/listings/:id/host-reviews', wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id)
        .populate({
            path: 'hostReviews',
            populate: { path: 'author' }
        });
    
    if (!listing) {
        throw new ExpressError('Listing not found', 404);
    }

    res.render('listings/hostReviews', {
        listing,
        pageTitle: `Reviews for ${listing.ownerName}`
    });
}));

// Delete host review
app.delete('/listings/:id/host-reviews/:reviewId', isLoggedIn, isHostReviewAuthor, wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, {
        $pull: { hostReviews: reviewId }
    });
    await HostReview.findByIdAndDelete(reviewId);

    req.flash('success', 'Host review deleted');
    res.redirect(`/listings/${id}`);
}));

// Protect booking routes
app.post('/listings/:id/book', isLoggedIn, validateBooking, wrapAsync(async (req, res) => {
    const { checkIn, checkOut, adults, children, infants, pets, specialRequests } = req.body;
    
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
        req.flash('error', 'Listing not found');
        return res.redirect('/listings');
    }
    
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    // Check availability
    const isAvailable = await Booking.checkAvailability(req.params.id, checkInDate, checkOutDate);
    if (!isAvailable) {
        req.flash('error', 'These dates are not available');
        return res.redirect(`/listings/${req.params.id}`);
    }
    
    // Calculate nights
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    
    // Validate minimum/maximum stay
    if (nights < listing.minimumStay) {
        req.flash('error', `Minimum stay is ${listing.minimumStay} night${listing.minimumStay > 1 ? 's' : ''}`);
        return res.redirect(`/listings/${req.params.id}`);
    }
    
    if (nights > listing.maximumStay) {
        req.flash('error', `Maximum stay is ${listing.maximumStay} nights`);
        return res.redirect(`/listings/${req.params.id}`);
    }
    
    // Validate guest count
    const totalGuests = (parseInt(adults) || 1) + (parseInt(children) || 0);
    if (totalGuests > listing.maxGuests) {
        req.flash('error', `This property accommodates a maximum of ${listing.maxGuests} guests`);
        return res.redirect(`/listings/${req.params.id}`);
    }
    
    // Calculate pricing
    const basePrice = listing.price * nights;
    let discount = 0;
    let discountType = 'none';
    
    if (nights >= 28 && listing.monthlyDiscount > 0) {
        discount = (basePrice * listing.monthlyDiscount) / 100;
        discountType = 'monthly';
    } else if (nights >= 7 && listing.weeklyDiscount > 0) {
        discount = (basePrice * listing.weeklyDiscount) / 100;
        discountType = 'weekly';
    }
    
    const serviceFee = listing.serviceFee || Math.round(basePrice * 0.12);
    const taxes = Math.round((basePrice - discount) * 0.10);
    const total = basePrice - discount + listing.cleaningFee + serviceFee + taxes;
    
    // Create booking
    const booking = new Booking({
        listing: listing._id,
        guest: req.user._id, // Assumes user is logged in
        host: listing.owner || req.user._id, // Add owner field to listings later
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests: {
            adults: parseInt(adults) || 1,
            children: parseInt(children) || 0,
            infants: parseInt(infants) || 0,
            pets: parseInt(pets) || 0
        },
        nights,
        pricing: {
            basePrice,
            nightlyRate: listing.price,
            cleaningFee: listing.cleaningFee,
            serviceFee,
            taxes,
            discount,
            discountType,
            total
        },
        specialRequests,
        status: listing.instantBook ? 'confirmed' : 'pending'
    });
    
    await booking.save();
    
    req.flash('success', listing.instantBook ? 'Booking confirmed!' : 'Booking request sent!');
    res.redirect(`/bookings/${booking._id}`);
}));

// View single booking
app.get('/bookings/:id', isLoggedIn, isBookingGuest, wrapAsync(async (req, res) => {
    const booking = await Booking.findById(req.params.id)
        .populate('listing')
        .populate('guest')
        .populate('host');
    
    if (!booking) {
        req.flash('error', 'Booking not found');
        return res.redirect('/bookings');
    }
    
    res.render('bookings/show', { 
        pageTitle: 'Booking Details',
        booking 
    });
}));

// View all bookings (for logged-in user)
app.get('/bookings', isLoggedIn, wrapAsync(async (req, res) => {
    const { filter = 'upcoming' } = req.query;
    const now = new Date();
    
    let query = {
        $or: [
            { guest: req.user._id },
            { host: req.user._id }
        ]
    };
    
    // Apply filters
    if (filter === 'upcoming') {
        query.checkIn = { $gte: now };
        query.status = { $in: ['confirmed', 'pending'] };
    } else if (filter === 'past') {
        query.checkOut = { $lt: now };
    } else if (filter === 'cancelled') {
        query.status = 'cancelled';
    }
    
    const bookings = await Booking.find(query)
        .populate('listing')
        .populate('guest')
        .populate('host')
        .sort({ checkIn: -1 });
    
    res.render('bookings/index', { 
        pageTitle: 'My Bookings',
        bookings,
        filter
    });
}));

// Cancel booking
app.post('/bookings/:id/cancel', isLoggedIn, isBookingGuest, wrapAsync(async (req, res) => {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
        req.flash('error', 'Booking not found');
        return res.redirect('/bookings');
    }
    
    if (!booking.canBeCancelled()) {
        req.flash('error', 'This booking cannot be cancelled (less than 24 hours until check-in)');
        return res.redirect(`/bookings/${booking._id}`);
    }
    
    booking.status = 'cancelled';
    booking.cancellationReason = reason;
    await booking.save();
    
    req.flash('success', 'Booking cancelled successfully');
    res.redirect(`/bookings/${booking._id}`);
}));

// Modify booking - Show modification form
app.get('/bookings/:id/modify', isLoggedIn, isBookingGuest, wrapAsync(async (req, res) => {
    const booking = await Booking.findById(req.params.id).populate('listing');
    
    if (!booking) {
        req.flash('error', 'Booking not found');
        return res.redirect('/bookings');
    }
    
    // Check if booking can be modified (at least 48 hours before check-in)
    const now = new Date();
    const checkIn = new Date(booking.checkIn);
    const hoursUntilCheckIn = (checkIn - now) / (1000 * 60 * 60);
    
    if (hoursUntilCheckIn < 48) {
        req.flash('error', 'Bookings cannot be modified within 48 hours of check-in');
        return res.redirect(`/bookings/${booking._id}`);
    }
    
    if (booking.status !== 'confirmed' && booking.status !== 'pending') {
        req.flash('error', 'Only confirmed or pending bookings can be modified');
        return res.redirect(`/bookings/${booking._id}`);
    }
    
    res.render('bookings/modify', { booking });
}));

// Modify booking - Process modification
app.post('/bookings/:id/modify', isLoggedIn, isBookingGuest, validateBooking, wrapAsync(async (req, res) => {
    const { checkIn, checkOut, adults, children, infants, pets } = req.body;
    const booking = await Booking.findById(req.params.id).populate('listing');
    
    if (!booking) {
        req.flash('error', 'Booking not found');
        return res.redirect('/bookings');
    }
    
    // Validate modification is allowed
    const now = new Date();
    const currentCheckIn = new Date(booking.checkIn);
    const hoursUntilCheckIn = (currentCheckIn - now) / (1000 * 60 * 60);
    
    if (hoursUntilCheckIn < 48) {
        req.flash('error', 'Bookings cannot be modified within 48 hours of check-in');
        return res.redirect(`/bookings/${booking._id}`);
    }
    
    const newCheckIn = new Date(checkIn);
    const newCheckOut = new Date(checkOut);
    
    // Validate dates
    if (newCheckIn <= new Date()) {
        req.flash('error', 'Check-in date must be in the future');
        return res.redirect(`/bookings/${booking._id}/modify`);
    }
    
    if (newCheckOut <= newCheckIn) {
        req.flash('error', 'Check-out must be after check-in');
        return res.redirect(`/bookings/${booking._id}/modify`);
    }
    
    // Check availability for new dates (excluding current booking)
    const isAvailable = await Booking.checkAvailability(
        booking.listing._id,
        newCheckIn,
        newCheckOut,
        booking._id
    );
    
    if (!isAvailable) {
        req.flash('error', 'Property is not available for the selected dates');
        return res.redirect(`/bookings/${booking._id}/modify`);
    }
    
    // Validate guest count
    const totalGuests = parseInt(adults) + parseInt(children);
    if (totalGuests > booking.listing.maxGuests) {
        req.flash('error', `Maximum ${booking.listing.maxGuests} guests allowed`);
        return res.redirect(`/bookings/${booking._id}/modify`);
    }
    
    // Calculate nights
    const nights = Math.ceil((newCheckOut - newCheckIn) / (1000 * 60 * 60 * 24));
    
    // Validate minimum/maximum stay
    if (nights < (booking.listing.minimumStay || 1)) {
        req.flash('error', `Minimum stay is ${booking.listing.minimumStay} night(s)`);
        return res.redirect(`/bookings/${booking._id}/modify`);
    }
    
    if (nights > (booking.listing.maximumStay || 365)) {
        req.flash('error', `Maximum stay is ${booking.listing.maximumStay} days`);
        return res.redirect(`/bookings/${booking._id}/modify`);
    }
    
    // Recalculate pricing
    const basePrice = booking.listing.price * nights;
    const cleaningFee = booking.listing.cleaningFee || 0;
    const serviceFee = booking.listing.serviceFee || Math.round(booking.listing.price * 0.12);
    
    // Calculate discount
    let discount = 0;
    let discountType = 'none';
    
    if (nights >= 28 && booking.listing.monthlyDiscount > 0) {
        discount = Math.round(basePrice * (booking.listing.monthlyDiscount / 100));
        discountType = 'monthly';
    } else if (nights >= 7 && booking.listing.weeklyDiscount > 0) {
        discount = Math.round(basePrice * (booking.listing.weeklyDiscount / 100));
        discountType = 'weekly';
    }
    
    const subtotal = basePrice + cleaningFee + serviceFee - discount;
    const taxes = Math.round(subtotal * 0.12);
    const total = subtotal + taxes;
    
    // Update booking
    booking.checkIn = newCheckIn;
    booking.checkOut = newCheckOut;
    booking.guests = {
        adults: parseInt(adults),
        children: parseInt(children),
        infants: parseInt(infants),
        pets: parseInt(pets || 0)
    };
    booking.pricing = {
        basePrice,
        nightlyRate: booking.listing.price,
        cleaningFee,
        serviceFee,
        taxes,
        discount,
        discountType,
        total
    };
    
    await booking.save();
    
    req.flash('success', 'Booking modified successfully! Check your email for updated confirmation.');
    res.redirect(`/bookings/${booking._id}`);
}));

// Download booking invoice
app.get('/bookings/:id/invoice', isLoggedIn, isBookingGuest, wrapAsync(async (req, res) => {
    const booking = await Booking.findById(req.params.id)
        .populate('listing')
        .populate('guest')
        .populate('host');
    
    if (!booking) {
        req.flash('error', 'Booking not found');
        return res.redirect('/bookings');
    }
    
    res.render('bookings/invoice', { booking, layout: false });
}));

// ============================================
// EXPERIENCES ROUTE - Unique travel experiences
// ============================================
app.get('/experiences', wrapAsync(async (req, res) => {
    const { sort = 'popular', minPrice, maxPrice, minRating, location, category } = req.query;

    // Build filter object
    let filter = {};
    
    // Price range filter
    if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = Number(minPrice);
        if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    
    // Location filter
    if (location && location.trim()) {
        filter.$or = [
            { location: new RegExp(location, 'i') },
            { country: new RegExp(location, 'i') }
        ];
    }

    // Build sort object
    let sortObj = {};
    switch (sort) {
        case 'price-low':
            sortObj = { price: 1 };
            break;
        case 'price-high':
            sortObj = { price: -1 };
            break;
        case 'rating':
            sortObj = { rating: -1 };
            break;
        case 'newest':
            sortObj = { createdAt: -1 };
            break;
        default: // popular
            sortObj = { reviewCount: -1, rating: -1 };
    }

    try {
        // Get all listings and populate reviews
        const listings = await Listing.find(filter)
            .populate('reviews')
            .sort(sortObj);

        // Calculate review statistics for each listing
        const experiences = listings.map(listing => {
            const reviewCount = listing.reviews ? listing.reviews.length : 0;               
            const averageRating = reviewCount > 0
                ? listing.reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviewCount
                : 0;
            return {
                _id: listing._id,
                title: listing.title,
                description: listing.description,
                location: listing.location,
                image: listing.image,
                price: listing.price,
                country: listing.country,
                reviewCount,
                averageRating: Math.round(averageRating * 10) / 10,
                reviews: listing.reviews
            };
        });

        // Filter by minimum rating if specified
        const filteredExperiences = minRating
            ? experiences.filter(exp => exp.averageRating >= Number(minRating))
            : experiences;
        
        // Get unique locations for filter dropdown
        const uniqueLocations = [...new Set(listings.map(l => l.location))].sort();

        res.render('experiences/index', {
            experiences: filteredExperiences,
            currentSort: sort,
            filters: { minPrice, maxPrice, minRating, location, category },
            pageTitle: 'Experiences - Discover Unique Adventures',
            uniqueLocations: uniqueLocations,
            totalExperiences: filteredExperiences.length
        });
    } catch (error) {
        console.error('Error loading experiences:', error);
        req.flash('error', 'Error loading experiences');
        res.redirect('/');
    }
}));

// ============================================
// EXPERIENCE DETAIL ROUTE
// ============================================
app.get('/experiences/:id', wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id).populate({ path: 'reviews', populate: { path: 'author' } });
    if (!listing) {
        req.flash('error', 'Experience not found');
        return res.redirect('/experiences');
    }

    const CATEGORIES = ['Adventure', 'Culture', 'Food & Drink', 'Nature', 'Wellness', 'Art', 'Sports', 'City Tour'];
    const CATEGORY_ICONS = {
        'Adventure': 'mountain', 'Culture': 'landmark', 'Food & Drink': 'utensils',
        'Nature': 'leaf', 'Wellness': 'spa', 'Art': 'palette', 'Sports': 'running', 'City Tour': 'city'
    };
    const DURATIONS = ['2–3 hours', '3–4 hours', '4–5 hours', 'Half day', 'Full day'];
    const HOST_NAMES = ['Arjun S.', 'Priya K.', 'Rahul M.', 'Ananya R.', 'Vikram P.', 'Deepa L.'];

    // Derive deterministic extras from the listing id
    const idNum = parseInt(listing._id.toString().slice(-4), 16);
    const category = CATEGORIES[idNum % CATEGORIES.length];
    const categoryIcon = CATEGORY_ICONS[category] || 'compass';
    const duration = DURATIONS[idNum % DURATIONS.length];
    const hostName = HOST_NAMES[idNum % HOST_NAMES.length];

    const reviewCount = listing.reviews ? listing.reviews.length : 0;
    const averageRating = reviewCount > 0
        ? listing.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewCount
        : 0;

    const experience = {
        ...listing.toObject(),
        category,
        categoryIcon,
        duration,
        hostName,
        reviewCount,
        averageRating: Math.round(averageRating * 10) / 10,
        reviews: listing.reviews
    };

    res.render('experiences/show', {
        experience,
        pageTitle: listing.title + ' - Experience'
    });
}));

// 404 route - must come after all defined routes
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});

// Error handling middleware
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;

    // Ensure valid status code
    if (typeof statusCode !== 'number' || statusCode < 100 || statusCode > 599) {
        statusCode = 500;
    }

    console.error('Error occurred:', err);
    res.status(statusCode).render("error", { message, statusCode, pageTitle: 'Error' });
});

// Server start - single instance
const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
    console.log(`🏠 Home Page: http://localhost:${port}/`);
    console.log(`🏨 Browse Stays: http://localhost:${port}/stays`);
    console.log(`✨ Experiences: http://localhost:${port}/experiences`);
});
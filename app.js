const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');

// Models - you'll need to create these files
const Listing = require('./models/listing');
const Review = require('./models/review');

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

// Validation middleware
const validateListing = (req, res, next) => {
    // Add validation logic here
    next();
};

const validateReview = (req, res, next) => {
    // Add validation logic here
    next();
};

// A temporary User model placeholder - you'll replace this with your actual model
const User = {
    authenticate() {
        return () => true;
    },
    serializeUser() {
        return (user, done) => done(null, user);
    },
    deserializeUser() {
        return (id, done) => done(null, id);
    }
};

// Initialize Express app
const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/wanderlust')
    .then(() => {
        console.log("Database connected");
    })
    .catch(err => {
        console.log("MongoDB connection error");
        console.log(err);
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

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
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

// Home route
app.get('/', (req, res) => {
    res.render("home", { pageTitle: "Wanderlust - Find Your Adventure" });
});

// Listing Routes
app.get('/listings', (req, res) => {
    res.render('listings/index'); // Ensure this path matches the view file
});

app.get('/listings/new', (req, res) => {
    res.render('listings/new', { pageTitle: 'Add New Listing' });
});

app.post('/listings', validateListing, wrapAsync(async (req, res) => {
    const listing = new Listing(req.body);
    await listing.save();
    res.redirect(`/listings/${listing._id}`);
}));

app.get('/listings/:id', wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id).populate('reviews');
    if (!listing) {
        throw new ExpressError('Listing not found', 404);
    }
    res.render('listings/show', {
        listing,
        pageTitle: listing.title
    });
}));

app.get('/listings/:id/edit', wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
        throw new ExpressError('Listing not found', 404);
    }
    res.render('listings/edit', {
        listing,
        pageTitle: 'Edit Listing'
    });
}));

app.put('/listings/:id', validateListing, wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndUpdate(id, req.body, {
        runValidators: true,
        new: true
    });
    res.redirect(`/listings/${id}`);
}));

app.delete('/listings/:id', wrapAsync(async (req, res) => {
    await Listing.findByIdAndDelete(req.params.id);
    res.redirect('/listings');
}));

// Review Routes
app.post('/listings/:id/reviews', validateReview, wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
        throw new ExpressError('Listing not found', 404);
    }

    const review = new Review(req.body);
    listing.reviews.push(review);

    await review.save();
    await listing.save();

    res.redirect(`/listings/${listing._id}`);
}));

app.delete('/listings/:id/reviews/:reviewId', wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, {
        $pull: { reviews: reviewId }
    });
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
}));

// Experiences Route
app.get('/experiences', wrapAsync(async (req, res) => {
    const { sort = 'popular', minPrice, maxPrice, minRating } = req.query;

    // Build filter object
    let filter = {};
    if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = Number(minPrice);
        if (maxPrice) filter.price.$lte = Number(maxPrice);
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
            sortObj = { averageRating: -1 };
            break;
        case 'newest':
            sortObj = { createdAt: -1 };
            break;
        default: // popular
            sortObj = { reviewCount: -1, averageRating: -1 };
    }

    // Aggregate pipeline for experiences
    const experiences = await Listing.aggregate([
        { $match: filter },
        {
            $lookup: {
                from: 'reviews',
                localField: 'reviews',
                foreignField: '_id',
                as: 'reviewDetails'
            }
        },
        {
            $addFields: {
                reviewCount: { $size: '$reviewDetails' },
                averageRating: {
                    $cond: {
                        if: { $gt: [{ $size: '$reviewDetails' }, 0] },
                        then: { $avg: '$reviewDetails.rating' },
                        else: 0
                    }
                }
            }
        },
        {
            $match: minRating ? { averageRating: { $gte: Number(minRating) } } : {}
        },
        { $sort: sortObj },
        {
            $project: {
                title: 1,
                description: 1,
                image: 1,
                price: 1,
                location: 1,
                country: 1,
                reviewCount: 1,
                averageRating: 1,
                reviews: 1
            }
        }
    ]);

    res.render('experiences/index', {
        experiences,
        currentSort: sort,
        filters: { minPrice, maxPrice, minRating },
        pageTitle: 'Experiences'
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
    console.log(`📱 Visit http://localhost:${port}/listings`);
});
app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
    console.log(`📱 Visit http://localhost:${port}/listings`);
});

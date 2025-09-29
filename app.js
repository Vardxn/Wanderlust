const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const wrapAsync = require('./utils/wrapAsync');
const ExpressError = require('./utils/ExpressError');
const { listingSchema, reviewSchema } = require('./schema');
const Listing = require('./models/listing');
const Review = require('./models/review');

const app = express();

// MongoDB Connection
mongoose.set('strictQuery', false);
const dbUrl = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/wanderlust';

(async function connectDB() {
    try {
        await mongoose.connect(dbUrl);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
})();

// Middleware Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Validation Middleware
const validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(', ');
        throw new ExpressError(400, msg);
    }
    next();
};

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(', ');
        throw new ExpressError(400, msg);
    }
    next();
};

// Global Middleware for Views
app.use((req, res, next) => {
    res.locals.currentUser = req.user || null;
    res.locals.isLoggedIn = !!req.user;
    res.locals.currentPath = req.path;
    res.locals.navbarData = {
        user: req.user || null,
        isLoggedIn: !!req.user,
        currentTab: req.path.includes('experiences') ? 'experiences' : 'stays',
        searchParams: req.query || {}
    };
    next();
});

// ROUTES
// Root Route
app.get('/', (req, res) => {
    res.redirect('/listings');
});

// Listing Routes
app.get('/listings', wrapAsync(async (req, res) => {
    const listings = await Listing.find({});
    console.log(`Fetched ${listings.length} listings`);
    res.render('listings/index', {
        listings,
        pageTitle: 'All Listings'
    });
}));

app.get('/listings/new', (req, res) => {
    res.render('listings/new', {
        pageTitle: 'Add New Listing'
    });
});

app.post('/listings', validateListing, wrapAsync(async (req, res) => {
    const listing = new Listing(req.body);
    await listing.save();
    res.redirect(`/listings/${listing._id}`);
}));

app.get('/listings/:id', wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id).populate('reviews');
    if (!listing) {
        throw new ExpressError(404, 'Listing not found');
    }
    res.render('listings/show', {
        listing,
        pageTitle: listing.title
    });
}));

app.get('/listings/:id/edit', wrapAsync(async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
        throw new ExpressError(404, 'Listing not found');
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
        throw new ExpressError(404, 'Listing not found');
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

// Error Handling Middleware
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;

    // Ensure valid status code
    if (typeof statusCode !== 'number' || statusCode < 100 || statusCode > 599) {
        statusCode = 500;
    }

    console.error('Error occurred:', err);
    res.status(statusCode).render("error", { message, statusCode });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).render("error", {
        message: "Page not found",
        statusCode: 404
    });
});

// Server Start
const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
    console.log(`📱 Visit http://localhost:${port}/listings`);
});
res.status(404).render("error.ejs", { message: "Page not found", statusCode: 404 });
});

// const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`Visit http://localhost:${port}/listings in your browser to view the application`);
});

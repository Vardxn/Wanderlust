const Listing = require('../models/listing');
const Review = require('../models/review');
const HostReview = require('../models/hostReview');
const Booking = require('../models/booking');

/**
 * Middleware to check if user is logged in
 */
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
};

/**
 * Middleware to check if user is the owner of a listing
 */
module.exports.isOwner = async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    
    if (!listing) {
        req.flash('error', 'Listing not found');
        return res.redirect('/listings');
    }
    
    if (!listing.owner || !listing.owner.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/listings/${id}`);
    }
    next();
};

/**
 * Middleware to check if user is the author of a review
 */
module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    
    if (!review) {
        req.flash('error', 'Review not found');
        return res.redirect(`/listings/${id}`);
    }
    
    if (!review.author || !review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/listings/${id}`);
    }
    next();
};

/**
 * Middleware to check if user is the author of a host review
 */
module.exports.isHostReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const hostReview = await HostReview.findById(reviewId);
    
    if (!hostReview) {
        req.flash('error', 'Review not found');
        return res.redirect(`/listings/${id}`);
    }
    
    if (!hostReview.author || !hostReview.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/listings/${id}`);
    }
    next();
};

/**
 * Middleware to check if user is guest or host of a booking
 */
module.exports.isBookingGuest = async (req, res, next) => {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    
    if (!booking) {
        req.flash('error', 'Booking not found');
        return res.redirect('/bookings');
    }
    
    const isGuest = booking.guest && booking.guest.equals(req.user._id);
    const isHost = booking.host && booking.host.equals(req.user._id);
    
    if (!isGuest && !isHost) {
        req.flash('error', 'You do not have permission to view this booking');
        return res.redirect('/bookings');
    }
    next();
};

/**
 * Middleware to store return URL for redirecting after login
 */
module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
};

/**
 * Middleware to check if user is admin (for future admin panel)
 */
module.exports.isAdmin = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    
    if (!req.user.isAdmin) {
        req.flash('error', 'Access denied. Admin privileges required.');
        return res.redirect('/');
    }
    next();
};

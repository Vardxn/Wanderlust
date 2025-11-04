/**
 * MongoDB Models Index
 * Central export point for all Mongoose models
 */

const User = require('./User');
const Listing = require('./Listing');
const Booking = require('./Booking');
const Review = require('./Review');

module.exports = {
    User,
    Listing,
    Booking,
    Review
};

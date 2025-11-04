const express = require('express');
const router = express.Router();
const bookingsController = require('../../../controllers/api/v1/bookingsController');
const { isLoggedIn } = require('../../../middleware/auth');

// Price Quote
router.post('/quote', bookingsController.getPriceQuote);

// Create Booking
router.post('/', isLoggedIn, bookingsController.createBooking);

// Booking Confirmation
router.get('/:booking_id', isLoggedIn, bookingsController.getBookingById);

module.exports = router;

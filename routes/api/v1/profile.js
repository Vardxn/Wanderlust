const express = require('express');
const router = express.Router();
const profileController = require('../../../controllers/api/v1/profileController');
const { isLoggedIn } = require('../../../middleware/auth');

// All profile routes require authentication
router.use(isLoggedIn);

// Profile Management
router.get('/', profileController.getProfile);
router.put('/', profileController.updateProfile);

// Booking History
router.get('/bookings', profileController.getBookingHistory);

module.exports = router;

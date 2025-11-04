const express = require('express');
const router = express.Router();
const listingsController = require('../../../controllers/api/v1/listingsController');

// Search and Discovery
router.get('/search', listingsController.searchListings);

// Listing Details
router.get('/:listing_id', listingsController.getListingById);

// Reviews for a listing
router.get('/:listing_id/reviews', listingsController.getListingReviews);

module.exports = router;

const Listing = require('../../../models/listing');
const Review = require('../../../models/review');

module.exports.searchListings = async (req, res) => {
  try {
    const {
      location,
      check_in_date,
      check_out_date,
      guests,
      min_price,
      max_price,
      property_types,
      amenities,
      sort_by = 'created_at',
      sort_order = 'desc',
      page = 1,
      limit = 20
    } = req.query;

    // Build query
    const query = { is_active: true };

    // Location search (case-insensitive partial match)
    if (location) {
      query.$or = [
        { 'location.city': { $regex: location, $options: 'i' } },
        { 'location.state': { $regex: location, $options: 'i' } },
        { 'location.country': { $regex: location, $options: 'i' } }
      ];
    }

    // Guest capacity
    if (guests) {
      query.max_guests = { $gte: parseInt(guests) };
    }

    // Price range
    if (min_price || max_price) {
      query.price_per_night = {};
      if (min_price) query.price_per_night.$gte = parseFloat(min_price);
      if (max_price) query.price_per_night.$lte = parseFloat(max_price);
    }

    // Property types
    if (property_types) {
      const types = Array.isArray(property_types) ? property_types : [property_types];
      query.property_type = { $in: types };
    }

    // Amenities (all must match)
    if (amenities) {
      const amenitiesList = Array.isArray(amenities) ? amenities : [amenities];
      query.amenities = { $all: amenitiesList };
    }

    // Date availability check (if dates provided)
    if (check_in_date && check_out_date) {
      const Booking = require('../../../models/booking');
      const checkIn = new Date(check_in_date);
      const checkOut = new Date(check_out_date);

      // Find listings with conflicting bookings
      const conflictingBookings = await Booking.find({
        status: { $in: ['confirmed', 'pending'] },
        $or: [
          { check_in_date: { $lt: checkOut }, check_out_date: { $gt: checkIn } }
        ]
      }).distinct('listing');

      query._id = { $nin: conflictingBookings };
    }

    // Sorting
    const sortOptions = {};
    sortOptions[sort_by] = sort_order === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const listings = await Listing.find(query)
      .populate('host', 'first_name last_name profile_photo')
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Listing.countDocuments(query);

    res.json({
      success: true,
      data: listings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports.getListingById = async (req, res) => {
  try {
    const { listing_id } = req.params;

    const listing = await Listing.findById(listing_id)
      .populate('host', 'first_name last_name profile_photo bio created_at');

    if (!listing) {
      return res.status(404).json({ success: false, error: 'Listing not found' });
    }

    res.json({ success: true, data: listing });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports.getListingReviews = async (req, res) => {
  try {
    const { listing_id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.find({ listing: listing_id })
      .populate('reviewer', 'first_name last_name profile_photo')
      .sort({ created_at: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Review.countDocuments({ listing: listing_id });

    res.json({
      success: true,
      data: reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

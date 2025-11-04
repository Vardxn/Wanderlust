const Booking = require('../../../models/booking');
const Listing = require('../../../models/listing');
const { calculatePriceBreakdown } = require('../../../utils/priceCalculator');

module.exports.getPriceQuote = async (req, res) => {
  try {
    const { listing_id, check_in_date, check_out_date, guests } = req.body;

    // Validate input
    if (!listing_id || !check_in_date || !check_out_date || !guests) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: listing_id, check_in_date, check_out_date, guests'
      });
    }

    const checkIn = new Date(check_in_date);
    const checkOut = new Date(check_out_date);

    // Validate dates
    if (checkIn >= checkOut) {
      return res.status(400).json({
        success: false,
        error: 'Check-out date must be after check-in date'
      });
    }

    // Get listing
    const listing = await Listing.findById(listing_id);
    if (!listing) {
      return res.status(404).json({ success: false, error: 'Listing not found' });
    }

    if (!listing.is_active) {
      return res.status(400).json({ success: false, error: 'Listing is not available' });
    }

    if (guests > listing.max_guests) {
      return res.status(400).json({
        success: false,
        error: `Maximum guests allowed: ${listing.max_guests}`
      });
    }

    // Check for overlapping bookings
    const overlappingBookings = await Booking.findOne({
      listing: listing_id,
      status: { $in: ['confirmed', 'pending'] },
      $or: [
        { check_in_date: { $lt: checkOut }, check_out_date: { $gt: checkIn } }
      ]
    });

    if (overlappingBookings) {
      return res.status(409).json({
        success: false,
        error: 'Listing is not available for selected dates'
      });
    }

    // Calculate price breakdown
    const priceBreakdown = calculatePriceBreakdown(
      listing.price_per_night,
      checkIn,
      checkOut,
      listing.cleaning_fee || 0
    );

    res.json({
      success: true,
      data: {
        listing_id,
        check_in_date: checkIn,
        check_out_date: checkOut,
        guests,
        available: true,
        ...priceBreakdown
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports.createBooking = async (req, res) => {
  try {
    const {
      listing_id,
      check_in_date,
      check_out_date,
      guests,
      payment_token
    } = req.body;

    // Validate input
    if (!listing_id || !check_in_date || !check_out_date || !guests || !payment_token) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const checkIn = new Date(check_in_date);
    const checkOut = new Date(check_out_date);

    // Get listing
    const listing = await Listing.findById(listing_id);
    if (!listing || !listing.is_active) {
      return res.status(404).json({ success: false, error: 'Listing not available' });
    }

    // Double-check availability
    const overlappingBookings = await Booking.findOne({
      listing: listing_id,
      status: { $in: ['confirmed', 'pending'] },
      $or: [
        { check_in_date: { $lt: checkOut }, check_out_date: { $gt: checkIn } }
      ]
    });

    if (overlappingBookings) {
      return res.status(409).json({
        success: false,
        error: 'Listing is no longer available for selected dates'
      });
    }

    // Calculate pricing
    const priceBreakdown = calculatePriceBreakdown(
      listing.price_per_night,
      checkIn,
      checkOut,
      listing.cleaning_fee || 0
    );

    // TODO: Process payment with payment_token
    // For now, we'll simulate successful payment

    // Create booking
    const booking = new Booking({
      listing: listing_id,
      guest: req.user._id,
      host: listing.host,
      check_in_date: checkIn,
      check_out_date: checkOut,
      guests,
      total_price: priceBreakdown.total_price,
      status: 'confirmed',
      payment_status: 'paid'
    });

    await booking.save();

    // Populate for response
    await booking.populate('listing', 'title location price_per_night');
    await booking.populate('host', 'first_name last_name email');

    res.status(201).json({
      success: true,
      data: booking,
      message: 'Booking created successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports.getBookingById = async (req, res) => {
  try {
    const { booking_id } = req.params;

    const booking = await Booking.findById(booking_id)
      .populate('listing', 'title location price_per_night photos')
      .populate('host', 'first_name last_name email phone_number')
      .populate('guest', 'first_name last_name email phone_number');

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    // Ensure user can only see their own bookings (or if they're the host)
    if (
      booking.guest._id.toString() !== req.user._id.toString() &&
      booking.host._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

-- ============================================================================
-- Database Views: Analytics and Reporting
-- ============================================================================
-- Useful views for querying common data patterns
-- ============================================================================

-- ============================================================================
-- VIEW: listing_details_with_host
-- ============================================================================
-- Complete listing information including host details
CREATE OR REPLACE VIEW listing_details_with_host AS
SELECT 
    l.listing_id,
    l.name AS listing_name,
    l.description,
    l.price_per_night,
    l.cleaning_fee,
    l.security_deposit,
    l.room_type,
    l.accommodates,
    l.bedrooms,
    l.beds,
    l.bathrooms,
    l.instant_bookable,
    l.cancellation_policy,
    l.city,
    l.state,
    l.country,
    l.latitude,
    l.longitude,
    l.created_at AS listing_created_at,
    pt.name AS property_type,
    u.user_id AS host_user_id,
    u.first_name AS host_first_name,
    u.last_name AS host_last_name,
    u.profile_picture_url AS host_picture,
    h.host_since,
    h.is_superhost,
    h.host_response_rate,
    h.host_response_time,
    h.total_listings_count
FROM listings l
JOIN hosts h ON l.host_id = h.host_id
JOIN users u ON h.host_id = u.user_id
JOIN property_types pt ON l.property_type_id = pt.property_type_id;

-- ============================================================================
-- VIEW: listing_average_ratings
-- ============================================================================
-- Aggregate ratings for each listing
CREATE OR REPLACE VIEW listing_average_ratings AS
SELECT 
    l.listing_id,
    l.name AS listing_name,
    COUNT(r.review_id) AS total_reviews,
    ROUND(AVG(r.rating_overall), 2) AS avg_rating_overall,
    ROUND(AVG(r.rating_cleanliness), 2) AS avg_rating_cleanliness,
    ROUND(AVG(r.rating_accuracy), 2) AS avg_rating_accuracy,
    ROUND(AVG(r.rating_checkin), 2) AS avg_rating_checkin,
    ROUND(AVG(r.rating_communication), 2) AS avg_rating_communication,
    ROUND(AVG(r.rating_location), 2) AS avg_rating_location,
    ROUND(AVG(r.rating_value), 2) AS avg_rating_value
FROM listings l
LEFT JOIN reviews r ON l.listing_id = r.listing_id
GROUP BY l.listing_id, l.name;

-- ============================================================================
-- VIEW: host_performance_metrics
-- ============================================================================
-- Performance metrics for each host
CREATE OR REPLACE VIEW host_performance_metrics AS
SELECT 
    h.host_id,
    u.first_name,
    u.last_name,
    u.email,
    h.host_since,
    h.is_superhost,
    h.total_listings_count,
    COUNT(DISTINCT l.listing_id) AS active_listings,
    COUNT(DISTINCT b.booking_id) AS total_bookings,
    COUNT(DISTINCT CASE WHEN b.status = 'Confirmed' THEN b.booking_id END) AS confirmed_bookings,
    COUNT(DISTINCT CASE WHEN b.status = 'Cancelled' THEN b.booking_id END) AS cancelled_bookings,
    COUNT(DISTINCT r.review_id) AS total_reviews,
    ROUND(AVG(r.rating_overall), 2) AS avg_rating,
    SUM(CASE WHEN b.status = 'Completed' THEN b.total_price ELSE 0 END) AS total_revenue_cents
FROM hosts h
JOIN users u ON h.host_id = u.user_id
LEFT JOIN listings l ON h.host_id = l.host_id
LEFT JOIN bookings b ON l.listing_id = b.listing_id
LEFT JOIN reviews r ON l.listing_id = r.listing_id
GROUP BY h.host_id, u.first_name, u.last_name, u.email, h.host_since, h.is_superhost, h.total_listings_count;

-- ============================================================================
-- VIEW: booking_summary
-- ============================================================================
-- Complete booking information with guest and listing details
CREATE OR REPLACE VIEW booking_summary AS
SELECT 
    b.booking_id,
    b.status,
    b.check_in_date,
    b.check_out_date,
    b.number_of_guests,
    (b.check_out_date - b.check_in_date) AS nights,
    b.total_price,
    b.created_at AS booking_created_at,
    u.user_id AS guest_id,
    u.first_name AS guest_first_name,
    u.last_name AS guest_last_name,
    u.email AS guest_email,
    l.listing_id,
    l.name AS listing_name,
    l.city AS listing_city,
    l.country AS listing_country,
    h.host_id,
    hu.first_name AS host_first_name,
    hu.last_name AS host_last_name
FROM bookings b
JOIN users u ON b.guest_id = u.user_id
JOIN listings l ON b.listing_id = l.listing_id
JOIN hosts h ON l.host_id = h.host_id
JOIN users hu ON h.host_id = hu.user_id;

-- ============================================================================
-- VIEW: upcoming_bookings
-- ============================================================================
-- All confirmed bookings with check-in dates in the future
CREATE OR REPLACE VIEW upcoming_bookings AS
SELECT 
    b.booking_id,
    b.check_in_date,
    b.check_out_date,
    b.number_of_guests,
    b.total_price,
    l.name AS listing_name,
    l.city,
    l.country,
    u.first_name AS guest_first_name,
    u.last_name AS guest_last_name,
    u.email AS guest_email,
    u.phone_number AS guest_phone,
    h.host_id,
    (b.check_in_date - CURRENT_DATE) AS days_until_checkin
FROM bookings b
JOIN listings l ON b.listing_id = l.listing_id
JOIN hosts h ON l.host_id = h.host_id
JOIN users u ON b.guest_id = u.user_id
WHERE b.status = 'Confirmed'
  AND b.check_in_date >= CURRENT_DATE
ORDER BY b.check_in_date;

-- ============================================================================
-- VIEW: popular_listings
-- ============================================================================
-- Listings ranked by booking count and average rating
CREATE OR REPLACE VIEW popular_listings AS
SELECT 
    l.listing_id,
    l.name,
    l.city,
    l.country,
    l.price_per_night,
    pt.name AS property_type,
    COUNT(DISTINCT b.booking_id) AS total_bookings,
    COUNT(DISTINCT r.review_id) AS total_reviews,
    ROUND(AVG(r.rating_overall), 2) AS avg_rating,
    l.instant_bookable
FROM listings l
JOIN property_types pt ON l.property_type_id = pt.property_type_id
LEFT JOIN bookings b ON l.listing_id = b.listing_id
LEFT JOIN reviews r ON l.listing_id = r.listing_id
GROUP BY l.listing_id, l.name, l.city, l.country, l.price_per_night, pt.name, l.instant_bookable
HAVING COUNT(DISTINCT b.booking_id) > 0
ORDER BY total_bookings DESC, avg_rating DESC;

-- ============================================================================
-- COMMENTS: View Documentation
-- ============================================================================

COMMENT ON VIEW listing_details_with_host IS 'Complete listing information including host details';
COMMENT ON VIEW listing_average_ratings IS 'Aggregate ratings for each listing';
COMMENT ON VIEW host_performance_metrics IS 'Performance metrics for each host';
COMMENT ON VIEW booking_summary IS 'Complete booking information with guest and listing details';
COMMENT ON VIEW upcoming_bookings IS 'All confirmed bookings with check-in dates in the future';
COMMENT ON VIEW popular_listings IS 'Listings ranked by booking count and average rating';

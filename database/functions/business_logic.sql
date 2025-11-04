-- ============================================================================
-- Database Functions: Business Logic and Utilities
-- ============================================================================
-- Stored procedures and functions for common operations
-- ============================================================================

-- ============================================================================
-- FUNCTION: check_listing_availability
-- ============================================================================
-- Check if a listing is available for given dates
CREATE OR REPLACE FUNCTION check_listing_availability(
    p_listing_id UUID,
    p_check_in DATE,
    p_check_out DATE
)
RETURNS BOOLEAN AS $$
DECLARE
    v_is_available BOOLEAN;
    v_min_nights INTEGER;
    v_max_nights INTEGER;
    v_nights_requested INTEGER;
BEGIN
    -- Calculate nights requested
    v_nights_requested := p_check_out - p_check_in;
    
    -- Get listing constraints
    SELECT minimum_nights, maximum_nights
    INTO v_min_nights, v_max_nights
    FROM listings
    WHERE listing_id = p_listing_id;
    
    -- Check if listing exists
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Check minimum and maximum nights
    IF v_nights_requested < v_min_nights OR v_nights_requested > v_max_nights THEN
        RETURN FALSE;
    END IF;
    
    -- Check for overlapping bookings
    SELECT NOT EXISTS (
        SELECT 1
        FROM bookings
        WHERE listing_id = p_listing_id
          AND status IN ('Confirmed', 'Pending')
          AND (
              (check_in_date <= p_check_in AND check_out_date > p_check_in)
              OR (check_in_date < p_check_out AND check_out_date >= p_check_out)
              OR (check_in_date >= p_check_in AND check_out_date <= p_check_out)
          )
    ) INTO v_is_available;
    
    RETURN v_is_available;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION: calculate_booking_price
-- ============================================================================
-- Calculate total price for a booking including fees
CREATE OR REPLACE FUNCTION calculate_booking_price(
    p_listing_id UUID,
    p_check_in DATE,
    p_check_out DATE,
    p_number_of_guests INTEGER
)
RETURNS JSONB AS $$
DECLARE
    v_price_per_night INTEGER;
    v_cleaning_fee INTEGER;
    v_security_deposit INTEGER;
    v_nights INTEGER;
    v_subtotal INTEGER;
    v_service_fee INTEGER;
    v_total INTEGER;
    v_breakdown JSONB;
BEGIN
    -- Get listing pricing
    SELECT price_per_night, cleaning_fee, security_deposit
    INTO v_price_per_night, v_cleaning_fee, v_security_deposit
    FROM listings
    WHERE listing_id = p_listing_id;
    
    -- Calculate nights
    v_nights := p_check_out - p_check_in;
    
    -- Calculate costs
    v_subtotal := v_price_per_night * v_nights;
    v_service_fee := ROUND(v_subtotal * 0.14); -- 14% service fee
    v_total := v_subtotal + COALESCE(v_cleaning_fee, 0) + v_service_fee;
    
    -- Build price breakdown
    v_breakdown := jsonb_build_object(
        'pricePerNight', v_price_per_night,
        'nights', v_nights,
        'subtotal', v_subtotal,
        'cleaningFee', COALESCE(v_cleaning_fee, 0),
        'serviceFee', v_service_fee,
        'securityDeposit', COALESCE(v_security_deposit, 0),
        'total', v_total
    );
    
    RETURN v_breakdown;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION: update_host_listing_count
-- ============================================================================
-- Update the total listings count for a host
CREATE OR REPLACE FUNCTION update_host_listing_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE hosts
        SET total_listings_count = total_listings_count + 1
        WHERE host_id = NEW.host_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE hosts
        SET total_listings_count = total_listings_count - 1
        WHERE host_id = OLD.host_id;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic listing count updates
CREATE TRIGGER trg_update_host_listing_count
    AFTER INSERT OR DELETE ON listings
    FOR EACH ROW
    EXECUTE FUNCTION update_host_listing_count();

-- ============================================================================
-- FUNCTION: prevent_overlapping_bookings
-- ============================================================================
-- Prevent creation of overlapping bookings
CREATE OR REPLACE FUNCTION prevent_overlapping_bookings()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT check_listing_availability(
        NEW.listing_id,
        NEW.check_in_date,
        NEW.check_out_date
    ) THEN
        RAISE EXCEPTION 'Listing is not available for the selected dates';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for preventing overlapping bookings
CREATE TRIGGER trg_prevent_overlapping_bookings
    BEFORE INSERT OR UPDATE ON bookings
    FOR EACH ROW
    WHEN (NEW.status IN ('Confirmed', 'Pending'))
    EXECUTE FUNCTION prevent_overlapping_bookings();

-- ============================================================================
-- FUNCTION: ensure_only_one_cover_photo
-- ============================================================================
-- Ensure only one cover photo per listing
CREATE OR REPLACE FUNCTION ensure_only_one_cover_photo()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_cover_photo = TRUE THEN
        -- Unset all other cover photos for this listing
        UPDATE photos
        SET is_cover_photo = FALSE
        WHERE listing_id = NEW.listing_id
          AND photo_id != NEW.photo_id
          AND is_cover_photo = TRUE;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for cover photo management
CREATE TRIGGER trg_ensure_only_one_cover_photo
    BEFORE INSERT OR UPDATE ON photos
    FOR EACH ROW
    WHEN (NEW.is_cover_photo = TRUE)
    EXECUTE FUNCTION ensure_only_one_cover_photo();

-- ============================================================================
-- FUNCTION: auto_create_host_profile
-- ============================================================================
-- Automatically create host profile when user becomes a host
CREATE OR REPLACE FUNCTION auto_create_host_profile()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_host = TRUE AND OLD.is_host = FALSE THEN
        INSERT INTO hosts (host_id, host_since)
        VALUES (NEW.user_id, CURRENT_DATE)
        ON CONFLICT (host_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic host profile creation
CREATE TRIGGER trg_auto_create_host_profile
    AFTER UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION auto_create_host_profile();

-- ============================================================================
-- FUNCTION: validate_guest_capacity
-- ============================================================================
-- Validate that number of guests doesn't exceed listing capacity
CREATE OR REPLACE FUNCTION validate_guest_capacity()
RETURNS TRIGGER AS $$
DECLARE
    v_max_guests INTEGER;
BEGIN
    SELECT accommodates INTO v_max_guests
    FROM listings
    WHERE listing_id = NEW.listing_id;
    
    IF NEW.number_of_guests > v_max_guests THEN
        RAISE EXCEPTION 'Number of guests (%) exceeds listing capacity (%)', 
            NEW.number_of_guests, v_max_guests;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for guest capacity validation
CREATE TRIGGER trg_validate_guest_capacity
    BEFORE INSERT OR UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION validate_guest_capacity();

-- ============================================================================
-- FUNCTION: get_listing_unavailable_dates
-- ============================================================================
-- Get all unavailable dates for a listing within a date range
CREATE OR REPLACE FUNCTION get_listing_unavailable_dates(
    p_listing_id UUID,
    p_start_date DATE,
    p_end_date DATE
)
RETURNS TABLE(unavailable_date DATE) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT date_series.date::DATE
    FROM bookings b
    CROSS JOIN LATERAL generate_series(
        b.check_in_date,
        b.check_out_date - INTERVAL '1 day',
        INTERVAL '1 day'
    ) AS date_series(date)
    WHERE b.listing_id = p_listing_id
      AND b.status IN ('Confirmed', 'Pending')
      AND date_series.date::DATE BETWEEN p_start_date AND p_end_date
    ORDER BY date_series.date::DATE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION: search_listings_by_location
-- ============================================================================
-- Search for listings within a radius of a given point
CREATE OR REPLACE FUNCTION search_listings_by_location(
    p_latitude NUMERIC,
    p_longitude NUMERIC,
    p_radius_km NUMERIC DEFAULT 10
)
RETURNS TABLE(
    listing_id UUID,
    name VARCHAR,
    distance_km NUMERIC,
    price_per_night INTEGER,
    city VARCHAR,
    country VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        l.listing_id,
        l.name,
        ROUND(
            earth_distance(
                ll_to_earth(p_latitude::float8, p_longitude::float8),
                ll_to_earth(l.latitude::float8, l.longitude::float8)
            ) / 1000,
            2
        ) AS distance_km,
        l.price_per_night,
        l.city,
        l.country
    FROM listings l
    WHERE l.latitude IS NOT NULL
      AND l.longitude IS NOT NULL
      AND earth_distance(
          ll_to_earth(p_latitude::float8, p_longitude::float8),
          ll_to_earth(l.latitude::float8, l.longitude::float8)
      ) <= p_radius_km * 1000
    ORDER BY distance_km;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS: Function Documentation
-- ============================================================================

COMMENT ON FUNCTION check_listing_availability IS 'Check if a listing is available for given dates';
COMMENT ON FUNCTION calculate_booking_price IS 'Calculate total price for a booking including fees';
COMMENT ON FUNCTION update_host_listing_count IS 'Update the total listings count for a host';
COMMENT ON FUNCTION prevent_overlapping_bookings IS 'Prevent creation of overlapping bookings';
COMMENT ON FUNCTION ensure_only_one_cover_photo IS 'Ensure only one cover photo per listing';
COMMENT ON FUNCTION auto_create_host_profile IS 'Automatically create host profile when user becomes a host';
COMMENT ON FUNCTION validate_guest_capacity IS 'Validate that number of guests does not exceed listing capacity';
COMMENT ON FUNCTION get_listing_unavailable_dates IS 'Get all unavailable dates for a listing within a date range';
COMMENT ON FUNCTION search_listings_by_location IS 'Search for listings within a radius of a given point';

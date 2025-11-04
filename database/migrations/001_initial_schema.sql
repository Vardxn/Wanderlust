-- ============================================================================
-- Wanderlust Database Schema - Initial Migration
-- ============================================================================
-- This schema defines the complete PostgreSQL database structure for the
-- Wanderlust vacation rental platform.
-- ============================================================================

-- Enable UUID generation extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE: Users
-- ============================================================================
-- Core user accounts for both guests and hosts
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    profile_picture_url VARCHAR(500),
    about_text TEXT,
    phone_number VARCHAR(20) UNIQUE,
    is_host BOOLEAN NOT NULL DEFAULT false,
    identity_verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT email_format_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT name_not_empty_check CHECK (
        LENGTH(TRIM(first_name)) > 0 AND 
        LENGTH(TRIM(last_name)) > 0
    )
);

-- Indexes for Users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_host ON users(is_host) WHERE is_host = true;
CREATE INDEX idx_users_created_at ON users(created_at);

-- ============================================================================
-- TABLE: Hosts
-- ============================================================================
-- Extended profile information for users who are hosts
CREATE TABLE hosts (
    host_id UUID PRIMARY KEY,
    host_since DATE NOT NULL DEFAULT CURRENT_DATE,
    host_response_time VARCHAR(50),
    host_response_rate NUMERIC(5, 2),
    host_acceptance_rate NUMERIC(5, 2),
    is_superhost BOOLEAN NOT NULL DEFAULT false,
    total_listings_count INTEGER NOT NULL DEFAULT 0,
    
    -- Foreign Key
    CONSTRAINT fk_hosts_users 
        FOREIGN KEY (host_id) 
        REFERENCES users(user_id) 
        ON DELETE CASCADE,
    
    -- Constraints
    CONSTRAINT response_rate_range_check CHECK (
        host_response_rate IS NULL OR 
        (host_response_rate >= 0 AND host_response_rate <= 100)
    ),
    CONSTRAINT acceptance_rate_range_check CHECK (
        host_acceptance_rate IS NULL OR 
        (host_acceptance_rate >= 0 AND host_acceptance_rate <= 100)
    ),
    CONSTRAINT listings_count_check CHECK (total_listings_count >= 0),
    CONSTRAINT response_time_values_check CHECK (
        host_response_time IS NULL OR
        host_response_time IN ('within an hour', 'within a few hours', 'within a day', 'a few days or more')
    )
);

-- Indexes for Hosts table
CREATE INDEX idx_hosts_superhost ON hosts(is_superhost) WHERE is_superhost = true;
CREATE INDEX idx_hosts_since ON hosts(host_since);

-- ============================================================================
-- TABLE: PropertyTypes
-- ============================================================================
-- Predefined property type classifications (e.g., Apartment, House, Villa)
CREATE TABLE property_types (
    property_type_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    
    -- Constraints
    CONSTRAINT property_type_name_not_empty CHECK (LENGTH(TRIM(name)) > 0)
);

-- Index for PropertyTypes table
CREATE INDEX idx_property_types_name ON property_types(name);

-- ============================================================================
-- TABLE: Listings
-- ============================================================================
-- Complete property listing information
CREATE TABLE listings (
    listing_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    host_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    summary TEXT,
    space TEXT,
    transit_info TEXT,
    house_rules TEXT,
    property_type_id INTEGER NOT NULL,
    room_type VARCHAR(50) NOT NULL,
    accommodates INTEGER NOT NULL,
    bedrooms INTEGER NOT NULL,
    beds INTEGER NOT NULL,
    bathrooms NUMERIC(3, 1) NOT NULL,
    price_per_night INTEGER NOT NULL,
    security_deposit INTEGER,
    cleaning_fee INTEGER,
    minimum_nights INTEGER NOT NULL DEFAULT 1,
    maximum_nights INTEGER NOT NULL DEFAULT 365,
    instant_bookable BOOLEAN NOT NULL DEFAULT false,
    cancellation_policy VARCHAR(50) NOT NULL,
    check_in_time VARCHAR(20),
    check_out_time VARCHAR(20),
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    street_address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_listings_hosts 
        FOREIGN KEY (host_id) 
        REFERENCES hosts(host_id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_listings_property_types 
        FOREIGN KEY (property_type_id) 
        REFERENCES property_types(property_type_id) 
        ON DELETE RESTRICT,
    
    -- Constraints
    CONSTRAINT room_type_values_check CHECK (
        room_type IN ('Entire home/apt', 'Private room', 'Shared room', 'Hotel room')
    ),
    CONSTRAINT accommodates_check CHECK (accommodates > 0 AND accommodates <= 50),
    CONSTRAINT bedrooms_check CHECK (bedrooms >= 0 AND bedrooms <= 50),
    CONSTRAINT beds_check CHECK (beds >= 0 AND beds <= 100),
    CONSTRAINT bathrooms_check CHECK (bathrooms >= 0 AND bathrooms <= 50),
    CONSTRAINT price_check CHECK (price_per_night > 0),
    CONSTRAINT security_deposit_check CHECK (security_deposit IS NULL OR security_deposit >= 0),
    CONSTRAINT cleaning_fee_check CHECK (cleaning_fee IS NULL OR cleaning_fee >= 0),
    CONSTRAINT nights_range_check CHECK (
        minimum_nights > 0 AND 
        maximum_nights > 0 AND 
        maximum_nights >= minimum_nights
    ),
    CONSTRAINT cancellation_policy_values_check CHECK (
        cancellation_policy IN ('Flexible', 'Moderate', 'Strict', 'Super Strict 30', 'Super Strict 60')
    ),
    CONSTRAINT latitude_range_check CHECK (
        latitude IS NULL OR 
        (latitude >= -90 AND latitude <= 90)
    ),
    CONSTRAINT longitude_range_check CHECK (
        longitude IS NULL OR 
        (longitude >= -180 AND longitude <= 180)
    ),
    CONSTRAINT name_not_empty_check CHECK (LENGTH(TRIM(name)) > 0)
);

-- Indexes for Listings table
CREATE INDEX idx_listings_host_id ON listings(host_id);
CREATE INDEX idx_listings_property_type ON listings(property_type_id);
CREATE INDEX idx_listings_city ON listings(city);
CREATE INDEX idx_listings_country ON listings(country);
CREATE INDEX idx_listings_price ON listings(price_per_night);
CREATE INDEX idx_listings_accommodates ON listings(accommodates);
CREATE INDEX idx_listings_room_type ON listings(room_type);
CREATE INDEX idx_listings_instant_bookable ON listings(instant_bookable) WHERE instant_bookable = true;
CREATE INDEX idx_listings_location ON listings USING gist(
    ll_to_earth(latitude::float8, longitude::float8)
) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX idx_listings_created_at ON listings(created_at);

-- ============================================================================
-- TABLE: Amenities
-- ============================================================================
-- Predefined amenity classifications (e.g., WiFi, Pool, Parking)
CREATE TABLE amenities (
    amenity_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL,
    
    -- Constraints
    CONSTRAINT amenity_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
    CONSTRAINT amenity_category_values_check CHECK (
        category IN ('Basic', 'Safety', 'Entertainment', 'Accessibility', 'Kitchen', 'Outdoor', 'Other')
    )
);

-- Index for Amenities table
CREATE INDEX idx_amenities_category ON amenities(category);
CREATE INDEX idx_amenities_name ON amenities(name);

-- ============================================================================
-- TABLE: ListingAmenities (Join Table)
-- ============================================================================
-- Many-to-many relationship between listings and amenities
CREATE TABLE listing_amenities (
    listing_id UUID NOT NULL,
    amenity_id INTEGER NOT NULL,
    
    -- Composite Primary Key
    PRIMARY KEY (listing_id, amenity_id),
    
    -- Foreign Keys
    CONSTRAINT fk_listing_amenities_listings 
        FOREIGN KEY (listing_id) 
        REFERENCES listings(listing_id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_listing_amenities_amenities 
        FOREIGN KEY (amenity_id) 
        REFERENCES amenities(amenity_id) 
        ON DELETE CASCADE
);

-- Indexes for ListingAmenities table
CREATE INDEX idx_listing_amenities_listing ON listing_amenities(listing_id);
CREATE INDEX idx_listing_amenities_amenity ON listing_amenities(amenity_id);

-- ============================================================================
-- TABLE: Photos
-- ============================================================================
-- Property photos for listings
CREATE TABLE photos (
    photo_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL,
    url VARCHAR(500) NOT NULL,
    caption VARCHAR(255),
    is_cover_photo BOOLEAN NOT NULL DEFAULT false,
    sort_order INTEGER NOT NULL DEFAULT 0,
    
    -- Foreign Key
    CONSTRAINT fk_photos_listings 
        FOREIGN KEY (listing_id) 
        REFERENCES listings(listing_id) 
        ON DELETE CASCADE,
    
    -- Constraints
    CONSTRAINT sort_order_check CHECK (sort_order >= 0)
);

-- Indexes for Photos table
CREATE INDEX idx_photos_listing_id ON photos(listing_id);
CREATE INDEX idx_photos_cover ON photos(listing_id, is_cover_photo) WHERE is_cover_photo = true;
CREATE INDEX idx_photos_sort_order ON photos(listing_id, sort_order);

-- ============================================================================
-- TABLE: Bookings
-- ============================================================================
-- Guest reservations for listings
CREATE TABLE bookings (
    booking_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guest_id UUID NOT NULL,
    listing_id UUID NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    number_of_guests INTEGER NOT NULL,
    total_price INTEGER NOT NULL,
    price_breakdown JSONB NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_bookings_guests 
        FOREIGN KEY (guest_id) 
        REFERENCES users(user_id) 
        ON DELETE RESTRICT,
    CONSTRAINT fk_bookings_listings 
        FOREIGN KEY (listing_id) 
        REFERENCES listings(listing_id) 
        ON DELETE RESTRICT,
    
    -- Constraints
    CONSTRAINT dates_check CHECK (check_out_date > check_in_date),
    CONSTRAINT number_of_guests_check CHECK (number_of_guests > 0),
    CONSTRAINT total_price_check CHECK (total_price > 0),
    CONSTRAINT status_values_check CHECK (
        status IN ('Pending', 'Confirmed', 'Cancelled', 'Completed', 'Declined')
    ),
    CONSTRAINT check_in_future_or_today CHECK (check_in_date >= CURRENT_DATE)
);

-- Indexes for Bookings table
CREATE INDEX idx_bookings_guest_id ON bookings(guest_id);
CREATE INDEX idx_bookings_listing_id ON bookings(listing_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_check_in ON bookings(check_in_date);
CREATE INDEX idx_bookings_check_out ON bookings(check_out_date);
CREATE INDEX idx_bookings_created_at ON bookings(created_at);
CREATE INDEX idx_bookings_dates_listing ON bookings(listing_id, check_in_date, check_out_date);

-- ============================================================================
-- TABLE: Reviews
-- ============================================================================
-- Guest reviews for completed bookings
CREATE TABLE reviews (
    review_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL UNIQUE,
    guest_id UUID NOT NULL,
    listing_id UUID NOT NULL,
    rating_overall INTEGER NOT NULL,
    rating_cleanliness INTEGER NOT NULL,
    rating_accuracy INTEGER NOT NULL,
    rating_checkin INTEGER NOT NULL,
    rating_communication INTEGER NOT NULL,
    rating_location INTEGER NOT NULL,
    rating_value INTEGER NOT NULL,
    comment_public TEXT,
    comment_private_to_host TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_reviews_bookings 
        FOREIGN KEY (booking_id) 
        REFERENCES bookings(booking_id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_reviews_guests 
        FOREIGN KEY (guest_id) 
        REFERENCES users(user_id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_reviews_listings 
        FOREIGN KEY (listing_id) 
        REFERENCES listings(listing_id) 
        ON DELETE CASCADE,
    
    -- Constraints
    CONSTRAINT rating_overall_check CHECK (rating_overall >= 1 AND rating_overall <= 5),
    CONSTRAINT rating_cleanliness_check CHECK (rating_cleanliness >= 1 AND rating_cleanliness <= 5),
    CONSTRAINT rating_accuracy_check CHECK (rating_accuracy >= 1 AND rating_accuracy <= 5),
    CONSTRAINT rating_checkin_check CHECK (rating_checkin >= 1 AND rating_checkin <= 5),
    CONSTRAINT rating_communication_check CHECK (rating_communication >= 1 AND rating_communication <= 5),
    CONSTRAINT rating_location_check CHECK (rating_location >= 1 AND rating_location <= 5),
    CONSTRAINT rating_value_check CHECK (rating_value >= 1 AND rating_value <= 5)
);

-- Indexes for Reviews table
CREATE INDEX idx_reviews_listing_id ON reviews(listing_id);
CREATE INDEX idx_reviews_guest_id ON reviews(guest_id);
CREATE INDEX idx_reviews_booking_id ON reviews(booking_id);
CREATE INDEX idx_reviews_created_at ON reviews(created_at);
CREATE INDEX idx_reviews_rating_overall ON reviews(rating_overall);

-- ============================================================================
-- TRIGGERS: Updated At Timestamp Automation
-- ============================================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for Users table
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for Listings table
CREATE TRIGGER update_listings_updated_at 
    BEFORE UPDATE ON listings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS: Table and Column Documentation
-- ============================================================================

COMMENT ON TABLE users IS 'Core user accounts for both guests and hosts';
COMMENT ON TABLE hosts IS 'Extended profile information for users who are hosts';
COMMENT ON TABLE property_types IS 'Predefined property type classifications';
COMMENT ON TABLE listings IS 'Complete property listing information';
COMMENT ON TABLE amenities IS 'Predefined amenity classifications';
COMMENT ON TABLE listing_amenities IS 'Many-to-many relationship between listings and amenities';
COMMENT ON TABLE photos IS 'Property photos for listings';
COMMENT ON TABLE bookings IS 'Guest reservations for listings';
COMMENT ON TABLE reviews IS 'Guest reviews for completed bookings';

COMMENT ON COLUMN listings.price_per_night IS 'Price stored in cents to avoid floating point issues';
COMMENT ON COLUMN listings.security_deposit IS 'Security deposit amount in cents';
COMMENT ON COLUMN listings.cleaning_fee IS 'Cleaning fee in cents';
COMMENT ON COLUMN bookings.total_price IS 'Total booking price in cents';
COMMENT ON COLUMN bookings.price_breakdown IS 'JSON object containing itemized price details';

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================

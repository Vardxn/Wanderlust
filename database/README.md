# PostgreSQL Database Setup for Wanderlust

This directory contains the complete PostgreSQL database schema, migrations, seed data, views, and functions for the Wanderlust vacation rental platform.

## Directory Structure

```
database/
├── migrations/
│   └── 001_initial_schema.sql      # Complete table definitions
├── seeds/
│   ├── 001_property_types.sql      # Property type seed data
│   └── 002_amenities.sql           # Amenity seed data
├── views/
│   └── analytics_views.sql         # Analytical views
├── functions/
│   └── business_logic.sql          # Stored procedures and triggers
└── README.md                        # This file
```

## Prerequisites

- PostgreSQL 12 or higher
- PostGIS extension (for geospatial queries)
- uuid-ossp extension (for UUID generation)

## Database Setup

### 1. Create Database

```bash
createdb wanderlust
```

Or using psql:

```sql
CREATE DATABASE wanderlust;
```

### 2. Connect to Database

```bash
psql -d wanderlust
```

### 3. Run Migrations in Order

```bash
# Run initial schema
psql -d wanderlust -f database/migrations/001_initial_schema.sql

# Run seed data
psql -d wanderlust -f database/seeds/001_property_types.sql
psql -d wanderlust -f database/seeds/002_amenities.sql

# Create views
psql -d wanderlust -f database/views/analytics_views.sql

# Create functions and triggers
psql -d wanderlust -f database/functions/business_logic.sql
```

Or run all at once:

```bash
psql -d wanderlust -f database/migrations/001_initial_schema.sql \
                    -f database/seeds/001_property_types.sql \
                    -f database/seeds/002_amenities.sql \
                    -f database/views/analytics_views.sql \
                    -f database/functions/business_logic.sql
```

## Schema Overview

### Core Tables

1. **users** - User accounts (guests and hosts)
2. **hosts** - Extended host profiles
3. **property_types** - Property classifications
4. **listings** - Vacation rental properties
5. **amenities** - Available amenities
6. **listing_amenities** - Join table for listings and amenities
7. **photos** - Property photos
8. **bookings** - Reservations
9. **reviews** - Guest reviews

### Key Features

- **UUID Primary Keys** - For listings, users, bookings, reviews, and photos
- **Foreign Key Constraints** - Maintain referential integrity
- **Check Constraints** - Validate data at database level
- **Triggers** - Automatic timestamp updates, host profile creation
- **Indexes** - Optimized for common queries
- **Views** - Pre-built analytical queries
- **Functions** - Business logic enforcement

## Important Database Functions

### `check_listing_availability(listing_id, check_in, check_out)`
Returns boolean indicating if listing is available for given dates.

```sql
SELECT check_listing_availability(
    '123e4567-e89b-12d3-a456-426614174000'::UUID,
    '2025-12-01'::DATE,
    '2025-12-05'::DATE
);
```

### `calculate_booking_price(listing_id, check_in, check_out, guests)`
Returns JSONB with detailed price breakdown.

```sql
SELECT calculate_booking_price(
    '123e4567-e89b-12d3-a456-426614174000'::UUID,
    '2025-12-01'::DATE,
    '2025-12-05'::DATE,
    2
);
```

### `get_listing_unavailable_dates(listing_id, start_date, end_date)`
Returns table of unavailable dates for a listing.

```sql
SELECT * FROM get_listing_unavailable_dates(
    '123e4567-e89b-12d3-a456-426614174000'::UUID,
    '2025-12-01'::DATE,
    '2025-12-31'::DATE
);
```

### `search_listings_by_location(latitude, longitude, radius_km)`
Search listings within a radius (requires PostGIS).

```sql
SELECT * FROM search_listings_by_location(
    40.7128,  -- New York latitude
    -74.0060, -- New York longitude
    10        -- 10 km radius
);
```

## Analytical Views

### `listing_details_with_host`
Complete listing information with host details.

### `listing_average_ratings`
Aggregate ratings for each listing.

### `host_performance_metrics`
Performance metrics for hosts (bookings, revenue, ratings).

### `booking_summary`
Complete booking information with guest and listing details.

### `upcoming_bookings`
All confirmed future bookings.

### `popular_listings`
Listings ranked by bookings and ratings.

## Automatic Triggers

1. **updated_at timestamps** - Auto-update on users and listings
2. **Host listing count** - Auto-increment/decrement on listing creation/deletion
3. **Overlapping bookings prevention** - Prevent double bookings
4. **Cover photo enforcement** - Only one cover photo per listing
5. **Auto host profile creation** - Create host record when user becomes host
6. **Guest capacity validation** - Ensure bookings don't exceed capacity

## Data Integrity Rules

### Price Storage
All prices stored in **cents** as integers to avoid floating-point precision issues:
- `price_per_night`: 10000 = $100.00
- `cleaning_fee`: 5000 = $50.00
- `total_price`: 45000 = $450.00

### Rating Constraints
All ratings must be between 1 and 5 (inclusive).

### Booking Validation
- Check-out date must be after check-in date
- Number of guests must be positive and not exceed listing capacity
- No overlapping confirmed/pending bookings allowed

### Cancellation Policies
Valid values: 'Flexible', 'Moderate', 'Strict', 'Super Strict 30', 'Super Strict 60'

### Room Types
Valid values: 'Entire home/apt', 'Private room', 'Shared room', 'Hotel room'

### Booking Statuses
Valid values: 'Pending', 'Confirmed', 'Cancelled', 'Completed', 'Declined'

## Indexing Strategy

- **Primary Keys**: All tables have appropriate primary keys
- **Foreign Keys**: Indexed for join performance
- **Search Fields**: city, country, price, accommodates
- **Geospatial**: GiST index on lat/long for location searches
- **Dates**: Check-in/check-out dates for availability queries
- **Partial Indexes**: Only for filtered conditions (e.g., is_superhost = true)

## Environment Variables

Create a `.env` file in your project root:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=wanderlust
DB_USER=your_username
DB_PASSWORD=your_password
DB_SSL=false
```

## Backup and Restore

### Backup

```bash
pg_dump wanderlust > wanderlust_backup.sql
```

### Restore

```bash
psql wanderlust < wanderlust_backup.sql
```

## Troubleshooting

### PostGIS Extension Required
If you get errors related to `ll_to_earth` or `earth_distance`:

```sql
CREATE EXTENSION IF NOT EXISTS cube;
CREATE EXTENSION IF NOT EXISTS earthdistance;
```

### UUID Extension Required
If you get errors related to `uuid_generate_v4()`:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

## Performance Considerations

1. Use connection pooling (pg-pool or similar)
2. Index columns used in WHERE, JOIN, and ORDER BY clauses
3. Use EXPLAIN ANALYZE to optimize slow queries
4. Consider partitioning bookings table by date for high volume
5. Use materialized views for complex analytics if needed

## Security Best Practices

1. Never store plain text passwords (use bcrypt or argon2)
2. Use parameterized queries to prevent SQL injection
3. Grant minimal necessary privileges to application user
4. Enable SSL for production database connections
5. Regular backups with encryption
6. Rotate database credentials periodically

## Next Steps

After setting up the database:

1. Create database connection module in your application
2. Implement data access layer (repositories/models)
3. Set up migration management system (e.g., node-pg-migrate)
4. Create database seeding scripts for development
5. Configure connection pooling
6. Set up monitoring and logging

## Contributing

When adding new migrations:

1. Create sequentially numbered migration files
2. Include both UP and DOWN migrations
3. Test migrations on a copy of production data
4. Document schema changes in this README
5. Update ER diagrams if major changes

## License

This database schema is part of the Wanderlust project.

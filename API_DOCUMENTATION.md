# Wanderlust API Documentation

## Authentication

All authenticated routes require a valid session cookie.

### POST /register
Register a new user
**Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "firstName": "string",
  "lastName": "string"
}
```

### POST /login
Login existing user
**Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

## Listings

### GET /api/v1/listings/search
Search for listings
**Query Parameters:**
- location: string
- checkIn: date
- checkOut: date
- guests: number
- minPrice: number
- maxPrice: number

### GET /api/v1/listings/:id
Get single listing details

### POST /api/v1/listings
Create new listing (requires authentication)

## Bookings

### POST /api/v1/bookings
Create new booking (requires authentication)

### GET /api/v1/bookings/:id
Get booking details (requires authentication)

### GET /api/v1/profile/bookings
Get user's booking history (requires authentication)

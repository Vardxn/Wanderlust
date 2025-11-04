# 📅 Booking System Documentation

Complete guide to the Wanderlust booking and reservation system.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Booking Model](#booking-model)
3. [Listing Model Updates](#listing-model-updates)
4. [API Endpoints](#api-endpoints)
5. [Frontend Implementation](#frontend-implementation)
6. [Price Calculation Logic](#price-calculation-logic)
7. [Availability Checking](#availability-checking)
8. [Guest Management](#guest-management)
9. [Booking Status Workflow](#booking-status-workflow)
10. [Usage Examples](#usage-examples)
11. [Testing Guide](#testing-guide)

---

## 🎯 Overview

The booking system enables users to:
- Select check-in and check-out dates
- Choose number of guests (adults, children, infants, pets)
- See real-time price calculations with discounts
- Create instant or pending bookings
- View booking history and details
- Cancel bookings
- Track payment status

---

## 📊 Booking Model

**File:** `models/booking.js`

### Schema Structure

```javascript
{
  listing: ObjectId,           // Reference to Listing
  user: ObjectId,              // Reference to User
  checkIn: Date,               // Check-in date
  checkOut: Date,              // Checkout date
  guests: {
    adults: Number,            // Min: 1, Default: 1
    children: Number,          // Min: 0, Default: 0
    infants: Number,           // Min: 0, Default: 0
    pets: Number               // Min: 0, Default: 0
  },
  pricing: {
    basePrice: Number,         // Total for nights
    nightlyRate: Number,       // Per night rate
    cleaningFee: Number,       // One-time fee
    serviceFee: Number,        // Platform fee
    taxes: Number,             // GST (12%)
    discount: Number,          // Weekly/monthly discount
    discountType: String,      // 'weekly', 'monthly', 'none'
    total: Number              // Final amount
  },
  status: String,              // Enum: pending/confirmed/cancelled/completed/rejected
  payment: {
    status: String,            // Enum: pending/paid/failed/refunded
    transactionId: String,
    method: String,
    paidAt: Date
  },
  specialRequests: String,
  instantBook: Boolean
}
```

### Static Methods

#### `findOverlapping(listingId, checkIn, checkOut, excludeBookingId)`
Finds bookings that overlap with given dates.

```javascript
const overlapping = await Booking.findOverlapping(
  '507f1f77bcf86cd799439011',
  new Date('2024-06-01'),
  new Date('2024-06-05')
);
```

#### `checkAvailability(listingId, checkIn, checkOut, excludeBookingId)`
Checks if property is available for dates.

```javascript
const isAvailable = await Booking.checkAvailability(
  listingId,
  checkIn,
  checkOut
);
```

### Instance Methods

#### `isActive()`
Returns true if booking is confirmed or pending.

```javascript
if (booking.isActive()) {
  console.log('Booking is currently active');
}
```

#### `canBeCancelled()`
Returns true if booking can be cancelled (confirmed or pending status).

```javascript
if (booking.canBeCancelled()) {
  // Show cancel button
}
```

---

## 🏠 Listing Model Updates

**File:** `models/listing.js`

### New Fields Added

```javascript
{
  cleaningFee: Number,         // Default: 0, Min: 0
  serviceFee: Number,          // Default: 0, Min: 0
  minimumStay: Number,         // Default: 1, Min: 1
  maximumStay: Number,         // Default: 365, Min: 1
  weeklyDiscount: Number,      // Default: 0, Min: 0, Max: 50
  monthlyDiscount: Number      // Default: 0, Min: 0, Max: 50
}
```

### Field Purpose

- **cleaningFee**: One-time charge for cleaning (typically 15-30% of nightly rate)
- **serviceFee**: Platform service charge (typically 12% of nightly rate)
- **minimumStay**: Minimum number of nights required
- **maximumStay**: Maximum number of days allowed
- **weeklyDiscount**: Percentage off for 7+ night stays
- **monthlyDiscount**: Percentage off for 28+ night stays

---

## 🔌 API Endpoints

### 1. Calculate Price

**POST** `/api/calculate-price`

Calculates total booking price with discounts.

**Request Body:**
```json
{
  "listingId": "507f1f77bcf86cd799439011",
  "checkIn": "2024-06-01",
  "checkOut": "2024-06-08",
  "adults": 2,
  "children": 1,
  "infants": 0,
  "pets": 0
}
```

**Response:**
```json
{
  "nights": 7,
  "basePrice": 35000,
  "cleaningFee": 1500,
  "serviceFee": 600,
  "taxes": 4452,
  "discount": 3500,
  "discountType": "weekly",
  "discountPercentage": 10,
  "total": 38052
}
```

**Validations:**
- checkIn must be in the future
- checkOut must be after checkIn
- Total guests must not exceed maxGuests
- Stay duration must be within min/max limits

---

### 2. Check Availability

**POST** `/api/check-availability`

Checks if dates are available for booking.

**Request Body:**
```json
{
  "listingId": "507f1f77bcf86cd799439011",
  "checkIn": "2024-06-01",
  "checkOut": "2024-06-08"
}
```

**Response:**
```json
{
  "available": true,
  "message": "Property is available for these dates"
}
```

Or if unavailable:
```json
{
  "available": false,
  "message": "Property is not available for these dates"
}
```

---

### 3. Get Booked Dates

**GET** `/api/listings/:id/booked-dates`

Returns all booked date ranges for a listing.

**Response:**
```json
[
  {
    "checkIn": "2024-06-01T00:00:00.000Z",
    "checkOut": "2024-06-08T00:00:00.000Z"
  },
  {
    "checkIn": "2024-06-15T00:00:00.000Z",
    "checkOut": "2024-06-20T00:00:00.000Z"
  }
]
```

**Use Case:** Disable booked dates in calendar UI.

---

### 4. Create Booking

**POST** `/listings/:id/book`

Creates a new booking.

**Request Body (Form Data):**
```
checkIn: "2024-06-01"
checkOut: "2024-06-08"
adults: "2"
children: "1"
infants: "0"
pets: "0"
specialRequests: "Early check-in if possible"
```

**Success Response:**
- Redirects to `/bookings/:bookingId` with success flash message

**Error Response:**
- Redirects back with error flash message

**Validations:**
- User must be logged in
- Dates must be valid and available
- Guest count must be within limits
- Stay duration must meet requirements

---

### 5. View Booking

**GET** `/bookings/:id`

View single booking details.

**Response:** Renders `views/bookings/show.ejs`

**Access Control:** Only booking owner can view

---

### 6. List Bookings

**GET** `/bookings`

View all user bookings with filters.

**Query Parameters:**
- `status` (optional): Filter by status (confirmed, pending, cancelled, completed)

**Response:** Renders `views/bookings/index.ejs` with categorized bookings:
- All bookings
- Upcoming (confirmed + pending, checkIn >= today)
- Completed (completed status or checkOut < today)
- Cancelled bookings

---

### 7. Cancel Booking

**POST** `/bookings/:id/cancel`

Cancel an active booking.

**Success Response:**
- Redirects to `/bookings` with success message

**Validations:**
- Only confirmed or pending bookings can be cancelled
- Only booking owner can cancel

---

## 🎨 Frontend Implementation

### Booking Widget (`views/listings/show.ejs`)

Located in the right column of listing detail page (lines 140-270).

**Features:**
1. **Date Selection**
   - HTML5 date inputs with min date validation
   - Auto-updates checkout min date based on check-in
   - Enforces minimum stay requirement

2. **Guest Selector**
   - Adults: Min 1, Max = maxGuests
   - Children: Min 0, Max = maxGuests
   - Infants: Min 0, Max 5
   - Pets: Min 0, Max 2 (only if Pet-friendly amenity exists)
   - Increment/decrement buttons
   - Total guest validation

3. **Real-time Price Calculator**
   - Fetches from `/api/calculate-price` on change
   - Shows breakdown: base price, cleaning fee, service fee, taxes
   - Displays discounts in green
   - Updates total dynamically

4. **Special Requests**
   - Optional textarea for guest notes

5. **Submit Button**
   - Text changes based on instantBook status
   - Disabled if validation fails

**JavaScript Functions:**

```javascript
incrementGuest(type)    // Increase guest count
decrementGuest(type)    // Decrease guest count
validateGuests()        // Check total <= maxGuests
calculatePrice()        // Fetch and display price
```

---

### Booking Detail Page (`views/bookings/show.ejs`)

Displays comprehensive booking information:

**Sections:**
1. **Status Badge** - Visual status indicator
2. **Booking Details** - ID, dates, duration
3. **Guest Information** - Adults, children, infants, pets breakdown
4. **Property Details** - Listing image, title, location with link
5. **Price Breakdown** - Itemized costs and total
6. **Action Buttons** - View bookings, cancel, print, share

**Features:**
- Print-friendly styling
- Share functionality (Web Share API + clipboard fallback)
- Conditional cancel button
- Payment status indicator

---

### Bookings List Page (`views/bookings/index.ejs`)

Shows all user bookings with filter tabs.

**Tab Categories:**
1. **All Bookings** - Every booking
2. **Upcoming** - Confirmed/pending with checkIn >= today
3. **Completed** - Completed status or checkOut < today
4. **Cancelled** - Cancelled bookings

**Booking Card Shows:**
- Property image and title
- Status badge
- Check-in/checkout dates
- Guest details
- Duration
- Total price
- Payment status
- View details button
- Cancel button (if applicable)

---

## 💰 Price Calculation Logic

### Base Price
```
basePrice = nightlyRate × numberOfNights
```

### Cleaning Fee
One-time charge (not multiplied by nights):
```
cleaningFee = listing.cleaningFee
```

### Service Fee
Platform commission (12% of nightly rate):
```
serviceFee = nightlyRate × 0.12
```

### Taxes
GST at 12% on all charges:
```
taxes = (basePrice + cleaningFee + serviceFee) × 0.12
```

### Discounts

**Weekly Discount** (7+ nights):
```
if (nights >= 7 && listing.weeklyDiscount > 0) {
  discount = basePrice × (listing.weeklyDiscount / 100)
  discountType = 'weekly'
}
```

**Monthly Discount** (28+ nights, overrides weekly):
```
if (nights >= 28 && listing.monthlyDiscount > 0) {
  discount = basePrice × (listing.monthlyDiscount / 100)
  discountType = 'monthly'
}
```

### Total Calculation
```
total = basePrice + cleaningFee + serviceFee + taxes - discount
```

### Example Calculation

**Scenario:**
- Nightly Rate: ₹5,000
- Nights: 8
- Cleaning Fee: ₹1,500
- Service Fee: ₹600
- Weekly Discount: 10%

**Breakdown:**
```
Base Price:    5,000 × 8 = ₹40,000
Cleaning Fee:            = ₹1,500
Service Fee:             = ₹600
Subtotal:                = ₹42,100
Taxes (12%):             = ₹5,052
Weekly Discount (10%):   = -₹4,000
TOTAL:                   = ₹43,152
```

---

## 📅 Availability Checking

### Logic Flow

1. **Fetch Active Bookings**
   ```javascript
   Booking.find({
     listing: listingId,
     status: { $in: ['confirmed', 'pending'] },
     $or: [
       { checkIn: { $lt: checkOut }, checkOut: { $gt: checkIn } }
     ]
   })
   ```

2. **Date Overlap Detection**
   - New booking overlaps if:
     - New checkIn < Existing checkOut AND
     - New checkOut > Existing checkIn

3. **Response**
   - If any overlap found: `available: false`
   - If no overlap: `available: true`

### Same-Day Turnaround
Allows checkout and check-in on the same day:
```
Booking A: Jun 1 - Jun 5
Booking B: Jun 5 - Jun 10  ✅ ALLOWED
```

### Calendar Integration
Use `/api/listings/:id/booked-dates` to:
- Disable booked dates in date picker
- Show availability calendar
- Highlight unavailable ranges

---

## 👥 Guest Management

### Guest Categories

1. **Adults** (Age 13+)
   - Minimum: 1
   - Maximum: listing.maxGuests
   - Counted toward total guest limit

2. **Children** (Age 2-12)
   - Minimum: 0
   - Maximum: listing.maxGuests
   - Counted toward total guest limit

3. **Infants** (Under 2)
   - Minimum: 0
   - Maximum: 5
   - NOT counted toward guest limit

4. **Pets**
   - Minimum: 0
   - Maximum: 2
   - Only visible if listing has "Pet-friendly" amenity
   - NOT counted toward guest limit

### Validation Rules

```javascript
totalGuests = adults + children
if (totalGuests > maxGuests) {
  error: "Maximum X guests allowed"
}
```

### UI Components

**Guest Selector Buttons:**
```html
<button onclick="incrementGuest('adults')">+</button>
<input type="number" id="adults" value="1" readonly>
<button onclick="decrementGuest('adults')">-</button>
```

---

## 🔄 Booking Status Workflow

### Status Types

1. **Pending** 🟡
   - Initial status for non-instant-book properties
   - Awaits host confirmation
   - Can be cancelled by guest
   - Can be confirmed or rejected by host

2. **Confirmed** 🟢
   - Booking is approved
   - Auto-set for instant-book properties
   - Guest is guaranteed the reservation
   - Can be cancelled (with refund policy)

3. **Cancelled** 🔴
   - Guest or host cancelled
   - Property becomes available again
   - Refund may be issued

4. **Completed** 🔵
   - Guest checked out
   - Stay is finished
   - Cannot be modified

5. **Rejected** ⚫
   - Host declined the booking
   - Property available for rebooking
   - Guest can book elsewhere

### Status Transitions

```
CREATE BOOKING
    ↓
instantBook? 
    ↓ YES            ↓ NO
CONFIRMED        PENDING
    ↓                ↓
    ↓         Host Action?
    ↓            ↓       ↓
    ↓        CONFIRMED REJECTED
    ↓            ↓
    ↓← ← ← ← ← ←
    ↓
Guest Cancel? 
    ↓ YES
CANCELLED
    ↓ NO
Checkout Date Passed?
    ↓ YES
COMPLETED
```

---

## 📝 Usage Examples

### Example 1: Create a Booking

```javascript
// Frontend - Submit booking form
<form action="/listings/<%= listing._id %>/book" method="POST">
  <input type="date" name="checkIn" value="2024-06-01">
  <input type="date" name="checkOut" value="2024-06-08">
  <input type="number" name="adults" value="2">
  <input type="number" name="children" value="1">
  <input type="number" name="infants" value="0">
  <input type="number" name="pets" value="0">
  <textarea name="specialRequests">Early check-in please</textarea>
  <button type="submit">Reserve</button>
</form>
```

### Example 2: Calculate Price Before Booking

```javascript
// JavaScript - Real-time price calculation
async function calculatePrice() {
  const response = await fetch('/api/calculate-price', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      listingId: '507f1f77bcf86cd799439011',
      checkIn: '2024-06-01',
      checkOut: '2024-06-08',
      adults: 2,
      children: 1,
      infants: 0,
      pets: 0
    })
  });
  
  const data = await response.json();
  console.log(`Total: ₹${data.total.toLocaleString()}`);
  console.log(`You save: ₹${data.discount.toLocaleString()}`);
}
```

### Example 3: Check Availability

```javascript
// Backend - In route handler
const available = await Booking.checkAvailability(
  req.params.id,
  new Date(req.body.checkIn),
  new Date(req.body.checkOut)
);

if (!available) {
  req.flash('error', 'Property not available for these dates');
  return res.redirect('back');
}
```

### Example 4: Cancel Booking

```javascript
// Backend - Cancel route
app.post('/bookings/:id/cancel', async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  
  if (!booking.canBeCancelled()) {
    req.flash('error', 'This booking cannot be cancelled');
    return res.redirect('/bookings');
  }
  
  booking.status = 'cancelled';
  await booking.save();
  
  req.flash('success', 'Booking cancelled successfully');
  res.redirect('/bookings');
});
```

---

## 🧪 Testing Guide

### 1. Update Database Fields

Run the script to add booking fields to existing listings:

```bash
node scripts/database-management/update-booking-fields.js
```

Expected output:
- Updates all 100 listings
- Adds cleaningFee, serviceFee, minimumStay, maximumStay, weeklyDiscount, monthlyDiscount
- Shows summary of changes

---

### 2. Test Price Calculation

**Using Postman/cURL:**

```bash
curl -X POST http://localhost:3000/api/calculate-price \
  -H "Content-Type: application/json" \
  -d '{
    "listingId": "YOUR_LISTING_ID",
    "checkIn": "2024-07-01",
    "checkOut": "2024-07-08",
    "adults": 2,
    "children": 1,
    "infants": 0,
    "pets": 0
  }'
```

**Expected Response:**
```json
{
  "nights": 7,
  "basePrice": 35000,
  "cleaningFee": 1500,
  "serviceFee": 600,
  "taxes": 4452,
  "discount": 3500,
  "discountType": "weekly",
  "discountPercentage": 10,
  "total": 38052
}
```

**Test Cases:**
- ✅ 1-night stay (no discount)
- ✅ 7-night stay (weekly discount)
- ✅ 28-night stay (monthly discount)
- ✅ Past dates (should fail)
- ✅ Invalid dates (should fail)
- ✅ Exceeding maxGuests (should fail)

---

### 3. Test Availability Checking

**Using Postman/cURL:**

```bash
curl -X POST http://localhost:3000/api/check-availability \
  -H "Content-Type: application/json" \
  -d '{
    "listingId": "YOUR_LISTING_ID",
    "checkIn": "2024-07-01",
    "checkOut": "2024-07-08"
  }'
```

**Test Cases:**
- ✅ Available dates
- ✅ Completely booked dates
- ✅ Partially overlapping dates
- ✅ Same-day turnaround (checkout = check-in)

---

### 4. Test Booking Creation

**Manual Testing:**

1. Visit a listing page: `http://localhost:3000/listings/:id`
2. Select check-in and check-out dates
3. Choose number of guests
4. Add special requests
5. Click "Reserve" or "Book Now"
6. Verify redirect to booking detail page
7. Check booking appears in "My Bookings"

**Test Cases:**
- ✅ Instant book listing
- ✅ Request to book listing
- ✅ Weekly discount application
- ✅ Monthly discount application
- ✅ Maximum guest validation
- ✅ Minimum stay validation
- ✅ Overlapping dates (should fail)

---

### 5. Test Booking Views

**My Bookings Page:**
```
http://localhost:3000/bookings
```

Verify:
- ✅ All bookings tab shows all bookings
- ✅ Upcoming tab shows confirmed + pending with checkIn >= today
- ✅ Completed tab shows past bookings
- ✅ Cancelled tab shows cancelled bookings
- ✅ Badge counts are correct
- ✅ View details button works
- ✅ Cancel button appears for active bookings

**Booking Detail Page:**
```
http://localhost:3000/bookings/:id
```

Verify:
- ✅ Status badge displays correctly
- ✅ Date formatting is correct
- ✅ Guest breakdown shows properly
- ✅ Property details display
- ✅ Price breakdown is accurate
- ✅ Cancel button works (if applicable)
- ✅ Print functionality works
- ✅ Share functionality works

---

### 6. Test Cancellation

1. Create a booking
2. Go to booking detail page
3. Click "Cancel Booking"
4. Confirm cancellation
5. Verify status changes to "Cancelled"
6. Check dates become available again
7. Verify cancelled booking appears in Cancelled tab

---

### 7. Browser Testing

**Desktop:**
- ✅ Chrome
- ✅ Firefox
- ✅ Safari
- ✅ Edge

**Mobile:**
- ✅ iOS Safari
- ✅ Android Chrome
- ✅ Responsive design (768px, 1024px, 1440px)

---

### 8. Edge Cases

Test these scenarios:

- ✅ Booking on leap year (Feb 29)
- ✅ Booking across year boundary (Dec 31 - Jan 2)
- ✅ Same check-in and checkout date (should fail)
- ✅ Check-in in the past (should fail)
- ✅ Extremely long stay (366+ days)
- ✅ 0 adults (should fail)
- ✅ Price overflow (very expensive + long stay)
- ✅ Multiple overlapping bookings
- ✅ Concurrent booking attempts
- ✅ Invalid listing ID
- ✅ Unauthorized access to other user's bookings

---

## 🎉 Congratulations!

Your Wanderlust booking system is now fully functional! Users can:

✅ Browse properties with real-time availability  
✅ Select dates and guests dynamically  
✅ See accurate pricing with discounts  
✅ Create instant or pending bookings  
✅ Manage their bookings (view, cancel)  
✅ Track payment status  

### Next Steps

Consider implementing:
- Payment gateway integration (Razorpay/Stripe)
- Email notifications (SendGrid/Mailgun)
- SMS notifications (Twilio)
- Calendar export (iCal format)
- Google Calendar sync
- Review system for completed bookings
- Host dashboard for managing bookings
- Refund policy enforcement
- Booking modifications (date changes)

---

**Need Help?**  
Check the main project documentation or open an issue in the repository.

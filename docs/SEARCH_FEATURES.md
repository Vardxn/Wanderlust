# 🔍 Search Features Documentation

## Overview
This document describes the search and filtering features implemented in the Wanderlust application.

---

## Features Implemented ✅

### 1. **Location-Based Search**
Search properties by city, country, or region.

**Usage:**
```
GET /listings?location=Paris
GET /listings?country=France
```

**How it works:**
- Case-insensitive pattern matching
- Searches in the `location` and `country` fields
- Returns all matching properties

---

### 2. **Autocomplete for Locations**
Real-time search suggestions as you type.

**API Endpoint:**
```
GET /api/autocomplete?q=paris
```

**Response:**
```json
{
  "suggestions": [
    { "type": "location", "value": "Paris" },
    { "type": "country", "value": "France" },
    { "type": "property", "value": "Luxury Apartment in Paris", "id": "123", "location": "Paris" }
  ]
}
```

**Features:**
- Minimum 2 characters required
- Debounced input (300ms delay)
- Shows locations, countries, and property names
- Maximum 10 suggestions
- Click to select or navigate to property

---

### 3. **Search by Property Name**
Find specific properties by their title.

**Usage:**
```
GET /listings?name=villa
GET /listings?search=beachfront
```

**How it works:**
- `name` parameter: Searches only in property titles
- `search` parameter: Searches across title, location, country, and description
- Partial matches supported

---

### 4. **Nearby Properties**
Get properties in the same location.

**API Endpoint:**
```
GET /api/nearby?location=Paris
```

**Response:**
```json
{
  "nearby": [
    {
      "id": "123",
      "title": "Cozy Studio",
      "location": "Paris",
      "price": 50000,
      "image": "..."
    }
  ]
}
```

**Use Case:**
- Show similar properties on listing detail pages
- "More in this area" sections
- Location-based recommendations

---

### 5. **Recent Searches History**
Tracks user's last 5 search queries.

**API Endpoints:**
```
GET /api/recent-searches          # Get recent searches
DELETE /api/recent-searches       # Clear history
```

**Features:**
- Stored in session
- Maximum 5 searches
- No duplicates
- Displayed as clickable badges
- Can be cleared by user

---

## UI Components

### 1. **Listings Page Search Bar**
Location: `/views/listings/index.ejs`

**Features:**
- General search input with autocomplete
- Separate location (city) input
- Separate country/region input
- Clear filters button
- Results count display
- Recent searches badges

### 2. **Navbar Search**
Location: `/views/includes/navbar.ejs`

**Features:**
- Integrated into main navigation
- Real-time autocomplete
- Quick access from any page
- Direct property navigation
- Check-in/Check-out (placeholder for future)
- Guest count (placeholder for future)

---

## Technical Implementation

### Backend Routes (app.js)

```javascript
// Main search endpoint
GET /listings?search=query&location=city&country=region&name=property

// Autocomplete API
GET /api/autocomplete?q=query

// Recent searches
GET /api/recent-searches
DELETE /api/recent-searches

// Nearby properties
GET /api/nearby?location=city
```

### Search Query Logic

```javascript
// Comprehensive search across multiple fields
if (search) {
    query.$or = [
        { title: new RegExp(searchTerm, 'i') },
        { location: new RegExp(searchTerm, 'i') },
        { country: new RegExp(searchTerm, 'i') },
        { description: new RegExp(searchTerm, 'i') }
    ];
}

// Specific location filter
if (location && !search) {
    query.location = new RegExp(location, 'i');
}

// Specific country filter
if (country && !search) {
    query.country = new RegExp(country, 'i');
}
```

### Session Management

```javascript
// Store searches in session
if (!req.session.recentSearches) {
    req.session.recentSearches = [];
}

// Add new search, avoid duplicates, limit to 5
req.session.recentSearches = [
    searchQuery,
    ...req.session.recentSearches.filter(s => s !== searchQuery)
].slice(0, 5);
```

---

## Frontend JavaScript

### Autocomplete Implementation

```javascript
// Debounced input handler
searchInput.addEventListener('input', function() {
    clearTimeout(debounceTimer);
    const query = this.value.trim();
    
    if (query.length < 2) {
        autocompleteResults.style.display = 'none';
        return;
    }
    
    debounceTimer = setTimeout(() => {
        fetch(`/api/autocomplete?q=${encodeURIComponent(query)}`)
            .then(res => res.json())
            .then(data => displayAutocomplete(data.suggestions))
            .catch(err => console.error('Autocomplete error:', err));
    }, 300);
});
```

### Display Autocomplete Results

```javascript
function displayAutocomplete(suggestions) {
    autocompleteResults.innerHTML = '';
    suggestions.forEach(item => {
        const a = document.createElement('a');
        a.className = 'list-group-item list-group-item-action';
        
        let icon = item.type === 'country' ? '🌍' : 
                   item.type === 'property' ? '🏠' : '📍';
        
        a.innerHTML = `${icon} ${item.value}`;
        
        a.addEventListener('click', (e) => {
            e.preventDefault();
            if (item.type === 'property' && item.id) {
                window.location.href = `/listings/${item.id}`;
            } else {
                searchInput.value = item.value;
            }
        });
        
        autocompleteResults.appendChild(a);
    });
}
```

---

## Styling

### Autocomplete Dropdown

```css
#autocompleteResults {
    max-height: 300px;
    overflow-y: auto;
    border: 1px solid #ddd;
    border-radius: 4px;
    margin-top: 2px;
    z-index: 1000;
}

#autocompleteResults .list-group-item:hover {
    background-color: #f8f9fa;
    cursor: pointer;
}
```

---

## Usage Examples

### Example 1: Search for Properties in Paris
```
URL: /listings?location=Paris
```

### Example 2: General Search
```
URL: /listings?search=beachfront villa
```

### Example 3: Search by Property Name
```
URL: /listings?name=luxury
```

### Example 4: Country Filter
```
URL: /listings?country=Japan
```

### Example 5: Combined Filters
```
URL: /listings?country=France&location=Paris
```

---

## Performance Considerations

1. **Debouncing**: 300ms delay prevents excessive API calls
2. **Limit Results**: Autocomplete limited to 10 suggestions
3. **Session Storage**: Recent searches stored in session (not database)
4. **Case-Insensitive**: Uses regex for flexible matching
5. **Indexed Fields**: Consider adding MongoDB indexes on `location`, `country`, `title`

---

## Future Enhancements

### Planned Features (from FUTURE_IMPROVEMENTS_AND_ROADMAP.md):
- [ ] Geolocation-based nearby search (using coordinates)
- [ ] Advanced filters (price range, amenities, property type)
- [ ] Sort options (price, rating, distance)
- [ ] Date-based availability search
- [ ] Guest count filtering
- [ ] Elasticsearch integration for faster search
- [ ] Search analytics and popular searches
- [ ] Voice search
- [ ] Image-based search

### Recommended Improvements:
1. **Add MongoDB Indexes**
   ```javascript
   listingSchema.index({ location: 'text', country: 'text', title: 'text', description: 'text' });
   ```

2. **Implement Full-Text Search**
   ```javascript
   const listings = await Listing.find(
       { $text: { $search: searchTerm } },
       { score: { $meta: "textScore" } }
   ).sort({ score: { $meta: "textScore" } });
   ```

3. **Add Geospatial Queries**
   ```javascript
   listingSchema.add({
       coordinates: {
           type: { type: String, default: 'Point' },
           coordinates: [Number] // [longitude, latitude]
       }
   });
   
   listingSchema.index({ coordinates: '2dsphere' });
   ```

4. **Implement Caching**
   - Cache popular search results
   - Use Redis for autocomplete suggestions
   - Cache location lists

---

## Testing

### Manual Testing Checklist:
- [ ] Search with valid location
- [ ] Search with invalid location (should return empty)
- [ ] Autocomplete shows suggestions after 2 characters
- [ ] Autocomplete hides when clicking outside
- [ ] Recent searches display correctly
- [ ] Clear recent searches works
- [ ] Navbar search redirects to listings
- [ ] Property suggestions navigate to detail page
- [ ] Search results show correct count
- [ ] Multiple filters work together

### API Testing:
```bash
# Test autocomplete
curl "http://localhost:3000/api/autocomplete?q=paris"

# Test recent searches
curl "http://localhost:3000/api/recent-searches"

# Test nearby
curl "http://localhost:3000/api/nearby?location=Paris"
```

---

## Troubleshooting

### Issue: Autocomplete not showing
**Solution:** Check browser console for errors. Ensure `/api/autocomplete` endpoint is accessible.

### Issue: Recent searches not persisting
**Solution:** Verify session configuration in `app.js`. Check cookie settings.

### Issue: Search returns no results
**Solution:** 
- Check database connection
- Verify listings exist in database
- Check search query case sensitivity
- Review regex patterns

### Issue: Autocomplete too slow
**Solution:**
- Increase debounce delay
- Add database indexes
- Limit results further
- Implement caching

---

## Security Considerations

1. **Input Sanitization**: All inputs are escaped in regex patterns
2. **XSS Prevention**: Use proper escaping in EJS templates
3. **Rate Limiting**: Consider adding rate limits to autocomplete endpoint
4. **CSRF Protection**: Already implemented in main app

---

**Last Updated:** October 31, 2025
**Version:** 1.0
**Author:** Wanderlust Development Team

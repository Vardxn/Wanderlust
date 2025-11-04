const axios = require('axios');
const { getDistance } = require('geolib');

/**
 * Get location coordinates from Google Maps Geocoding API
 * @param {string} address - Full address or location name
 * @returns {Promise<Object>} - Coordinates {lat, lng}
 */
async function getCoordinates(address) {
    try {
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
            console.warn('Google Maps API key not configured');
            return null;
        }

        const response = await axios.get(
            `https://maps.googleapis.com/maps/api/geocode/json`,
            {
                params: {
                    address: address,
                    key: apiKey
                }
            }
        );

        if (response.data.status === 'OK' && response.data.results.length > 0) {
            const location = response.data.results[0].geometry.location;
            return {
                lat: location.lat,
                lng: location.lng,
                formatted_address: response.data.results[0].formatted_address
            };
        }

        return null;
    } catch (error) {
        console.error('Error getting coordinates:', error.message);
        return null;
    }
}

/**
 * Get nearby places using Google Places API
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {string} type - Place type (restaurant, cafe, airport, etc.)
 * @param {number} radius - Radius in meters (default: 2000)
 * @returns {Promise<Array>} - Array of nearby places
 */
async function getNearbyPlaces(lat, lng, type, radius = 2000) {
    try {
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
            return [];
        }

        const response = await axios.get(
            `https://maps.googleapis.com/maps/api/place/nearbysearch/json`,
            {
                params: {
                    location: `${lat},${lng}`,
                    radius: radius,
                    type: type,
                    key: apiKey
                }
            }
        );

        if (response.data.status === 'OK') {
            return response.data.results.map(place => ({
                name: place.name,
                address: place.vicinity,
                rating: place.rating || 0,
                userRatingsTotal: place.user_ratings_total || 0,
                distance: calculateDistance(
                    { lat, lng },
                    { lat: place.geometry.location.lat, lng: place.geometry.location.lng }
                ),
                placeId: place.place_id
            }));
        }

        return [];
    } catch (error) {
        console.error(`Error getting nearby ${type}:`, error.message);
        return [];
    }
}

/**
 * Calculate distance between two coordinates in kilometers
 * @param {Object} coords1 - {lat, lng}
 * @param {Object} coords2 - {lat, lng}
 * @returns {number} - Distance in kilometers
 */
function calculateDistance(coords1, coords2) {
    const distance = getDistance(
        { latitude: coords1.lat, longitude: coords1.lng },
        { latitude: coords2.lat, longitude: coords2.lng }
    );
    return (distance / 1000).toFixed(2); // Convert to km
}

/**
 * Get comprehensive location data for a listing
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<Object>} - Location data with nearby places
 */
async function getLocationData(lat, lng) {
    try {
        const [
            restaurants,
            cafes,
            groceryStores,
            attractions,
            publicTransport,
            airports
        ] = await Promise.all([
            getNearbyPlaces(lat, lng, 'restaurant', 1500),
            getNearbyPlaces(lat, lng, 'cafe', 1500),
            getNearbyPlaces(lat, lng, 'supermarket', 2000),
            getNearbyPlaces(lat, lng, 'tourist_attraction', 3000),
            getNearbyPlaces(lat, lng, 'transit_station', 1000),
            getNearbyPlaces(lat, lng, 'airport', 50000)
        ]);

        return {
            nearbyRestaurants: restaurants.slice(0, 5),
            nearbyCafes: cafes.slice(0, 5),
            nearbyGroceryStores: groceryStores.slice(0, 3),
            nearbyAttractions: attractions.slice(0, 5),
            nearbyPublicTransport: publicTransport.slice(0, 5),
            nearbyAirports: airports.slice(0, 2),
            walkabilityScore: calculateWalkabilityScore(restaurants, cafes, groceryStores, publicTransport)
        };
    } catch (error) {
        console.error('Error getting location data:', error.message);
        return null;
    }
}

/**
 * Calculate walkability score based on nearby amenities
 * @param {Array} restaurants - Nearby restaurants
 * @param {Array} cafes - Nearby cafes
 * @param {Array} groceryStores - Nearby grocery stores
 * @param {Array} publicTransport - Nearby public transport
 * @returns {number} - Walkability score (0-100)
 */
function calculateWalkabilityScore(restaurants, cafes, groceryStores, publicTransport) {
    let score = 0;

    // Points for restaurants (max 25)
    score += Math.min(restaurants.length * 5, 25);

    // Points for cafes (max 15)
    score += Math.min(cafes.length * 3, 15);

    // Points for grocery stores (max 20)
    score += Math.min(groceryStores.length * 10, 20);

    // Points for public transport (max 40)
    score += Math.min(publicTransport.length * 8, 40);

    return Math.min(score, 100);
}

/**
 * Get reverse geocoding data (address from coordinates)
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<Object>} - Address components
 */
async function getReverseGeocode(lat, lng) {
    try {
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
            return null;
        }

        const response = await axios.get(
            `https://maps.googleapis.com/maps/api/geocode/json`,
            {
                params: {
                    latlng: `${lat},${lng}`,
                    key: apiKey
                }
            }
        );

        if (response.data.status === 'OK' && response.data.results.length > 0) {
            const result = response.data.results[0];
            const components = result.address_components;

            return {
                formattedAddress: result.formatted_address,
                neighborhood: components.find(c => c.types.includes('neighborhood'))?.long_name,
                city: components.find(c => c.types.includes('locality'))?.long_name,
                state: components.find(c => c.types.includes('administrative_area_level_1'))?.long_name,
                country: components.find(c => c.types.includes('country'))?.long_name,
                postalCode: components.find(c => c.types.includes('postal_code'))?.long_name
            };
        }

        return null;
    } catch (error) {
        console.error('Error with reverse geocoding:', error.message);
        return null;
    }
}

module.exports = {
    getCoordinates,
    getNearbyPlaces,
    calculateDistance,
    getLocationData,
    calculateWalkabilityScore,
    getReverseGeocode
};

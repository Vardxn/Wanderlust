const mongoose = require('mongoose');
const Listing = require('../models/listing');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wanderlust';

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log("✅ Database connected");
        updateListings();
    })
    .catch(err => {
        console.log("❌ MongoDB connection error");
        console.log(err);
    });

// Property types with their characteristics
const propertyTypes = ['Villa', 'Apartment', 'Cabin', 'Penthouse', 'Cottage', 'Mansion', 'Treehouse', 'Houseboat', 'Castle', 'Apartment'];

// Available amenities
const allAmenities = [
    'WiFi', 
    'Kitchen', 
    'Air Conditioning', 
    'Heating', 
    'Swimming Pool', 
    'Hot Tub', 
    'Parking', 
    'Gym', 
    'Washer/Dryer', 
    'TV', 
    'Workspace', 
    'Pet-friendly'
];

// Function to get random items from array
function getRandomItems(arr, min, max) {
    const count = Math.floor(Math.random() * (max - min + 1)) + min;
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// Function to determine property type based on title
function determinePropertyType(title) {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('villa')) return 'Villa';
    if (lowerTitle.includes('apartment') || lowerTitle.includes('condo')) return 'Apartment';
    if (lowerTitle.includes('cabin')) return 'Cabin';
    if (lowerTitle.includes('penthouse')) return 'Penthouse';
    if (lowerTitle.includes('cottage')) return 'Cottage';
    if (lowerTitle.includes('mansion')) return 'Mansion';
    if (lowerTitle.includes('treehouse')) return 'Treehouse';
    if (lowerTitle.includes('houseboat') || lowerTitle.includes('boat')) return 'Houseboat';
    if (lowerTitle.includes('castle') || lowerTitle.includes('palace')) return 'Castle';
    
    // Default based on price
    return propertyTypes[Math.floor(Math.random() * propertyTypes.length)];
}

// Function to generate realistic values based on property type and price
function generatePropertyDetails(listing) {
    const propertyType = determinePropertyType(listing.title);
    const price = listing.price;
    
    // Determine bedrooms based on price and type
    let bedrooms = 2;
    if (price > 80000) bedrooms = Math.floor(Math.random() * 4) + 3; // 3-6
    else if (price > 60000) bedrooms = Math.floor(Math.random() * 3) + 2; // 2-4
    else if (price > 40000) bedrooms = Math.floor(Math.random() * 2) + 2; // 2-3
    else bedrooms = Math.floor(Math.random() * 2) + 1; // 1-2
    
    // Special cases
    if (propertyType === 'Treehouse' || propertyType === 'Cabin') {
        bedrooms = Math.min(bedrooms, 3);
    }
    if (propertyType === 'Mansion' || propertyType === 'Castle') {
        bedrooms = Math.max(bedrooms, 4);
    }
    
    // Bathrooms (usually bedroom count or bedroom count - 1)
    const bathrooms = Math.max(1, bedrooms - Math.floor(Math.random() * 2));
    
    // Max guests (roughly 2 per bedroom + 1-2 extra)
    const maxGuests = (bedrooms * 2) + Math.floor(Math.random() * 3);
    
    // Amenities based on property type and price
    let amenitiesCount = [6, 9]; // min, max
    if (price > 80000) amenitiesCount = [8, 12];
    else if (price > 60000) amenitiesCount = [7, 10];
    else if (price < 40000) amenitiesCount = [4, 7];
    
    const amenities = getRandomItems(allAmenities, amenitiesCount[0], amenitiesCount[1]);
    
    // Ensure basic amenities for higher-priced properties
    if (price > 60000 && !amenities.includes('WiFi')) amenities.push('WiFi');
    if (price > 70000 && !amenities.includes('Kitchen')) amenities.push('Kitchen');
    if (price > 80000 && !amenities.includes('Air Conditioning')) amenities.push('Air Conditioning');
    
    // Special amenities for certain property types
    if (propertyType === 'Villa' || propertyType === 'Mansion') {
        if (!amenities.includes('Swimming Pool') && Math.random() > 0.5) amenities.push('Swimming Pool');
    }
    if (propertyType === 'Penthouse') {
        if (!amenities.includes('Gym') && Math.random() > 0.6) amenities.push('Gym');
    }
    
    // Instant book (30% chance for higher-priced properties)
    const instantBook = price > 60000 ? Math.random() > 0.7 : Math.random() > 0.85;
    
    return {
        propertyType,
        bedrooms,
        bathrooms,
        maxGuests,
        amenities,
        instantBook
    };
}

async function updateListings() {
    try {
        const listings = await Listing.find({});
        console.log(`\n📊 Found ${listings.length} listings to update\n`);
        
        let updated = 0;
        
        for (const listing of listings) {
            // Skip if already has propertyType
            if (listing.propertyType && listing.bedrooms) {
                console.log(`⏭️  Skipping "${listing.title}" - already updated`);
                continue;
            }
            
            const details = generatePropertyDetails(listing);
            
            listing.propertyType = details.propertyType;
            listing.bedrooms = details.bedrooms;
            listing.bathrooms = details.bathrooms;
            listing.maxGuests = details.maxGuests;
            listing.amenities = details.amenities;
            listing.instantBook = details.instantBook;
            
            await listing.save();
            updated++;
            
            console.log(`✅ Updated: ${listing.title}`);
            console.log(`   Type: ${details.propertyType} | Beds: ${details.bedrooms} | Baths: ${details.bathrooms} | Guests: ${details.maxGuests}`);
            console.log(`   Amenities: ${details.amenities.length} | Instant Book: ${details.instantBook}\n`);
        }
        
        console.log(`\n🎉 Successfully updated ${updated} listings!`);
        console.log(`💡 Skipped ${listings.length - updated} already-updated listings\n`);
        
        mongoose.connection.close();
    } catch (err) {
        console.error('❌ Error updating listings:', err);
        mongoose.connection.close();
    }
}

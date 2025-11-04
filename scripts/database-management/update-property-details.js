const mongoose = require('mongoose');
const Listing = require('../../models/listing');

// MongoDB connection
const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';

mongoose.connect(MONGO_URL)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Realistic data generators
function generatePropertySize(propertyType, bedrooms) {
    let baseSqft;
    
    switch(propertyType) {
        case 'Villa':
        case 'Mansion':
            baseSqft = 2500 + (bedrooms * 400);
            break;
        case 'Penthouse':
            baseSqft = 1800 + (bedrooms * 350);
            break;
        case 'Apartment':
            baseSqft = 800 + (bedrooms * 250);
            break;
        case 'Cottage':
        case 'Cabin':
            baseSqft = 1000 + (bedrooms * 200);
            break;
        case 'Treehouse':
        case 'Houseboat':
            baseSqft = 400 + (bedrooms * 150);
            break;
        case 'Castle':
            baseSqft = 5000 + (bedrooms * 500);
            break;
        default:
            baseSqft = 1000 + (bedrooms * 250);
    }
    
    const sqft = baseSqft + Math.floor(Math.random() * 300);
    const sqm = Math.round(sqft * 0.092903); // Convert to square meters
    
    return { sqft, sqm };
}

function generateBedConfiguration(bedrooms) {
    const bedTypes = ['King', 'Queen', 'Double', 'Single', 'Bunk Bed'];
    const roomNames = ['Master Bedroom', 'Guest Bedroom', 'Second Bedroom', 'Third Bedroom', 'Fourth Bedroom', 'Loft', 'Den'];
    const config = [];
    
    for (let i = 0; i < bedrooms; i++) {
        let bedType;
        if (i === 0) {
            // Master bedroom usually has King or Queen
            bedType = Math.random() > 0.5 ? 'King' : 'Queen';
        } else {
            // Other rooms have variety
            bedType = bedTypes[Math.floor(Math.random() * bedTypes.length)];
        }
        
        config.push({
            roomName: i < roomNames.length ? roomNames[i] : `Bedroom ${i + 1}`,
            bedType: bedType,
            quantity: bedType === 'Bunk Bed' && Math.random() > 0.5 ? 2 : 1
        });
    }
    
    // 30% chance of sofa bed in living room for extra sleeping
    if (Math.random() > 0.7) {
        config.push({
            roomName: 'Living Room',
            bedType: 'Sofa Bed',
            quantity: 1
        });
    }
    
    return config;
}

function generateHouseRules(propertyType, amenities) {
    const checkInTimes = ['1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'];
    const checkOutTimes = ['10:00 AM', '11:00 AM', '12:00 PM'];
    
    const additionalRules = [
        'Guests must be 21 years or older to book',
        'No smoking inside the property',
        'Please remove shoes before entering',
        'Keep noise levels down during quiet hours',
        'Lock all doors and windows when leaving',
        'Turn off all lights and AC when not in use',
        'Do not move furniture',
        'Report any damage immediately',
        'Respect the neighbors',
        'Maximum occupancy strictly enforced'
    ];
    
    // Select 3-5 random additional rules
    const selectedRules = [];
    const numRules = 3 + Math.floor(Math.random() * 3);
    const shuffled = additionalRules.sort(() => 0.5 - Math.random());
    for (let i = 0; i < numRules; i++) {
        selectedRules.push(shuffled[i]);
    }
    
    return {
        checkInTime: checkInTimes[Math.floor(Math.random() * checkInTimes.length)],
        checkOutTime: checkOutTimes[Math.floor(Math.random() * checkOutTimes.length)],
        quietHours: {
            start: Math.random() > 0.5 ? '10:00 PM' : '11:00 PM',
            end: Math.random() > 0.5 ? '8:00 AM' : '7:00 AM'
        },
        smokingAllowed: Math.random() > 0.9, // 10% allow smoking
        partiesAllowed: Math.random() > 0.85, // 15% allow parties
        petsAllowed: amenities.includes('Pet-friendly'),
        additionalRules: selectedRules
    };
}

function generateCancellationPolicy(price) {
    let policy;
    
    if (price > 75000) {
        // Luxury properties tend to have stricter policies
        policy = Math.random() > 0.5 ? 'Super Strict' : 'Strict';
    } else if (price > 50000) {
        policy = Math.random() > 0.5 ? 'Strict' : 'Moderate';
    } else {
        policy = Math.random() > 0.5 ? 'Moderate' : 'Flexible';
    }
    
    const descriptions = {
        'Flexible': 'Free cancellation up to 24 hours before check-in. Cancel before then and get a full refund.',
        'Moderate': 'Free cancellation up to 5 days before check-in. After that, cancel up to 24 hours before check-in and get a 50% refund.',
        'Strict': 'Free cancellation up to 7 days before check-in. After that, the first 50% of the payment is non-refundable.',
        'Super Strict': 'Non-refundable. Once booked, the entire amount is non-refundable regardless of cancellation.'
    };
    
    return {
        type: policy,
        description: descriptions[policy]
    };
}

function generateSafetyFeatures(propertyType) {
    // Most properties should have basic safety features
    const hasBasicSafety = Math.random() > 0.2; // 80% have basic safety
    
    const safetyFeatures = {
        smokeAlarm: hasBasicSafety,
        carbonMonoxideAlarm: hasBasicSafety && Math.random() > 0.3, // 70% have CO alarm if they have smoke alarm
        fireExtinguisher: hasBasicSafety && Math.random() > 0.4, // 60% have fire extinguisher
        firstAidKit: Math.random() > 0.4, // 60% have first aid kit
        securityCameras: {
            present: Math.random() > 0.6, // 40% have security cameras
            locations: []
        }
    };
    
    if (safetyFeatures.securityCameras.present) {
        const possibleLocations = ['Front Door', 'Driveway', 'Backyard', 'Pool Area', 'Parking Area', 'Main Entrance'];
        const numCameras = 1 + Math.floor(Math.random() * 3); // 1-3 cameras
        const shuffled = possibleLocations.sort(() => 0.5 - Math.random());
        for (let i = 0; i < numCameras; i++) {
            safetyFeatures.securityCameras.locations.push(shuffled[i]);
        }
    }
    
    return safetyFeatures;
}

async function updateListingsWithDetailedInfo() {
    try {
        console.log('\n🔄 Fetching all listings...');
        const listings = await Listing.find({});
        console.log(`Found ${listings.length} listings to update\n`);
        
        let updated = 0;
        let skipped = 0;
        
        for (const listing of listings) {
            // Check if already has detailed info
            if (listing.propertySize && listing.propertySize.sqft) {
                console.log(`⏭️  Skipping "${listing.title}" - already has detailed info`);
                skipped++;
                continue;
            }
            
            const propertyType = listing.propertyType || 'Apartment';
            const bedrooms = listing.bedrooms || 2;
            const amenities = listing.amenities || [];
            
            // Generate all detailed information
            const propertySize = generatePropertySize(propertyType, bedrooms);
            const bedConfiguration = generateBedConfiguration(bedrooms);
            const houseRules = generateHouseRules(propertyType, amenities);
            const cancellationPolicy = generateCancellationPolicy(listing.price);
            const safetyFeatures = generateSafetyFeatures(propertyType);
            
            // Update the listing
            await Listing.findByIdAndUpdate(listing._id, {
                $set: {
                    propertySize,
                    bedConfiguration,
                    houseRules,
                    cancellationPolicy,
                    safetyFeatures
                }
            });
            
            console.log(`✅ Updated "${listing.title}"`);
            console.log(`   📏 Size: ${propertySize.sqft} sq ft (${propertySize.sqm} sq m)`);
            console.log(`   🛏️  Beds: ${bedConfiguration.map(b => `${b.quantity}x ${b.bedType}`).join(', ')}`);
            console.log(`   🏠 Check-in: ${houseRules.checkInTime}, Check-out: ${houseRules.checkOutTime}`);
            console.log(`   🚭 Smoking: ${houseRules.smokingAllowed ? 'Allowed' : 'Not Allowed'}`);
            console.log(`   🎉 Parties: ${houseRules.partiesAllowed ? 'Allowed' : 'Not Allowed'}`);
            console.log(`   🐕 Pets: ${houseRules.petsAllowed ? 'Allowed' : 'Not Allowed'}`);
            console.log(`   ❌ Cancellation: ${cancellationPolicy.type}`);
            console.log(`   🔒 Safety: Smoke Alarm: ${safetyFeatures.smokeAlarm ? 'Yes' : 'No'}, CO Alarm: ${safetyFeatures.carbonMonoxideAlarm ? 'Yes' : 'No'}`);
            console.log(`   📹 Cameras: ${safetyFeatures.securityCameras.present ? safetyFeatures.securityCameras.locations.join(', ') : 'None'}\n`);
            
            updated++;
        }
        
        console.log('\n' + '='.repeat(60));
        console.log('📊 UPDATE SUMMARY');
        console.log('='.repeat(60));
        console.log(`Total listings: ${listings.length}`);
        console.log(`✅ Updated: ${updated}`);
        console.log(`⏭️  Skipped: ${skipped}`);
        console.log('='.repeat(60) + '\n');
        
        if (updated > 0) {
            console.log('🎉 Detailed property information successfully added!');
            console.log('📝 Now listings include:');
            console.log('   • Property size (sq ft & sq m)');
            console.log('   • Bed configuration for each room');
            console.log('   • House rules (check-in/out times, quiet hours, policies)');
            console.log('   • Cancellation policy (Flexible/Moderate/Strict/Super Strict)');
            console.log('   • Safety features (alarms, extinguisher, first aid, cameras)\n');
        }
        
        mongoose.connection.close();
        console.log('✅ Database connection closed');
        
    } catch (error) {
        console.error('\n❌ Error updating listings:', error);
        mongoose.connection.close();
        process.exit(1);
    }
}

// Run the update
console.log('\n' + '='.repeat(60));
console.log('🚀 UPDATING LISTINGS WITH DETAILED INFORMATION');
console.log('='.repeat(60));
console.log('This script will add the following to all listings:');
console.log('  • Property size (square footage & meters)');
console.log('  • Bed configuration (room names & bed types)');
console.log('  • House rules (times, policies, additional rules)');
console.log('  • Cancellation policy (with descriptions)');
console.log('  • Safety features (alarms, equipment, cameras)');
console.log('='.repeat(60) + '\n');

updateListingsWithDetailedInfo();

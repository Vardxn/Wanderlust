const mongoose = require('mongoose');
const Listing = require('../../models/listing');

// MongoDB connection
const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';

mongoose.connect(MONGO_URL)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Helper function to generate realistic booking fields based on price
function generateBookingFields(price, propertyType) {
    // Cleaning fee based on property type and price
    let cleaningFee = 0;
    if (propertyType === 'Entire home' || propertyType === 'Villa' || propertyType === 'Cottage') {
        cleaningFee = Math.round(price * 0.3); // 30% of nightly rate
    } else if (propertyType === 'Entire apartment' || propertyType === 'Townhouse') {
        cleaningFee = Math.round(price * 0.25); // 25% of nightly rate
    } else if (propertyType === 'Private room') {
        cleaningFee = Math.round(price * 0.15); // 15% of nightly rate
    } else {
        cleaningFee = Math.round(price * 0.2); // 20% default
    }
    
    // Service fee is 12% of nightly rate (standard)
    const serviceFee = Math.round(price * 0.12);
    
    // Minimum stay (1-3 nights for most, 5-7 for luxury)
    let minimumStay = 1;
    if (price > 10000) {
        minimumStay = Math.floor(Math.random() * 3) + 3; // 3-5 nights for luxury
    } else if (price > 5000) {
        minimumStay = Math.floor(Math.random() * 2) + 2; // 2-3 nights for premium
    } else {
        minimumStay = Math.random() > 0.7 ? 2 : 1; // Mostly 1 night, some 2 nights
    }
    
    // Maximum stay (typically 28 days, some longer)
    const maximumStay = Math.random() > 0.8 ? 90 : 28; // 20% allow 90 days, 80% allow 28 days
    
    // Weekly discount (10-15% for 7+ nights)
    const weeklyDiscount = Math.floor(Math.random() * 6) + 10; // 10-15%
    
    // Monthly discount (20-30% for 28+ nights)
    const monthlyDiscount = Math.floor(Math.random() * 11) + 20; // 20-30%
    
    return {
        cleaningFee,
        serviceFee,
        minimumStay,
        maximumStay,
        weeklyDiscount,
        monthlyDiscount
    };
}

async function updateListingsWithBookingFields() {
    try {
        console.log('\n🔄 Fetching all listings...');
        const listings = await Listing.find({});
        console.log(`Found ${listings.length} listings to update\n`);
        
        let updated = 0;
        let skipped = 0;
        
        for (const listing of listings) {
            // Check if already has booking fields
            if (listing.cleaningFee !== undefined && listing.serviceFee !== undefined) {
                console.log(`⏭️  Skipping "${listing.title}" - already has booking fields`);
                skipped++;
                continue;
            }
            
            // Generate booking fields
            const bookingFields = generateBookingFields(
                listing.price, 
                listing.propertyType || 'Entire home'
            );
            
            // Update the listing
            await Listing.findByIdAndUpdate(listing._id, {
                $set: bookingFields
            });
            
            console.log(`✅ Updated "${listing.title}"`);
            console.log(`   - Cleaning Fee: ₹${bookingFields.cleaningFee.toLocaleString()}`);
            console.log(`   - Service Fee: ₹${bookingFields.serviceFee.toLocaleString()}`);
            console.log(`   - Min Stay: ${bookingFields.minimumStay} night(s)`);
            console.log(`   - Max Stay: ${bookingFields.maximumStay} days`);
            console.log(`   - Weekly Discount: ${bookingFields.weeklyDiscount}%`);
            console.log(`   - Monthly Discount: ${bookingFields.monthlyDiscount}%\n`);
            
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
            console.log('🎉 Booking fields successfully added to all listings!');
            console.log('📝 You can now:');
            console.log('   1. Test price calculation: POST /api/calculate-price');
            console.log('   2. Check availability: POST /api/check-availability');
            console.log('   3. Create bookings: POST /listings/:id/book');
            console.log('   4. View booking details on listing pages\n');
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
console.log('🚀 UPDATING LISTINGS WITH BOOKING FIELDS');
console.log('='.repeat(60));
console.log('This script will add the following fields to all listings:');
console.log('  • cleaningFee (based on property type and price)');
console.log('  • serviceFee (12% of nightly rate)');
console.log('  • minimumStay (1-5 nights based on price)');
console.log('  • maximumStay (28 or 90 days)');
console.log('  • weeklyDiscount (10-15%)');
console.log('  • monthlyDiscount (20-30%)');
console.log('='.repeat(60) + '\n');

updateListingsWithBookingFields();

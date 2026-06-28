const mongoose = require('mongoose');
const Listing = require('../models/listing');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wanderlust';

// Array of 100 different host names
const hostNames = [
    'Sarah Anderson', 'Michael Johnson', 'Emily Chen', 'David Martinez', 'Jessica Brown',
    'James Wilson', 'Amanda Taylor', 'Christopher Lee', 'Jennifer Davis', 'Daniel Garcia',
    'Lauren Rodriguez', 'Andrew Martinez', 'Sophia Hernandez', 'Kevin Thompson', 'Victoria White',
    'Brandon Harris', 'Olivia Martin', 'Ryan Moore', 'Isabella Perez', 'Justin Jackson',
    'Ava Robinson', 'Tyler Clarke', 'Mia Lewis', 'Ethan Young', 'Charlotte Hall',
    'Logan Allen', 'Amelia Sanchez', 'Lucas King', 'Harper Wright', 'Mason Lopez',
    'Evelyn Hill', 'Jake Green', 'Abigail Adams', 'Alexander Scott', 'Charlotte Green',
    'Benjamin Ramirez', 'Harper Campbell', 'Samuel Parker', 'Scarlett Evans', 'Carter Edwards',
    'Violet Tate', 'Wyatt Bailey', 'Ruby Malone', 'Nathan Rivera', 'Lily Cooper',
    'Gabriel Richardson', 'Grace Ford', 'Elijah Dunn', 'Chloe Vasquez', 'Alexander Walsh',
    'Penelope Wheeler', 'Mason Palmer', 'Avery Casey', 'Gabriel Lowe', 'Layla Wall',
    'Oliver Day', 'Ella Garrett', 'Lucas Shea', 'Eleanor Houston', 'Logan Burton',
    'Hannah Vargas', 'Jackson Pitts', 'Nora Brady', 'Aiden Thorpe', 'Zoey Bragg',
    'Luke Conner', 'Lillian Cantrell', 'Noah Erickson', 'Hannah Dickerson', 'Liam Meadows',
    'Emma Rowley', 'Marcus Kramer', 'Addison Stein', 'Dominic Cordova', 'Sofia Case',
    'Caleb Singleton', 'Audrey Pena', 'Isaiah Mullins', 'Aria Buckner', 'Landon Nielsen',
    'Isabella Mullins', 'Jaxon Piel', 'Mila Solis', 'Grayson Underwood', 'Violet Baird',
    'Colton Avery', 'Lucy Mccain', 'Ezra Finley', 'Harper Delgado', 'Casen Cole',
    'Nora Gibbs', 'Declan Rone', 'Stella Lara', 'Rocco Trevino'
];

// Function to generate random experience (1-20 years)
function getRandomExperience() {
    return Math.floor(Math.random() * 20) + 1;
}

// Function to shuffle array and pick random items
function pickRandomName(usedNames) {
    let name;
    do {
        name = hostNames[Math.floor(Math.random() * hostNames.length)];
    } while (usedNames.has(name));
    usedNames.add(name);
    return name;
}

async function seedOwnerData() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const listings = await Listing.find({});
        console.log(`📊 Found ${listings.length} listings`);

        if (listings.length === 0) {
            console.log('❌ No listings found in database. Please run init/index.js first.');
            await mongoose.connection.close();
            return;
        }

        const usedNames = new Set();
        let updated = 0;

        for (let i = 0; i < listings.length; i++) {
            const listing = listings[i];
            
            // Assign random host name and experience
            listing.ownerName = pickRandomName(usedNames);
            listing.yearsOfExperience = getRandomExperience();
            
            await listing.save();
            
            if ((i + 1) % 10 === 0) {
                console.log(`  ⏳ Updated ${i + 1}/${listings.length} listings...`);
            }
            updated++;
        }

        console.log(`\n✅ Successfully updated ${updated} listings with host information!`);
        console.log('\n📋 Host Names Used:');
        const namesArray = Array.from(usedNames).sort();
        namesArray.forEach((name, index) => {
            console.log(`  ${index + 1}. ${name}`);
        });

        await mongoose.connection.close();
        console.log('\n✨ Database seeding complete!');
    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }
}

// Run the seeding
seedOwnerData();

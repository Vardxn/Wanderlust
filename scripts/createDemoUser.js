require('dotenv').config();

const mongoose = require('mongoose');
const User = require('../models/user');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wanderlust';

async function createDemoUser() {
    await mongoose.connect(MONGODB_URI);

    const username = process.env.DEMO_USERNAME || 'demo_user';
    const email = process.env.DEMO_EMAIL || 'demo@wanderlust.local';
    const password = process.env.DEMO_PASSWORD || 'Demo@12345';

    const existingUser = await User.findOne({ username });
    if (existingUser) {
        console.log(`Demo user already exists: ${username}`);
        await mongoose.disconnect();
        return;
    }

    const user = new User({ username, email });
    await User.register(user, password);

    console.log('Demo user created successfully');
    console.log(`Username: ${username}`);
    console.log(`Password: ${password}`);

    await mongoose.disconnect();
}

createDemoUser().catch(async (error) => {
    console.error('Failed to create demo user:', error.message);
    await mongoose.disconnect();
    process.exit(1);
});

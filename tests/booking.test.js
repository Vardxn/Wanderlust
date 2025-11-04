const mongoose = require('mongoose');
const Booking = require('../models/booking');

describe('Booking Model', () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGODB_TEST_URI);
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    test('should check availability correctly', async () => {
        const listingId = new mongoose.Types.ObjectId();
        const checkIn = new Date('2025-01-01');
        const checkOut = new Date('2025-01-05');

        const isAvailable = await Booking.checkAvailability(
            listingId,
            checkIn,
            checkOut
        );

        expect(isAvailable).toBe(true);
    });

    test('should calculate nights correctly', () => {
        const checkIn = new Date('2025-01-01');
        const checkOut = new Date('2025-01-05');
        const booking = new Booking({ checkIn, checkOut });

        expect(booking.nights).toBe(4);
    });
});

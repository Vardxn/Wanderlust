/**
 * Booking Reminder System
 * 
 * This script sends reminder notifications 24 hours before check-in.
 * 
 * Setup:
 * 1. Install required packages:
 *    npm install node-cron nodemailer
 * 
 * 2. Configure email service (SendGrid, Gmail, etc.)
 * 
 * 3. Run this script as a background service:
 *    node scripts/booking-management/send-booking-reminders.js
 * 
 * 4. Or use PM2 for production:
 *    pm2 start scripts/booking-management/send-booking-reminders.js --name "booking-reminders"
 */

const mongoose = require('mongoose');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Booking = require('../../models/booking');

// MongoDB connection
const MONGO_URL = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/wanderlust';

mongoose.connect(MONGO_URL)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// Email configuration
// Replace with your actual email service credentials
const transporter = nodemailer.createTransport({
    service: 'gmail', // or 'SendGrid', 'Mailgun', etc.
    auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'your-app-password'
    }
});

// Function to send reminder email
async function sendReminderEmail(booking) {
    const checkInDate = new Date(booking.checkIn).toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    
    const mailOptions = {
        from: process.env.EMAIL_USER || 'noreply@wanderlust.com',
        to: booking.user.email,
        subject: `Reminder: Check-in Tomorrow at ${booking.listing.title}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #0d6efd; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background-color: #f8f9fa; }
                    .booking-details { background-color: white; padding: 15px; margin: 15px 0; border-radius: 8px; }
                    .button { display: inline-block; padding: 12px 24px; background-color: #0d6efd; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
                    .footer { text-align: center; padding: 20px; color: #6c757d; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🏠 Check-in Reminder</h1>
                    </div>
                    
                    <div class="content">
                        <p>Hi ${booking.user.username},</p>
                        
                        <p><strong>Your check-in is tomorrow!</strong> We're excited for your upcoming stay.</p>
                        
                        <div class="booking-details">
                            <h3>${booking.listing.title}</h3>
                            <p><strong>📍 Location:</strong> ${booking.listing.location}</p>
                            <p><strong>📅 Check-in:</strong> ${checkInDate} after 2:00 PM</p>
                            <p><strong>📅 Checkout:</strong> ${new Date(booking.checkOut).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} before 11:00 AM</p>
                            <p><strong>👥 Guests:</strong> ${booking.guests.adults} Adult${booking.guests.adults > 1 ? 's' : ''}${booking.guests.children > 0 ? ', ' + booking.guests.children + ' Child' + (booking.guests.children > 1 ? 'ren' : '') : ''}</p>
                            <p><strong>🆔 Booking ID:</strong> ${booking._id}</p>
                        </div>
                        
                        <h3>Important Reminders:</h3>
                        <ul>
                            <li>✅ Check-in time is after 2:00 PM</li>
                            <li>✅ Bring a valid government-issued photo ID</li>
                            <li>✅ Review the property's house rules</li>
                            ${booking.specialRequests ? '<li>✅ Your special request: ' + booking.specialRequests + '</li>' : ''}
                        </ul>
                        
                        <p style="text-align: center;">
                            <a href="http://localhost:3000/bookings/${booking._id}" class="button">View Booking Details</a>
                        </p>
                        
                        <p>Have questions? Contact your host or our support team.</p>
                        
                        <p>Safe travels!<br>
                        The Wanderlust Team</p>
                    </div>
                    
                    <div class="footer">
                        <p>Wanderlust Travel Platform | support@wanderlust.com</p>
                        <p>This is an automated reminder. Please do not reply to this email.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };
    
    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Reminder sent to ${booking.user.email} for booking ${booking._id}`);
        return true;
    } catch (error) {
        console.error(`❌ Failed to send reminder for booking ${booking._id}:`, error.message);
        return false;
    }
}

// Function to find and send reminders
async function processBookingReminders() {
    try {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        const dayAfterTomorrow = new Date(tomorrow);
        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
        
        // Find all confirmed bookings with check-in tomorrow
        const bookingsToRemind = await Booking.find({
            status: 'confirmed',
            checkIn: {
                $gte: tomorrow,
                $lt: dayAfterTomorrow
            },
            reminderSent: { $ne: true } // Only if reminder not already sent
        })
        .populate('listing')
        .populate('user');
        
        console.log(`\n📧 Processing booking reminders at ${now.toLocaleString()}`);
        console.log(`Found ${bookingsToRemind.length} booking(s) requiring reminders\n`);
        
        let successCount = 0;
        let failureCount = 0;
        
        for (const booking of bookingsToRemind) {
            const sent = await sendReminderEmail(booking);
            
            if (sent) {
                // Mark reminder as sent in database
                booking.reminderSent = true;
                await booking.save();
                successCount++;
            } else {
                failureCount++;
            }
            
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        console.log(`\n📊 Reminder Summary:`);
        console.log(`✅ Sent: ${successCount}`);
        console.log(`❌ Failed: ${failureCount}`);
        console.log(`─────────────────────────\n`);
        
    } catch (error) {
        console.error('❌ Error processing reminders:', error);
    }
}

// Schedule the job to run every day at 9:00 AM
// Cron format: minute hour day month weekday
// '0 9 * * *' = At 09:00 every day
cron.schedule('0 9 * * *', () => {
    console.log('⏰ Scheduled reminder job triggered');
    processBookingReminders();
}, {
    timezone: "Asia/Kolkata"
});

console.log('\n' + '='.repeat(60));
console.log('🚀 BOOKING REMINDER SERVICE STARTED');
console.log('='.repeat(60));
console.log('⏰ Scheduled to run daily at 9:00 AM IST');
console.log('📧 Will send reminders 24 hours before check-in');
console.log('💡 Press Ctrl+C to stop the service');
console.log('='.repeat(60) + '\n');

// Run once immediately on startup (optional, for testing)
// processBookingReminders();

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n\n⏹️  Shutting down reminder service...');
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
    console.log('👋 Goodbye!\n');
    process.exit(0);
});

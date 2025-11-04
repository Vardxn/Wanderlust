const nodemailer = require('nodemailer');

/**
 * Create email transporter
 */
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD
        },
        tls: {
            rejectUnauthorized: false
        }
    });
};

/**
 * Send booking confirmation email to guest
 * @param {Object} booking - Booking document
 * @param {Object} guest - Guest user document
 * @param {Object} listing - Listing document
 * @returns {Promise} Email send result
 */
async function sendBookingConfirmation(booking, guest, listing) {
    const transporter = createTransporter();
    
    const checkInDate = new Date(booking.checkIn).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const checkOutDate = new Date(booking.checkOut).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const mailOptions = {
        from: `"Wanderlust" <${process.env.SMTP_USER}>`,
        to: guest.email,
        subject: `Booking Confirmation - ${listing.title}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    .header {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 30px;
                        text-align: center;
                        border-radius: 10px 10px 0 0;
                    }
                    .content {
                        background: #f9f9f9;
                        padding: 30px;
                        border-radius: 0 0 10px 10px;
                    }
                    .booking-details {
                        background: white;
                        padding: 20px;
                        border-radius: 8px;
                        margin: 20px 0;
                    }
                    .detail-row {
                        display: flex;
                        justify-content: space-between;
                        padding: 10px 0;
                        border-bottom: 1px solid #eee;
                    }
                    .detail-label {
                        font-weight: bold;
                        color: #666;
                    }
                    .total {
                        font-size: 20px;
                        font-weight: bold;
                        color: #667eea;
                        padding-top: 15px;
                        border-top: 2px solid #667eea;
                    }
                    .button {
                        display: inline-block;
                        padding: 12px 30px;
                        background: #667eea;
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                        margin: 20px 0;
                    }
                    .footer {
                        text-align: center;
                        padding: 20px;
                        color: #666;
                        font-size: 12px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 Booking Confirmed!</h1>
                    </div>
                    <div class="content">
                        <p>Hi ${guest.firstName || guest.username},</p>
                        <p>Great news! Your booking at <strong>${listing.title}</strong> is ${booking.status === 'confirmed' ? 'confirmed' : 'pending approval'}.</p>
                        
                        <div class="booking-details">
                            <h2>Booking Details</h2>
                            <div class="detail-row">
                                <span class="detail-label">Booking ID:</span>
                                <span>#${booking._id.toString().slice(-8).toUpperCase()}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Property:</span>
                                <span>${listing.title}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Location:</span>
                                <span>${listing.location}, ${listing.country}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Check-in:</span>
                                <span>${checkInDate}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Check-out:</span>
                                <span>${checkOutDate}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Nights:</span>
                                <span>${booking.nights} night${booking.nights > 1 ? 's' : ''}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Guests:</span>
                                <span>${booking.guests.adults} adult${booking.guests.adults > 1 ? 's' : ''}${booking.guests.children > 0 ? `, ${booking.guests.children} child${booking.guests.children > 1 ? 'ren' : ''}` : ''}</span>
                            </div>
                        </div>

                        <div class="booking-details">
                            <h2>Price Breakdown</h2>
                            <div class="detail-row">
                                <span class="detail-label">₹${booking.pricing.nightlyRate} × ${booking.nights} nights</span>
                                <span>₹${booking.pricing.basePrice}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Cleaning Fee</span>
                                <span>₹${booking.pricing.cleaningFee}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Service Fee</span>
                                <span>₹${booking.pricing.serviceFee}</span>
                            </div>
                            ${booking.pricing.discount > 0 ? `
                            <div class="detail-row" style="color: #10b981;">
                                <span class="detail-label">${booking.pricing.discountType === 'weekly' ? 'Weekly' : 'Monthly'} Discount</span>
                                <span>-₹${booking.pricing.discount}</span>
                            </div>
                            ` : ''}
                            <div class="detail-row">
                                <span class="detail-label">Taxes</span>
                                <span>₹${booking.pricing.taxes}</span>
                            </div>
                            <div class="detail-row total">
                                <span class="detail-label">Total</span>
                                <span>₹${booking.pricing.total}</span>
                            </div>
                        </div>

                        ${booking.specialRequests ? `
                        <div class="booking-details">
                            <h3>Special Requests</h3>
                            <p>${booking.specialRequests}</p>
                        </div>
                        ` : ''}

                        <center>
                            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:8080'}/bookings/${booking._id}" class="button">View Booking Details</a>
                        </center>

                        <p style="margin-top: 30px;">If you have any questions, feel free to reach out to us.</p>
                        <p>Looking forward to hosting you!</p>
                        <p>Best regards,<br><strong>The Wanderlust Team</strong></p>
                    </div>
                    <div class="footer">
                        <p>This is an automated email. Please do not reply to this message.</p>
                        <p>&copy; ${new Date().getFullYear()} Wanderlust. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Booking confirmation email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending booking confirmation email:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Send booking cancellation email to guest
 * @param {Object} booking - Booking document
 * @param {Object} guest - Guest user document
 * @param {Object} listing - Listing document
 * @returns {Promise} Email send result
 */
async function sendCancellationEmail(booking, guest, listing) {
    const transporter = createTransporter();

    const mailOptions = {
        from: `"Wanderlust" <${process.env.SMTP_USER}>`,
        to: guest.email,
        subject: `Booking Cancelled - ${listing.title}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #ef4444; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Booking Cancelled</h1>
                    </div>
                    <div class="content">
                        <p>Hi ${guest.firstName || guest.username},</p>
                        <p>Your booking at <strong>${listing.title}</strong> has been cancelled.</p>
                        
                        <div class="booking-details">
                            <h3>Cancelled Booking Details</h3>
                            <p><strong>Property:</strong> ${listing.title}</p>
                            <p><strong>Location:</strong> ${listing.location}, ${listing.country}</p>
                            <p><strong>Booking ID:</strong> #${booking._id.toString().slice(-8).toUpperCase()}</p>
                            ${booking.cancellationReason ? `<p><strong>Reason:</strong> ${booking.cancellationReason}</p>` : ''}
                        </div>

                        <p>If you have any questions about this cancellation, please contact our support team.</p>
                        <p>We hope to see you again soon!</p>
                        <p>Best regards,<br><strong>The Wanderlust Team</strong></p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} Wanderlust. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Cancellation email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending cancellation email:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Send booking modification email to guest
 * @param {Object} booking - Updated booking document
 * @param {Object} guest - Guest user document
 * @param {Object} listing - Listing document
 * @returns {Promise} Email send result
 */
async function sendModificationEmail(booking, guest, listing) {
    const transporter = createTransporter();
    
    const checkInDate = new Date(booking.checkIn).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const checkOutDate = new Date(booking.checkOut).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const mailOptions = {
        from: `"Wanderlust" <${process.env.SMTP_USER}>`,
        to: guest.email,
        subject: `Booking Modified - ${listing.title}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #3b82f6; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
                    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
                    .button { display: inline-block; padding: 12px 30px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>✅ Booking Modified Successfully</h1>
                    </div>
                    <div class="content">
                        <p>Hi ${guest.firstName || guest.username},</p>
                        <p>Your booking at <strong>${listing.title}</strong> has been updated with the new details below.</p>
                        
                        <div class="booking-details">
                            <h3>Updated Booking Details</h3>
                            <div class="detail-row">
                                <span><strong>Check-in:</strong></span>
                                <span>${checkInDate}</span>
                            </div>
                            <div class="detail-row">
                                <span><strong>Check-out:</strong></span>
                                <span>${checkOutDate}</span>
                            </div>
                            <div class="detail-row">
                                <span><strong>Guests:</strong></span>
                                <span>${booking.guests.adults} adult${booking.guests.adults > 1 ? 's' : ''}${booking.guests.children > 0 ? `, ${booking.guests.children} child${booking.guests.children > 1 ? 'ren' : ''}` : ''}</span>
                            </div>
                            <div class="detail-row">
                                <span><strong>Total Amount:</strong></span>
                                <span><strong>₹${booking.pricing.total}</strong></span>
                            </div>
                        </div>

                        <center>
                            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:8080'}/bookings/${booking._id}" class="button">View Updated Booking</a>
                        </center>

                        <p>Looking forward to hosting you!</p>
                        <p>Best regards,<br><strong>The Wanderlust Team</strong></p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} Wanderlust. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Modification email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending modification email:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Send notification to host about new booking
 * @param {Object} booking - Booking document
 * @param {Object} host - Host user document
 * @param {Object} listing - Listing document
 * @param {Object} guest - Guest user document
 * @returns {Promise} Email send result
 */
async function sendHostBookingNotification(booking, host, listing, guest) {
    const transporter = createTransporter();

    const mailOptions = {
        from: `"Wanderlust" <${process.env.SMTP_USER}>`,
        to: host.email,
        subject: `New Booking Request - ${listing.title}`,
        html: `
            <!DOCTYPE html>
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #667eea;">New Booking ${booking.status === 'confirmed' ? 'Confirmed' : 'Request'}</h2>
                    <p>Hi ${host.firstName || host.username},</p>
                    <p>You have a new booking ${booking.status === 'confirmed' ? 'confirmation' : 'request'} for <strong>${listing.title}</strong>.</p>
                    
                    <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3>Guest Information</h3>
                        <p><strong>Name:</strong> ${guest.firstName || guest.username} ${guest.lastName || ''}</p>
                        <p><strong>Email:</strong> ${guest.email}</p>
                        <p><strong>Check-in:</strong> ${new Date(booking.checkIn).toLocaleDateString()}</p>
                        <p><strong>Check-out:</strong> ${new Date(booking.checkOut).toLocaleDateString()}</p>
                        <p><strong>Guests:</strong> ${booking.guests.adults} adults${booking.guests.children > 0 ? `, ${booking.guests.children} children` : ''}</p>
                        <p><strong>Earnings:</strong> ₹${booking.pricing.total}</p>
                    </div>

                    <p><a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:8080'}/bookings/${booking._id}" style="display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px;">View Booking</a></p>
                    
                    <p>Best regards,<br><strong>The Wanderlust Team</strong></p>
                </div>
            </body>
            </html>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Host notification email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending host notification:', error);
        return { success: false, error: error.message };
    }
}

module.exports = {
    sendBookingConfirmation,
    sendCancellationEmail,
    sendModificationEmail,
    sendHostBookingNotification
};

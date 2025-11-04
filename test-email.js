require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
    const transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD
        }
    });

    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: process.env.SMTP_USER, // Send to yourself for testing
            subject: 'Wanderlust Email Test',
            html: '<h1>Email is working! ✅</h1><p>Your Wanderlust email notifications are configured correctly.</p>'
        });
        
        console.log('✅ Test email sent successfully!');
        console.log('Message ID:', info.messageId);
    } catch (error) {
        console.error('❌ Email test failed:', error);
    }
}

testEmail();

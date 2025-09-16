const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail', // or use 'host' and 'port' for custom SMTP
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // your app password
  }
});

// Optional: verify connection
transporter.verify((error, success) => {
  if (error) {
    console.error('Email transport setup failed:', error);
  } else {
    console.log('Email transport is ready to send messages.');
  }
});

module.exports = transporter;

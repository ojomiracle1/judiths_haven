const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

transporter.sendMail({
  from: `"Test" <${process.env.EMAIL_FROM}>`,
  to: process.env.EMAIL_FROM,
  subject: "Test Email",
  text: "This is a test email from Node.js"
}, (err, info) => {
  if (err) {
    return console.error('Error:', err);
  }
  console.log('Email sent:', info.response);
});

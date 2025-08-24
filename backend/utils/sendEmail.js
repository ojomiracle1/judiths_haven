const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Comment out debug logs for production safety

  // Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT), // Ensure port is a number
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    ...(process.env.NODE_ENV !== 'production' ? {
      tls: {
        // Allow self-signed certs only in development
        rejectUnauthorized: false
      }
    } : {})
  });

  // Define email options
  const mailOptions = {
    from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
    to: options.to || options.email, // support both 'to' and 'email'
    subject: options.subject,
    html: options.html
  };

  // Send email
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Email could not be sent');
  }
};

module.exports = sendEmail;
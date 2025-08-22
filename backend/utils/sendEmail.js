const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Comment out debug logs for production safety
  // console.log('Attempting to send email...');
  // console.log('Email Host:', process.env.EMAIL_HOST);
  // console.log('Email Port:', process.env.EMAIL_PORT);
  // console.log('Email User:', process.env.EMAIL_USER);
  // console.log('Email Secure:', process.env.EMAIL_SECURE);
  // console.log('Email From Name:', process.env.EMAIL_FROM_NAME);

  // Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT), // Ensure port is a number
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      // Do not reject self-signed certificates. DANGER: Do NOT use in production!
      rejectUnauthorized: false
    }
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
    // console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Email could not be sent');
  }
};

module.exports = sendEmail;
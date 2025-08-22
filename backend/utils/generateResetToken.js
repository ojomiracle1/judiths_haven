const crypto = require('crypto');

const generateResetToken = () => {
  try {
    // Generate a cryptographically secure token
    const token = crypto.randomBytes(32).toString('hex');

    // Hash token for database storage
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Set expire time (30 minutes from now)
    const resetPasswordExpire = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    // Comment out debug log for production safety
    // console.log('Token generation details:', {
    //   token,
    //   expires,
    //   userId: user._id,
    // });

    return {
      token, // This is the raw token that will be sent in the email link
      hashedToken, // This is the hashed version that will be stored in the DB
      resetPasswordExpire
    };
  } catch (error) {
    console.error('Error generating reset token:', error);
    throw new Error('Failed to generate reset token');
  }
};

module.exports = generateResetToken;
const getPasswordResetEmailTemplate = (userName, resetUrl) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
      <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
      <p>Hello ${userName},</p>
      <p>You are receiving this email because you (or someone else) has requested to reset the password for your account.</p>
      <p>Please click on the following link to reset your password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
      </div>
      <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
      <p style="color: #666; font-size: 14px;">This link will expire in 30 minutes.</p>
      <hr style="border: 1px solid #eee; margin: 20px 0;">
      <p style="color: #666; font-size: 12px;">If you're having trouble clicking the button, copy and paste this URL into your web browser:</p>
      <p style="color: #666; font-size: 12px; word-break: break-all;">${resetUrl}</p>
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
        <p>This is an automated message, please do not reply to this email.</p>
      </div>
    </div>
  `;
};

module.exports = {
  getPasswordResetEmailTemplate
}; 
const User = require('../models/User');
const bcrypt = require('bcryptjs');

describe('User model', () => {
  it('should be defined', () => {
    expect(User).toBeDefined();
  });

  it('should match password correctly', async () => {
    const plainPassword = 'TestPassword123!';
    const user = new User({
      name: 'Test',
      email: 'test@example.com',
      password: plainPassword,
      isAdmin: false
    });
    // Simulate pre-save hook
    await user.save();
    const isMatch = await user.matchPassword(plainPassword);
    expect(isMatch).toBe(true);
    const isNotMatch = await user.matchPassword('WrongPassword');
    expect(isNotMatch).toBe(false);
  });
}); 
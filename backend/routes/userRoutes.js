const express = require('express');
const router = express.Router();
const User = require('../models/userModel'); // Use unified user model
const { protect, admin } = require('../middleware/authMiddleware');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const generateResetToken = require('../utils/generateResetToken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const { getPasswordResetEmailTemplate } = require('../utils/emailTemplates');
const { passwordResetLimiter } = require('../middleware/rateLimiter');
const { Joi, celebrate, Segments, errors } = require('celebrate');
const asyncHandler = require('express-async-handler');

// Import enhanced validation middleware
const {
  validateUserRegistration,
  validateUserLogin,
  handleValidationErrors
} = require('../middleware/security');

const { bulkDeleteUsers, bulkUpdateUsers, exportUsers } = require('../controllers/userController');

// Export users (admin only) - MUST BE BEFORE /:id routes
router.get('/export', protect, admin, exportUsers);

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
router.post('/login', validateUserLogin, handleValidationErrors, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and explicitly select password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate token and send response
    const token = generateToken(user._id);
    
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      role: user.isAdmin ? 'admin' : 'user',
      profileImage: user.profileImage,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
router.post('/register', validateUserRegistration, handleValidationErrors, asyncHandler(async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      isAdmin: email === 'ojomiracle20@gmail.com' ? true : false
    });

    if (user) {
      const token = generateToken(user._id);
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        role: user.isAdmin ? 'admin' : 'user',
        profileImage: user.profileImage,
        token
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}));

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        role: user.isAdmin ? 'admin' : 'user',
        profileImage: user.profileImage,
        address: user.address,
        phone: user.phone,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        role: updatedUser.isAdmin ? 'admin' : 'user',
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Update user profile image
// @route   PUT /api/users/profile-image
// @access  Private
router.put('/profile-image', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const { imageUrl } = req.body;
    if (!imageUrl) {
      return res.status(400).json({ message: 'Image URL is required' });
    }
    user.profileImage = imageUrl;
    await user.save();
    res.json({ message: 'Profile image updated', profileImage: user.profileImage });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin create user - must be before /:id routes and before GET /
router.post('/', protect, admin, async (req, res) => {
  try {
    const { name, email, password, isAdmin } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const user = await User.create({ name, email, password, isAdmin: !!isAdmin });
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      await user.deleteOne();
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
router.get('/:id', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.isAdmin = req.body.isAdmin;

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        role: updatedUser.isAdmin ? 'admin' : 'user',
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Forgot password
// @route   POST /api/users/forgot-password
// @access  Public
router.post('/forgot-password', passwordResetLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find user and explicitly select reset token fields
    const user = await User.findOne({ email }).select('+resetPasswordToken +resetPasswordExpire');
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email address' });
    }

    // Generate reset token
    const { token: resetToken, hashedToken, resetPasswordExpire } = generateResetToken();

    // Update user with reset token
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = resetPasswordExpire;
    user.markModified('resetPasswordToken');
    user.markModified('resetPasswordExpire');
    await user.save();

    // Verify the save by finding the user again with explicit field selection
    const updatedUser = await User.findById(user._id).select('+resetPasswordToken +resetPasswordExpire');

    if (!updatedUser || updatedUser.resetPasswordToken !== hashedToken) {
      console.error('Token save failed:', {
        updatedUser: updatedUser ? 'exists' : 'null',
        tokenMatch: updatedUser ? updatedUser.resetPasswordToken === hashedToken : false
      });
      return res.status(500).json({ message: 'Error saving reset token' });
    }

    // Construct reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Send email
    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Request',
        html: getPasswordResetEmailTemplate(user.name, resetUrl)
      });

      res.json({ message: 'Password reset link sent to your email' });
    } catch (error) {
      console.error('Error sending reset email:', error);
      // Don't clear the token on email failure
      throw new Error('Email could not be sent');
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Reset password
// @route   POST /api/users/reset-password
// @access  Public
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    // Hash the provided token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Get current time for debugging
    const currentTime = new Date();

    // Find user by hashed token and check expiration with explicit field selection
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: currentTime }
    }).select('+resetPasswordToken +resetPasswordExpire');

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Validate new password
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    // Update password and clear reset fields
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Error resetting password', error: error.message });
  }
});

// @desc    Ban or unban a user
// @route   PATCH /api/users/:id/ban
// @access  Admin
router.patch('/:id/ban', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.isBanned = !user.isBanned;
    await user.save();
    res.json({ message: user.isBanned ? 'User banned' : 'User unbanned' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @desc    Admin reset user password
// @route   PATCH /api/users/:id/reset-password
// @access  Admin
router.patch('/:id/reset-password', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Bulk operations (admin only)
router.post('/bulk-delete', protect, admin, bulkDeleteUsers);
router.put('/bulk-update', protect, admin, bulkUpdateUsers);

// Add celebrate error handler after all routes
router.use(errors());

module.exports = router;
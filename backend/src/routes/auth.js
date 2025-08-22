const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../../models/userModel'); // Corrected path for src folder
const { protect } = require('../middleware/auth');
const passport = require('../middleware/passport');
const cookieParser = require('cookie-parser');

// --- Token helpers ---
function generateAccessToken(user) {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
}
function generateRefreshToken(user) {
  return jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

// Register user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password
    });

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isAdmin: user.role === 'admin',
      profileImage: user.profileImage,
      accessToken
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    console.log('Login request body:', req.body);
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    console.log('User found:', !!user);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    console.log('Password match:', isMatch);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Force admin for ojomiracle20@gmail.com
    let isAdmin = user.role === 'admin';
    let role = user.role;
    if (user.email === 'ojomiracle20@gmail.com') {
      isAdmin = true;
      role = 'admin';
      user.isAdmin = true;
      user.role = 'admin';
      await user.save();
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role,
      isAdmin,
      profileImage: user.profileImage,
      accessToken
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Refresh token endpoint
router.post('/refresh', async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: 'No refresh token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'User not found' });
    const accessToken = generateAccessToken(user);
    res.json({ accessToken });
  } catch (err) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
});

// Get user profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user profile
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.password) {
      user.password = req.body.password;
    }
    if (req.body.address) {
      user.address = req.body.address;
    }
    if (req.body.phone) {
      user.phone = req.body.phone;
    }

    // Force admin for ojomiracle20@gmail.com
    let isAdmin = user.role === 'admin';
    let role = user.role;
    if (user.email === 'ojomiracle20@gmail.com') {
      isAdmin = true;
      role = 'admin';
      user.isAdmin = true;
      user.role = 'admin';
    }
    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role,
      isAdmin,
      address: updatedUser.address,
      phone: updatedUser.phone
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Google OAuth login
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback
router.get('/google/callback', passport.authenticate('google', {
  failureRedirect: '/login',
  session: true,
}), async (req, res) => {
  // Force admin for ojomiracle20@gmail.com
  let isAdmin = req.user.role === 'admin';
  let role = req.user.role;
  if (req.user.email === 'ojomiracle20@gmail.com') {
    isAdmin = true;
    role = 'admin';
    req.user.isAdmin = true;
    req.user.role = 'admin';
    await req.user.save();
  }

  // Generate JWT for the authenticated user
  const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });

  // Set token in HTTP-only cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  });

  // Instead of redirecting, send a script that posts a message to the opener window
  const frontendUrl = process.env.NODE_ENV === 'production' ? 'https://judiths-haven-frontend.onrender.com' : process.env.FRONTEND_URL || 'http://localhost:3000';
  res.send(`
    <script>
      if (window.opener) {
        window.opener.postMessage({
          type: 'google-auth-success',
          payload: {
            success: true,
            message: 'Google OAuth login successful',
            token: '${token}',
            user: {
              _id: '${req.user._id}',
              name: '${req.user.name}',
              email: '${req.user.email}',
              role: '${role}',
              isAdmin: ${isAdmin}
            }
          }
        }, '${frontendUrl}');
        window.close();
      } else {
        document.body.innerText = 'Login successful. You can close this window.';
      }
    </script>
  `);
});

module.exports = router;
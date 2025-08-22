const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel'); // Use unified user model

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error('Auth token error:', error.message);
      res.status(401).json({ message: 'Not authorized, token failed' });
      return; // Ensure no further execution
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
    return; // Ensure no further execution
  }
});

const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' }); // Changed to 403 Forbidden
    return; // Ensure no further execution
  }
};

module.exports = { protect, admin };
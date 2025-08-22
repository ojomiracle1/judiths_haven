const jwt = require('jsonwebtoken');
const User = require('../../models/userModel'); // Corrected path for src folder

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Debug: Log user info for admin check
const admin = (req, res, next) => {
  console.log('Admin middleware user:', req.user);
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as an admin', user: req.user });
  }
};

module.exports = { protect, admin };
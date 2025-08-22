const rateLimit = require('express-rate-limit');

// General API limiter
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // 100 in prod, 1000 in dev
  message: 'Too many requests from this IP, please try again after 1 minute (limit: 100 requests)'
});

// Stricter limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: process.env.NODE_ENV === 'production' ? 10 : 100, // 10 in prod, 100 in dev
  message: 'Too many requests from this IP, please try again after an hour (limit: 10 requests)'
});

// Order limiter (for order and analytics endpoints)
const orderLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === 'production' ? 20 : 200, // 20 in prod, 200 in dev
  message: 'Too many order requests from this IP, please try again after 1 minute (limit: 20 requests)'
});

// Password reset limiter
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: process.env.NODE_ENV === 'production' ? 5 : 15, // 5 in prod, 15 in dev
  message: 'Too many password reset attempts, please try again after an hour'
});

module.exports = {
  apiLimiter,
  authLimiter,
  orderLimiter,
  passwordResetLimiter
};
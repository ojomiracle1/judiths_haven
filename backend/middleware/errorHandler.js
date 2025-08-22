const logger = require('../utils/logger');

// Custom error class for API errors
class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error(`Error: ${err.message}`);
  logger.error(`Stack: ${err.stack}`);
  logger.error(`URL: ${req.originalUrl}`);
  logger.error(`Method: ${req.method}`);
  logger.error(`IP: ${req.ip}`);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new ApiError(404, message);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new ApiError(400, message);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new ApiError(400, message);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = new ApiError(401, message);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = new ApiError(401, message);
  }

  // Syntax error (malformed JSON)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    const message = 'Invalid JSON';
    error = new ApiError(400, message);
  }

  // File upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File too large';
    error = new ApiError(400, message);
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Unexpected file field';
    error = new ApiError(400, message);
  }

  // Rate limiting errors
  if (err.status === 429) {
    const message = 'Too many requests';
    error = new ApiError(429, message);
  }

  // Default error
  if (!error.statusCode) {
    error.statusCode = 500;
    error.message = 'Internal Server Error';
  }

  // Send error response
  res.status(error.statusCode).json({
    success: false,
    error: {
      message: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    }
  });
};

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// 404 handler
const notFound = (req, res, next) => {
  const error = new ApiError(404, `Not found - ${req.originalUrl}`);
  next(error);
};

module.exports = {
  ApiError,
  errorHandler,
  asyncHandler,
  notFound
}; 
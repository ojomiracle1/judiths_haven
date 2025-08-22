const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const morgan = require('morgan');
const winston = require('winston');
const session = require('express-session');
const passport = require('./middleware/passport');
const path = require('path');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// CORS middleware must be first and only called once
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'https://judiths-haven-frontend.onrender.com' : 'http://localhost:3000', // Frontend URL
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Winston logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/app.log' })
  ],
});

// Morgan HTTP request logging
app.use(morgan('dev', {
  stream: {
    write: (message) => logger.info(message.trim()),
  },
}));

// Session and Passport middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mama-miracle-boutique', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
// .then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

// Serve uploads directory for profile/product images
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/users', require('./routes/users'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/newsletter', require('./routes/newsletter'));
app.use('/api/device-token', require('./routes/deviceToken'));
app.use('/api/recommendations', require('./routes/recommendations'));
app.use('/api/recentlyViewed', require('./routes/recentlyViewed'));
app.use('/api/admin/analytics', require('./routes/adminAnalytics'));

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  // console.log(`Server is running on port ${PORT}`);
});
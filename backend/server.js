require('dotenv').config({
  path: process.env.NODE_ENV === 'test' ? __dirname + '/.env.test' : __dirname + '/.env'
});





const express = require('express');
const helmet = require('helmet');
const hpp = require('hpp');
const csurf = require('csurf');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./src/routes/auth');
const passport = require('./src/middleware/passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const http = require('http');
const socketio = require('socket.io');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');

// Import security middleware
const {
  authLimiter,
  apiLimiter,
  orderLimiter,
  securityHeaders,
  mongoSanitization,
  sanitizeInput
} = require('./middleware/security');

// Import error handling and logging
const { errorHandler, notFound } = require('./middleware/errorHandler');
const logger = require('./utils/logger');

// Import routes
const productRoutes = require('./src/routes/products');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const contactRoutes = require('./routes/contactRoutes');
const newsletterRoutes = require('./src/routes/newsletter');
const deviceTokenRoutes = require('./routes/deviceTokenRoutes');
const cartRoutes = require('./routes/cartRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const salesStatsRoutes = require('./routes/salesStatsRoutes');
const orderAggregationRoutes = require('./routes/orderAggregationRoutes');
const couponRoutes = require('./routes/couponRoutes');
const shippingRoutes = require('./routes/shippingRoutes');
const auditLogRoutes = require('./routes/auditLogRoutes');
const adminAnalyticsRoutes = require('./src/routes/adminAnalytics');
const recommendationsRoutes = require('./src/routes/recommendations');
const recentlyViewedRoutes = require('./src/routes/recentlyViewed');


const app = express();
app.set('trust proxy', 1);

// Disable x-powered-by header for security
app.disable('x-powered-by');


// Use Helmet for secure HTTP headers
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production'
    ? {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", 'https://judiths-haven-frontend.onrender.com', 'https://apis.google.com'],
          styleSrc: ["'self'", 'https://fonts.googleapis.com', 'https://judiths-haven-frontend.onrender.com', "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com', 'https://judiths-haven-frontend.onrender.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          connectSrc: ["'self'", 'https://judiths-haven-frontend.onrender.com', 'https://judiths-haven-backend.onrender.com', 'wss://judiths-haven-backend.onrender.com'],
          objectSrc: ["'none'"],
          frameSrc: ["'self'", 'https://accounts.google.com'],
          upgradeInsecureRequests: [],
        },
      }
    : false // Allow relaxed CSP in dev
}));


// Prevent HTTP Parameter Pollution
app.use(hpp());

// CSRF Protection (enabled for non-API, non-GET/HEAD/OPTIONS requests)
if (process.env.NODE_ENV === 'production') {
  app.use(
    csurf({
      cookie: {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
      },
      ignoreMethods: ['GET', 'HEAD', 'OPTIONS'],
    })
  );
  // Expose CSRF token for frontend (if needed)
  app.use((req, res, next) => {
    if (req.csrfToken) {
      res.cookie('XSRF-TOKEN', req.csrfToken(), {
        httpOnly: false,
        secure: true,
        sameSite: 'strict',
      });
    }
    next();
  });
}

const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? 'https://judiths-haven-frontend.onrender.com' : process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

io.on('connection', (socket) => {
  // logger.info(`New client connected: ${socket.id}`); // Uncomment for production logging if needed
  socket.on('joinOrderRoom', (orderId) => {
    socket.join(orderId);
  });
  socket.on('disconnect', () => {
  // logger.info(`Client disconnected: ${socket.id}`); // Uncomment for production logging if needed
  });
});

app.set('io', io);

// Enhanced Security Middleware (Order matters!)
app.use(securityHeaders); // Custom security headers
app.use(mongoSanitization); // MongoDB injection protection
app.use(sanitizeInput); // Input sanitization
app.use(mongoSanitize());

// CORS configuration using cors package
// More robust CORS configuration
const allowedOrigins = [
  'https://judiths-haven-frontend.onrender.com',
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    // Allow if origin matches any allowedOrigins or regex from env
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // Support regex from env (CORS_ORIGIN_REGEX)
    if (process.env.CORS_ORIGIN_REGEX) {
      try {
        const regex = new RegExp(process.env.CORS_ORIGIN_REGEX);
        if (regex.test(origin)) {
          return callback(null, true);
        }
      } catch (e) {
        // Invalid regex, ignore
      }
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
};
app.use(cors(corsOptions));

// Logging middleware
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.http(message.trim())
  },
  skip: function () {
    // In production, skip logging health checks to reduce noise
    return process.env.NODE_ENV === 'production';
  }
}));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Connect to MongoDB
connectDB();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!require('fs').existsSync(uploadsDir)) {
  require('fs').mkdirSync(uploadsDir, { recursive: true });
}

// Session middleware for passport (use MongoDB store in production)
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  },
  store: process.env.NODE_ENV === 'production'
    ? MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        collectionName: 'sessions',
        ttl: 24 * 60 * 60 // 1 day
      })
    : undefined
}));
app.use(passport.initialize());
app.use(passport.session());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Judith\'s Haven Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Apply rate limiting to specific endpoints
app.use('/api/users/login', authLimiter);
app.use('/api/users/register', authLimiter);
app.use('/api/users/forgot-password', authLimiter);
app.use('/api/orders', orderLimiter);
// Removed general API rate limiting to prevent 429 errors on export and analytics

// Routes
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/device-token', deviceTokenRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/products/:productId/reviews', reviewRoutes);
app.use('/api/sales-stats', salesStatsRoutes);
app.use('/api/orders/aggregate', orderAggregationRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/admin/analytics', adminAnalyticsRoutes);

// Register recommendations and recently viewed routes
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/recentlyViewed', recentlyViewedRoutes);

// Serve static files from the uploads directory with cache headers
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, path) => {
    if (path.match(/\.(jpg|jpeg|png|webp)$/i)) {
      res.setHeader('Cache-Control', 'public, max-age=2592000'); // 30 days
    }
  }
}));

// 404 handler - must be before error handler
app.use(notFound);



// Error handling middleware - must be last
app.use((err, req, res, next) => {
  // CSRF error handler
  if (err.code === 'EBADCSRFTOKEN') {
    logger.warn('Invalid CSRF token');
    return res.status(403).json({ message: 'Invalid CSRF token' });
  }
  // Hide stack traces in production
  if (process.env.NODE_ENV === 'production') {
    logger.error(err.message);
    return res.status(err.status || 500).json({
      message: err.message || 'Internal Server Error'
    });
  }
  // In development, show stack
  return errorHandler(err, req, res, next);
});


// HTTPS enforcement middleware for production (should be before routes)
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] && req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect('https://' + req.headers.host + req.url);
    }
    next();
  });
}


// Warn if critical environment variables are missing
if (!process.env.SESSION_SECRET || !process.env.MONGODB_URI) {
  logger.warn('SESSION_SECRET or MONGODB_URI is not set. Please check your environment variables.');
}

if (process.env.NODE_ENV !== 'test') {
  server.listen(process.env.PORT || 5000, () => {
    logger.info(`Server running on port ${process.env.PORT || 5000}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

module.exports = app;
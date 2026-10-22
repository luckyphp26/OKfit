'use strict';

const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');

// Load environment variables before anything else
dotenv.config();

// Database connection
const connectDB = require('./config/db');

// Route imports
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const scanRoutes = require('./routes/scan');
const foodlogRoutes = require('./routes/foodlog');
const chatRoutes = require('./routes/chat');

// Middleware imports
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

// Initialize MongoDB connection
connectDB();

// Initialize Express application
const app = express();

// Security HTTP headers (allowing cross-origin resource access for uploaded images)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

// Cross-Origin Resource Sharing
const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Postman) or matching origin
      if (!origin || origin === allowedOrigin || allowedOrigin === '*') {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in dev to avoid CORS blocking
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// HTTP request logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply general API rate limiter
app.use('/api', apiLimiter);

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'OKFit Backend API',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// Mount modular API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/scan', scanRoutes);
app.use('/api/foodlog', foodlogRoutes);
app.use('/api/chat', chatRoutes);

// 404 Route Not Found handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `API route not found: ${req.method} ${req.originalUrl}`
  });
});

// Centralized error handling middleware
app.use(errorHandler);

// Define port and start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(
    `[OKFit Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
  );
  console.log(`[OKFit Server] Health check available at http://localhost:${PORT}/api/health`);
});

// Handle unhandled Promise rejections safely
process.on('unhandledRejection', (err) => {
  console.error(`[Fatal Error] Unhandled Rejection: ${err.message}`);
  if (process.env.NODE_ENV === 'production') {
    server.close(() => process.exit(1));
  }
});

module.exports = app;

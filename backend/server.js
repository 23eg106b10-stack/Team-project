const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config({ path: './.env' });

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:4200', 'null', 'file://'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/services', require('./routes/services'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/admin', require('./routes/admin'));

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to SRIDA Event Management Platform API',
    version: '1.0.0',
    documentation: 'Use /api/* endpoints for API access',
    endpoints: {
      auth: '/api/auth',
      services: '/api/services',
      bookings: '/api/bookings',
      messages: '/api/messages',
      wishlist: '/api/wishlist',
      admin: '/api/admin',
      health: '/api/health'
    }
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'SRIDA Backend is running' });
});

// 404 handler
app.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
app.use((error, req, res, next) => {
  let errorMessage = 'Something went wrong';
  let statusCode = 500;

  if (error.name === 'ValidationError') {
    errorMessage = Object.values(error.errors).map(val => val.message);
    statusCode = 400;
  }

  if (error.code === 11000) {
    errorMessage = 'Duplicate field value entered';
    statusCode = 400;
  }

  console.error(error);

  res.status(statusCode).json({
    success: false,
    message: errorMessage,
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app;

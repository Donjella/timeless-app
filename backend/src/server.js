const express = require('express');
const cors = require('cors');
const helmet = require('helmet'); // Import helmet
require('dotenv').config();

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');

// Import routes
const userRoutes = require('./routes/userRoutes');
const watchRoutes = require('./routes/watchRoutes');
const brandRoutes = require('./routes/brandRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const addressRoutes = require('./routes/addressRoutes');
const rentalRoutes = require('./routes/rentalRoutes');

// Make an instance of an express server
const app = express();

// Add security headers with Helmet
app.use(helmet());

// Add middleware to parse JSON request bodies
app.use(express.json());

// Configure CORS dynamically from environment variables
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173'];

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
};

app.use(cors(corsOptions));

// Mount API routes
app.use('/api/users', userRoutes);
app.use('/api/watches', watchRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/rentals', rentalRoutes);

// Base route
app.get('/', (req, res) => {
  res.json({
    message: 'Hello There. Welcome to Timeless',
  });
});

// Error handler middleware (should be after all routes)
app.use(errorHandler);

// Server startup is handled in index.js
module.exports = { app };

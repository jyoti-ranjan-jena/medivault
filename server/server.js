require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes'); // Import routes

// Initialize App
const app = express();

// Connect to Database
connectDB();

// --- 1. Security & Connection Middleware (FIRST) ---
app.use(helmet()); // Secure headers first
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true // Allow cookies
}));

// --- 2. Body Parsing Middleware (CRITICAL) ---
app.use(express.json()); // Allows parsing JSON body
app.use(express.urlencoded({ extended: true })); // Allows parsing URL-encoded data
app.use(cookieParser());
app.use(morgan('dev')); // Logger

// Debugging middleware - log incoming request headers and bodies in non-prod
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      console.log('--- DEBUG REQ START ---');
      console.log('Method:', req.method, 'Path:', req.originalUrl);
      console.log('Content-Type:', req.headers['content-type']);
      console.log('Headers:', req.headers);
      console.log('Body:', req.body);
      console.log('--- DEBUG REQ END ---');
    }
    next();
  });
}

// --- 3. Routes (LAST) ---
app.use('/api/auth', authRoutes); // Routes utilize the parsers above

// Test Route
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: "Welcome to MediVault HMS API", 
    status: "Running",
    timestamp: new Date()
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
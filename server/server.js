require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');

// Initialize App
const app = express();

// Connect to Database
connectDB();

// Middleware (The "Bodyguards")
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Parse cookies
app.use(helmet()); // Security headers
app.use(morgan('dev')); // Logger

// CORS Configuration (Allow only our Frontend)
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true // Allow cookies to be sent
}));

// Routes
app.use('/api/auth', authRoutes);

// Test Route (To check if server is alive)
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: "Welcome to MediVault HMS API", 
    status: "Running",
    timestamp: new Date()
  });
});

// 404 Handler (For unknown routes)
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect routes (Authentication)
const protect = async (req, res, next) => {
  let token;

  // Check if header contains "Bearer <token>"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header (split "Bearer" from the token string)
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token (exclude password) and attach to request
      req.user = await User.findById(decoded.id).select('-password');

      next(); // Move to the next middleware/controller
    } catch (error) {
      console.error(error);
      res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

// Middleware to restrict access by Role (Authorization)
const authorize = (...roles) => {
  return (req, res, next) => {
    // We already have req.user from the 'protect' middleware above
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not found' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `User role '${req.user.role}' is not authorized to access this route` 
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
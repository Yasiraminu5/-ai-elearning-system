const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ─────────────────────────────────────────────────────────────
// @desc    Protect routes - verifies JWT token
// @usage   Add as middleware to any private route
// ─────────────────────────────────────────────────────────────
const protect = async (req, res, next) => {
  let token;

  // Check if Authorization header exists and starts with 'Bearer'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Extract token from "Bearer <token>"
    token = req.headers.authorization.split(' ')[1];
  }

  // If no token found, block the request
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.',
    });
  }

  try {
    // Verify the token using our secret key
    // If tampered with or expired, jwt.verify() will throw an error
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the user document to the request object
    // This makes req.user available in every protected controller
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists.',
      });
    }

    next(); // Pass control to the next middleware or controller
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please log in again.',
    });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Restrict access to specific roles
// @usage   Add after protect middleware on admin-only routes
// @example router.get('/admin', protect, authorize('admin'), controller)
// ─────────────────────────────────────────────────────────────
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This route requires one of these roles: ${roles.join(', ')}`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
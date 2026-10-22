const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes: verifies JWT bearer token and attaches user to request
 */
const protect = async (req, res, next) => {
  let token;

  // Check for Authorization header starting with Bearer
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route: No token provided'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'okfit-default-jwt-secret-replace-in-production'
    );

    // Find user by ID in token payload
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route: User does not exist'
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route: Token is invalid or expired'
    });
  }
};

module.exports = { protect };

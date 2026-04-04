const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('./AppError');

const protect = async (req, res, next) => {
  let token;

  // 1. Check Authorization header (Bearer token)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  // 2. Check cookies (HTTP-only cookie)
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(new AppError('Not authorized to access this route', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return next(new AppError('User not found', 401));
    }

    if (req.user.status !== 'active') {
      return next(new AppError('Your account is inactive. Please contact an administrator.', 403));
    }

    next();
  } catch (error) {
    return next(new AppError('Not authorized to access this route', 401));
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};

module.exports = { protect, restrictTo };

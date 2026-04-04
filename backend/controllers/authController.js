const User = require('../models/User');
const { sendToken } = require('../utils/sendToken');
const AppError = require('../middleware/AppError');
const { validationResult } = require('express-validator');

exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('User with this email already exists', 400);
    }

    const isValidRole = ['admin', 'analyst', 'viewer'].includes(role);
    const allowRoleSelection = process.env.NODE_ENV !== 'production';

    // In local/dev environments, allow explicit role creation for testing.
    // In production, force public registration to viewer.
    const selectedRole = allowRoleSelection && isValidRole ? role : 'viewer';

    const user = await User.create({
      name,
      email,
      password,
      role: selectedRole,
    });

    sendToken(user, 201, res);
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('Please provide email and password', 400);
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new AppError('Incorrect email or password', 401);
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      throw new AppError('Incorrect email or password', 401);
    }

    sendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    res
      .clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      })
      .status(200)
      .json({
        success: true,
        message: 'Logged out successfully',
      });
  } catch (error) {
    next(error);
  }
};

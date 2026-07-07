const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { validationResult } = require('express-validator');

// ─────────────────────────────────────────────────────────────
// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
// ─────────────────────────────────────────────────────────────
const register = async (req, res) => {
  // Check for validation errors from express-validator
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  const { fullName, email, password, role } = req.body;

  try {
    // Check if a user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    // Create the new user
    // Note: password hashing happens automatically in the User model
    const user = await User.create({
      fullName,
      email,
      password,
      role: role || 'student',
    });

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        interests: user.interests,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
    });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Login an existing user
// @route   POST /api/auth/login
// @access  Public
// ─────────────────────────────────────────────────────────────
const login = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  const { email, password } = req.body;

  try {
    // Find user by email and explicitly include password field
    // (password has select:false in schema so we must add it back)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Compare entered password with stored hash
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        interests: user.interests,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
    });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Get currently logged-in user profile
// @route   GET /api/auth/me
// @access  Private (requires JWT)
// ─────────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    // req.user is attached by the auth middleware
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        interests: user.interests,
        profilePicture: user.profilePicture,
        enrolledCourses: user.enrolledCourses,
        completedCourses: user.completedCourses,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('GetMe error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error fetching profile',
    });
  }
};

module.exports = { register, login, getMe };
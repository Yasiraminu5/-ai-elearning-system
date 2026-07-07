const express = require('express');
const { check } = require('express-validator');
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// ─────────────────────────────────────────────────────────────
// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
// ─────────────────────────────────────────────────────────────
router.post(
  '/register',
  [
    check('fullName', 'Full name is required')
      .notEmpty()
      .trim(),
    check('fullName', 'Full name must be at least 3 characters')
      .isLength({ min: 3 }),
    check('email', 'Please provide a valid email')
      .isEmail()
      .normalizeEmail(),
    check('password', 'Password must be at least 6 characters')
      .isLength({ min: 6 }),
    check('role', 'Role must be either student or admin')
      .optional()
      .isIn(['student', 'admin']),
  ],
  register
);

// ─────────────────────────────────────────────────────────────
// @route   POST /api/auth/login
// @desc    Login an existing user
// @access  Public
// ─────────────────────────────────────────────────────────────
router.post(
  '/login',
  [
    check('email', 'Please provide a valid email')
      .isEmail()
      .normalizeEmail(),
    check('password', 'Password is required')
      .notEmpty(),
  ],
  login
);

// ─────────────────────────────────────────────────────────────
// @route   GET /api/auth/me
// @desc    Get currently logged-in user
// @access  Private
// ─────────────────────────────────────────────────────────────
router.get('/me', protect, getMe);

module.exports = router;
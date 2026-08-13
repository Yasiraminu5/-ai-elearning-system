const express = require('express');
const { check } = require('express-validator');
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', [
  check('fullName', 'Full name is required').notEmpty().trim(),
  check('fullName', 'Full name must be at least 3 characters').isLength({ min: 3 }),
  check('email', 'Please provide a valid email').isEmail().normalizeEmail(),
  check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
  check('role').optional().isIn(['student', 'admin']),
], register);

router.post('/login', [
  check('email', 'Please provide a valid email').isEmail().normalizeEmail(),
  check('password', 'Password is required').notEmpty(),
], login);

router.get('/me', protect, getMe);

module.exports = router;

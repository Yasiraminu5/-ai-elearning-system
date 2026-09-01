const express = require('express');
const { check } = require('express-validator');
const { register, login, getMe } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');

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

router.put('/profile', protect, async (req, res) => {
  try {
    const { fullName, interests } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (fullName)              user.fullName  = fullName;
    if (interests !== undefined) user.interests = interests;
    await user.save();
    res.status(200).json({
      success: true,
      user: {
        _id: user._id, fullName: user.fullName, email: user.email,
        role: user.role, interests: user.interests,
        profilePicture: user.profilePicture, createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error('Profile update error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/students', protect, authorize('admin'), async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, students });
  } catch (err) {
    console.error('Get students error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;

const express = require('express');
const {
  getRecommendations,
  refreshRecommendations,
} = require('../controllers/recommendationController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/',         protect, authorize('student'), getRecommendations);
router.post('/refresh', protect, authorize('student'), refreshRecommendations);

module.exports = router;

const { generateRecommendations } = require('../services/recommendationEngine');
const Recommendation = require('../models/Recommendation');

// ─────────────────────────────────────────────────────────────
// @desc    Get recommendations for logged-in student
// @route   GET /api/recommendations
// @access  Student only
// ─────────────────────────────────────────────────────────────
const getRecommendations = async (req, res) => {
  try {
    // Always regenerate fresh recommendations
    const recommendation = await generateRecommendations(req.user._id);

    // Populate course and quiz details
    const populated = await Recommendation.findById(recommendation._id)
      .populate('recommendedCourses.courseId', 'title description category difficultyLevel')
      .populate('recommendedQuizzes.quizId', 'title passMark difficultyLevel')
      .populate('learningPath.courseId', 'title category difficultyLevel');

    res.status(200).json({ success: true, recommendation: populated });
  } catch (err) {
    console.error('getRecommendations error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to generate recommendations' });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Trigger recommendation refresh (after quiz submit)
// @route   POST /api/recommendations/refresh
// @access  Student only
// ─────────────────────────────────────────────────────────────
const refreshRecommendations = async (req, res) => {
  try {
    await generateRecommendations(req.user._id);
    res.status(200).json({ success: true, message: 'Recommendations refreshed' });
  } catch (err) {
    console.error('refreshRecommendations error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to refresh recommendations' });
  }
};

module.exports = { getRecommendations, refreshRecommendations };

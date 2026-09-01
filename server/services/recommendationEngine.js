const Course         = require('../models/Course');
const Quiz           = require('../models/Quiz');
const QuizResult     = require('../models/QuizResult');
const Enrollment     = require('../models/Enrollment');
const Recommendation = require('../models/Recommendation');
const User           = require('../models/User');

const generateRecommendations = async (studentId) => {
  try {
    const [enrollments, quizResults] = await Promise.all([
      Enrollment.find({ studentId }).populate('courseId'),
      QuizResult.find({ studentId })
        .populate({ path: 'quizId', populate: { path: 'courseId' } }),
    ]);

    const allCourses = await Course.find({ isPublished: true });

    const enrolledCourseIds = enrollments
      .map(e => e.courseId?._id?.toString())
      .filter(Boolean);

    const unenrolledCourses = allCourses.filter(
      c => !enrolledCourseIds.includes(c._id.toString())
    );

    const weakCategories = [
      ...new Set(
        quizResults
          .filter(r => !r.passed)
          .map(r => r.quizId?.courseId?.category)
          .filter(Boolean)
      ),
    ];

    const strongCategories = [
      ...new Set(
        quizResults
          .filter(r => r.passed && r.score >= 80)
          .map(r => r.quizId?.courseId?.category)
          .filter(Boolean)
      ),
    ];

    const student   = await User.findById(studentId);
    const interests = student?.interests || [];

    const recommendedCourses = [];
    const recommendedQuizzes = [];
    const learningPath       = [];

    // ── RULE 1: Interest Match ────────────────────────────────
    if (interests.length > 0) {
      unenrolledCourses
        .filter(c => interests.some(i =>
          c.category.toLowerCase().includes(i.toLowerCase())
        ))
        .slice(0, 3)
        .forEach(course => {
          if (!recommendedCourses.find(r => r.courseId.toString() === course._id.toString())) {
            recommendedCourses.push({
              courseId: course._id,
              reason:   `Matches your interest in ${course.category}`,
              priority: 5,
            });
          }
        });
    }

    // ── RULE 2: Remedial ──────────────────────────────────────
    if (weakCategories.length > 0) {
      unenrolledCourses
        .filter(c => weakCategories.includes(c.category) && c.difficultyLevel === 'beginner')
        .slice(0, 2)
        .forEach(course => {
          if (!recommendedCourses.find(r => r.courseId.toString() === course._id.toString())) {
            recommendedCourses.push({
              courseId: course._id,
              reason:   `Strengthen your ${course.category} foundation`,
              priority: 6,
            });
          }
        });
    }

    // ── RULE 3: Progression ───────────────────────────────────
    if (strongCategories.length > 0) {
      unenrolledCourses
        .filter(c =>
          strongCategories.includes(c.category) &&
          ['intermediate', 'advanced'].includes(c.difficultyLevel)
        )
        .slice(0, 2)
        .forEach(course => {
          if (!recommendedCourses.find(r => r.courseId.toString() === course._id.toString())) {
            recommendedCourses.push({
              courseId: course._id,
              reason:   `You excel in ${course.category} — level up`,
              priority: 5,
            });
          }
        });
    }

    // ── RULE 4: Quiz Readiness ────────────────────────────────
    const attemptedQuizIds = quizResults.map(r => r.quizId?._id?.toString());
    for (const enrollment of enrollments) {
      if (enrollment.progressPercent >= 50) {
        const courseQuizzes = await Quiz.find({ courseId: enrollment.courseId?._id });
        courseQuizzes.forEach(quiz => {
          if (!attemptedQuizIds.includes(quiz._id.toString())) {
            recommendedQuizzes.push({
              quizId: quiz._id,
              reason: `Ready to test your knowledge in ${enrollment.courseId?.title}`,
            });
          }
        });
      }
    }

    // ── RULE 5: Fallback — always fill remaining slots ────────
    // Recommend any unenrolled course not already recommended
    // until we have at least 3 recommendations
    if (unenrolledCourses.length > 0) {
      const fallbackPriority = { beginner: 3, intermediate: 2, advanced: 1 };
      unenrolledCourses
        .filter(c => !recommendedCourses.find(r => r.courseId.toString() === c._id.toString()))
        .sort((a, b) => (fallbackPriority[a.difficultyLevel] || 0) - (fallbackPriority[b.difficultyLevel] || 0))
        .slice(0, Math.max(0, 3 - recommendedCourses.length))
        .forEach(course => {
          recommendedCourses.push({
            courseId: course._id,
            reason:   `Recommended course in ${course.category}`,
            priority: 1,
          });
        });
    }

    // ── Build Learning Path ───────────────────────────────────
    enrollments
      .filter(e => e.status === 'active')
      .forEach((e, index) => {
        learningPath.push({
          courseId: e.courseId?._id,
          order:    index + 1,
          status:   'in-progress',
        });
      });

    recommendedCourses
      .sort((a, b) => b.priority - a.priority)
      .forEach((r, index) => {
        learningPath.push({
          courseId: r.courseId,
          order:    enrollments.length + index + 1,
          status:   'pending',
        });
      });

    const recommendation = await Recommendation.findOneAndUpdate(
      { studentId },
      { studentId, recommendedCourses, recommendedQuizzes, learningPath, lastUpdated: new Date() },
      { upsert: true, new: true }
    );

    return recommendation;
  } catch (err) {
    console.error('Recommendation engine error:', err.message);
    throw err;
  }
};

module.exports = { generateRecommendations };

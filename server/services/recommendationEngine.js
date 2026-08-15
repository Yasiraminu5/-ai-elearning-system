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

    const avgScore = quizResults.length
      ? quizResults.reduce((sum, r) => sum + r.score, 0) / quizResults.length
      : null;

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

    const student  = await User.findById(studentId);
    const interests = student?.interests || [];

    const recommendedCourses = [];
    const recommendedQuizzes = [];
    const learningPath       = [];

    // RULE 1: Interest Match
    if (interests.length > 0) {
      const interestMatches = unenrolledCourses.filter(c =>
        interests.some(interest =>
          c.category.toLowerCase().includes(interest.toLowerCase())
        )
      );
      interestMatches.slice(0, 3).forEach(course => {
        if (!recommendedCourses.find(r => r.courseId.toString() === course._id.toString())) {
          recommendedCourses.push({
            courseId: course._id,
            reason:   `Matches your interest in ${course.category}`,
            priority: 3,
          });
        }
      });
    }

    // RULE 2: Remedial
    if (weakCategories.length > 0) {
      const remedialCourses = unenrolledCourses.filter(c =>
        weakCategories.includes(c.category) && c.difficultyLevel === 'beginner'
      );
      remedialCourses.slice(0, 2).forEach(course => {
        if (!recommendedCourses.find(r => r.courseId.toString() === course._id.toString())) {
          recommendedCourses.push({
            courseId: course._id,
            reason:   `Recommended to strengthen your ${course.category} foundation`,
            priority: 5,
          });
        }
      });
    }

    // RULE 3: Progression
    if (strongCategories.length > 0) {
      const progressionCourses = unenrolledCourses.filter(c =>
        strongCategories.includes(c.category) &&
        ['intermediate', 'advanced'].includes(c.difficultyLevel)
      );
      progressionCourses.slice(0, 2).forEach(course => {
        if (!recommendedCourses.find(r => r.courseId.toString() === course._id.toString())) {
          recommendedCourses.push({
            courseId: course._id,
            reason:   `You are excelling in ${course.category} — take the next step`,
            priority: 4,
          });
        }
      });
    }

    // RULE 4: Quiz Readiness
    const attemptedQuizIds = quizResults.map(r => r.quizId?._id?.toString());
    for (const enrollment of enrollments) {
      if (enrollment.progressPercent >= 50) {
        const courseQuizzes = await Quiz.find({ courseId: enrollment.courseId?._id });
        courseQuizzes.forEach(quiz => {
          if (!attemptedQuizIds.includes(quiz._id.toString())) {
            recommendedQuizzes.push({
              quizId: quiz._id,
              reason: `You are ready to test your knowledge in ${enrollment.courseId?.title}`,
            });
          }
        });
      }
    }

    // RULE 5: Beginner Default
    if (enrollments.length === 0 && quizResults.length === 0) {
      const beginnerCourses = unenrolledCourses
        .filter(c => c.difficultyLevel === 'beginner')
        .slice(0, 3);
      beginnerCourses.forEach(course => {
        if (!recommendedCourses.find(r => r.courseId.toString() === course._id.toString())) {
          recommendedCourses.push({
            courseId: course._id,
            reason:   'Great starting point for new learners',
            priority: 2,
          });
        }
      });
    }

    // Build learning path
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

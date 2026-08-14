const mongoose = require('mongoose');

const RecommendationSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    recommendedCourses: [
      {
        courseId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Course',
        },
        reason: {
          type: String,
        },
        priority: {
          type: Number,
          default: 0,
        },
      },
    ],
    recommendedQuizzes: [
      {
        quizId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Quiz',
        },
        reason: {
          type: String,
        },
      },
    ],
    learningPath: [
      {
        courseId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Course',
        },
        order: Number,
        status: {
          type: String,
          enum: ['pending', 'in-progress', 'completed'],
          default: 'pending',
        },
      },
    ],
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Recommendation', RecommendationSchema);

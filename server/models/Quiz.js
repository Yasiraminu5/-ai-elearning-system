const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
  },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: (v) => v.length >= 2,
      message: 'A question must have at least 2 options',
    },
  },
  correctAnswer: {
    type: Number,
    required: true,
  },
});

const QuizSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Quiz title is required'],
      trim: true,
    },
    questions: {
      type: [QuestionSchema],
      validate: {
        validator: (v) => v.length >= 1,
        message: 'Quiz must have at least one question',
      },
    },
    passMark: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },
    difficultyLevel: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    timeLimit: {
      type: Number,
      default: 30,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Quiz', QuizSchema);

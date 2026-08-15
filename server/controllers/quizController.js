const Quiz = require('../models/Quiz');
const QuizResult = require('../models/QuizResult');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

// ─────────────────────────────────────────────────────────────
// @desc    Create a quiz for a course
// @route   POST /api/quizzes
// @access  Admin only
// ─────────────────────────────────────────────────────────────
const createQuiz = async (req, res) => {
  try {
    const { courseId, title, questions, passMark, difficultyLevel, timeLimit } = req.body;

    if (!courseId || !title || !questions || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'courseId, title, and at least one question are required',
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const quiz = await Quiz.create({
      courseId,
      title,
      questions,
      passMark:        passMark        || 50,
      difficultyLevel: difficultyLevel || 'medium',
      timeLimit:       timeLimit       || 30,
    });

    res.status(201).json({ success: true, quiz });
  } catch (err) {
    console.error('createQuiz error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Get all quizzes (admin) or quizzes for enrolled courses
// @route   GET /api/quizzes
// @access  Private
// ─────────────────────────────────────────────────────────────
const getQuizzes = async (req, res) => {
  try {
    let quizzes;
    if (req.user.role === 'admin') {
      quizzes = await Quiz.find().populate('courseId', 'title category');
    } else {
      const enrollments = await Enrollment.find({ studentId: req.user._id });
      const courseIds = enrollments.map(e => e.courseId);
      quizzes = await Quiz.find({ courseId: { $in: courseIds } })
        .populate('courseId', 'title category');
    }
    res.status(200).json({ success: true, quizzes });
  } catch (err) {
    console.error('getQuizzes error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Get a single quiz
// @route   GET /api/quizzes/:id
// @access  Private
// ─────────────────────────────────────────────────────────────
const getQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('courseId', 'title category');

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    // Hide correct answers from students
    if (req.user.role === 'student') {
      const safeQuiz = {
        _id:             quiz._id,
        title:           quiz.title,
        courseId:        quiz.courseId,
        passMark:        quiz.passMark,
        difficultyLevel: quiz.difficultyLevel,
        timeLimit:       quiz.timeLimit,
        questions: quiz.questions.map(q => ({
          _id:          q._id,
          questionText: q.questionText,
          options:      q.options,
        })),
      };
      return res.status(200).json({ success: true, quiz: safeQuiz });
    }

    res.status(200).json({ success: true, quiz });
  } catch (err) {
    console.error('getQuiz error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Get quizzes for a specific course
// @route   GET /api/quizzes/course/:courseId
// @access  Private
// ─────────────────────────────────────────────────────────────
const getCourseQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ courseId: req.params.courseId });
    res.status(200).json({ success: true, quizzes });
  } catch (err) {
    console.error('getCourseQuizzes error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Update a quiz
// @route   PUT /api/quizzes/:id
// @access  Admin only
// ─────────────────────────────────────────────────────────────
const updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    const { title, questions, passMark, difficultyLevel, timeLimit } = req.body;

    if (title)           quiz.title           = title;
    if (questions)       quiz.questions       = questions;
    if (passMark)        quiz.passMark        = passMark;
    if (difficultyLevel) quiz.difficultyLevel = difficultyLevel;
    if (timeLimit)       quiz.timeLimit       = timeLimit;

    await quiz.save();
    res.status(200).json({ success: true, quiz });
  } catch (err) {
    console.error('updateQuiz error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Delete a quiz
// @route   DELETE /api/quizzes/:id
// @access  Admin only
// ─────────────────────────────────────────────────────────────
const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }
    await Quiz.findByIdAndDelete(req.params.id);
    await QuizResult.deleteMany({ quizId: req.params.id });
    res.status(200).json({ success: true, message: 'Quiz deleted' });
  } catch (err) {
    console.error('deleteQuiz error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Submit quiz answers and get score
// @route   POST /api/quizzes/:id/submit
// @access  Student only
// ─────────────────────────────────────────────────────────────
const submitQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    const { answers, timeTaken } = req.body;

    if (!answers || answers.length === 0) {
      return res.status(400).json({ success: false, message: 'Answers are required' });
    }

    // Grade the quiz
    let correct = 0;
    const gradedAnswers = quiz.questions.map((question, index) => {
      const selected  = answers[index] !== undefined ? answers[index] : -1;
      const isCorrect = selected === question.correctAnswer;
      if (isCorrect) correct++;
      return {
        questionIndex:  index,
        selectedAnswer: selected,
        isCorrect,
      };
    });

    const score  = Math.round((correct / quiz.questions.length) * 100);
    const passed = score >= quiz.passMark;

    // Save result
    const result = await QuizResult.create({
      studentId: req.user._id,
      quizId:    quiz._id,
      courseId:  quiz.courseId,
      score,
      passed,
      answers:   gradedAnswers,
      timeTaken: timeTaken || 0,
    });

    res.status(201).json({
      success: true,
      result: {
        score,
        passed,
        correct,
        total:   quiz.questions.length,
        passMark: quiz.passMark,
        answers: gradedAnswers,
      },
    });
  } catch (err) {
    console.error('submitQuiz error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Get student quiz results
// @route   GET /api/quizzes/results/me
// @access  Student only
// ─────────────────────────────────────────────────────────────
const getMyResults = async (req, res) => {
  try {
    const results = await QuizResult.find({ studentId: req.user._id })
      .populate('quizId', 'title passMark')
      .populate('courseId', 'title category')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, results });
  } catch (err) {
    console.error('getMyResults error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Get all results (admin)
// @route   GET /api/quizzes/results/all
// @access  Admin only
// ─────────────────────────────────────────────────────────────
const getAllResults = async (req, res) => {
  try {
    const results = await QuizResult.find()
      .populate('studentId', 'fullName email')
      .populate('quizId', 'title passMark')
      .populate('courseId', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, results });
  } catch (err) {
    console.error('getAllResults error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  createQuiz, getQuizzes, getQuiz, getCourseQuizzes,
  updateQuiz, deleteQuiz, submitQuiz, getMyResults, getAllResults,
};

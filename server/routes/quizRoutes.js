const express = require('express');
const {
  createQuiz, getQuizzes, getQuiz, getCourseQuizzes,
  updateQuiz, deleteQuiz, submitQuiz, getMyResults, getAllResults,
} = require('../controllers/quizController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/results/me',       protect, authorize('student'), getMyResults);
router.get('/results/all',      protect, authorize('admin'),   getAllResults);
router.get('/course/:courseId', protect, getCourseQuizzes);
router.get('/',                 protect, getQuizzes);
router.post('/',                protect, authorize('admin'),   createQuiz);
router.get('/:id',              protect, getQuiz);
router.put('/:id',              protect, authorize('admin'),   updateQuiz);
router.delete('/:id',           protect, authorize('admin'),   deleteQuiz);
router.post('/:id/submit',      protect, authorize('student'), submitQuiz);

module.exports = router;

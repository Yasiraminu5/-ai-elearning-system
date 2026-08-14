const express = require('express');
const {
  createCourse, getCourses, getCourse,
  updateCourse, deleteCourse, enrollCourse, getEnrolledCourses,
} = require('../controllers/courseController');
const {
  createLesson, getLessons, updateLesson,
  deleteLesson, completeLesson,
} = require('../controllers/lessonController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// ── Course routes ─────────────────────────────────────────────
router.get('/enrolled', protect, authorize('student'), getEnrolledCourses);
router.get('/',         protect, getCourses);
router.post('/',        protect, authorize('admin'), createCourse);
router.get('/:id',      protect, getCourse);
router.put('/:id',      protect, authorize('admin'), updateCourse);
router.delete('/:id',   protect, authorize('admin'), deleteCourse);
router.post('/:id/enroll', protect, authorize('student'), enrollCourse);

// ── Lesson routes ─────────────────────────────────────────────
router.get('/:courseId/lessons',  protect, getLessons);
router.post('/:courseId/lessons', protect, authorize('admin'), createLesson);
router.put('/lessons/:id',        protect, authorize('admin'), updateLesson);
router.delete('/lessons/:id',     protect, authorize('admin'), deleteLesson);
router.post('/lessons/:id/complete', protect, authorize('student'), completeLesson);

module.exports = router;

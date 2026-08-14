const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

// ─────────────────────────────────────────────────────────────
// @desc    Add a lesson to a course
// @route   POST /api/courses/:courseId/lessons
// @access  Admin only
// ─────────────────────────────────────────────────────────────
const createLesson = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const { title, content, videoUrl, order, duration } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    const lesson = await Lesson.create({
      courseId: req.params.courseId,
      title,
      content,
      videoUrl: videoUrl || '',
      order: order || 1,
      duration: duration || 0,
    });

    res.status(201).json({ success: true, lesson });
  } catch (err) {
    console.error('createLesson error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Get all lessons for a course
// @route   GET /api/courses/:courseId/lessons
// @access  Private
// ─────────────────────────────────────────────────────────────
const getLessons = async (req, res) => {
  try {
    const lessons = await Lesson.find({ courseId: req.params.courseId }).sort({ order: 1 });
    res.status(200).json({ success: true, lessons });
  } catch (err) {
    console.error('getLessons error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Update a lesson
// @route   PUT /api/lessons/:id
// @access  Admin only
// ─────────────────────────────────────────────────────────────
const updateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    const { title, content, videoUrl, order, duration } = req.body;

    if (title)    lesson.title    = title;
    if (content)  lesson.content  = content;
    if (videoUrl) lesson.videoUrl = videoUrl;
    if (order)    lesson.order    = order;
    if (duration) lesson.duration = duration;

    await lesson.save();
    res.status(200).json({ success: true, lesson });
  } catch (err) {
    console.error('updateLesson error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Delete a lesson
// @route   DELETE /api/lessons/:id
// @access  Admin only
// ─────────────────────────────────────────────────────────────
const deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    await Lesson.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Lesson deleted successfully' });
  } catch (err) {
    console.error('deleteLesson error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Mark a lesson as complete for a student
// @route   POST /api/lessons/:id/complete
// @access  Student only
// ─────────────────────────────────────────────────────────────
const completeLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    const enrollment = await Enrollment.findOne({
      studentId: req.user._id,
      courseId: lesson.courseId,
    });

    if (!enrollment) {
      return res.status(400).json({ success: false, message: 'Not enrolled in this course' });
    }

    if (!enrollment.completedLessons.includes(req.params.id)) {
      enrollment.completedLessons.push(req.params.id);
    }

    const totalLessons = await Lesson.countDocuments({ courseId: lesson.courseId });
    enrollment.progressPercent = Math.round(
      (enrollment.completedLessons.length / totalLessons) * 100
    );

    if (enrollment.progressPercent === 100) {
      enrollment.status = 'completed';
      enrollment.completedAt = new Date();
    }

    await enrollment.save();

    res.status(200).json({
      success: true,
      message: 'Lesson marked as complete',
      progressPercent: enrollment.progressPercent,
    });
  } catch (err) {
    console.error('completeLesson error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { createLesson, getLessons, updateLesson, deleteLesson, completeLesson };

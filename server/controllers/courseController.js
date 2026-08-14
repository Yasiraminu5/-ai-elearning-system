const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Enrollment = require('../models/Enrollment');

// ─────────────────────────────────────────────────────────────
// @desc    Create a new course
// @route   POST /api/courses
// @access  Admin only
// ─────────────────────────────────────────────────────────────
const createCourse = async (req, res) => {
  try {
    const { title, description, category, difficultyLevel } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and category are required',
      });
    }

    const course = await Course.create({
      title,
      description,
      category,
      difficultyLevel: difficultyLevel || 'beginner',
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, course });
  } catch (err) {
    console.error('createCourse error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Get all published courses (students) or all (admin)
// @route   GET /api/courses
// @access  Private
// ─────────────────────────────────────────────────────────────
const getCourses = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { isPublished: true };
    const courses = await Course.find(filter)
      .populate('createdBy', 'fullName email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: courses.length, courses });
  } catch (err) {
    console.error('getCourses error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Get a single course with its lessons
// @route   GET /api/courses/:id
// @access  Private
// ─────────────────────────────────────────────────────────────
const getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('createdBy', 'fullName email');

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const lessons = await Lesson.find({ courseId: req.params.id }).sort({ order: 1 });

    res.status(200).json({ success: true, course, lessons });
  } catch (err) {
    console.error('getCourse error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Admin only
// ─────────────────────────────────────────────────────────────
const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const { title, description, category, difficultyLevel, isPublished } = req.body;

    if (title)           course.title           = title;
    if (description)     course.description     = description;
    if (category)        course.category        = category;
    if (difficultyLevel) course.difficultyLevel = difficultyLevel;
    if (isPublished !== undefined) course.isPublished = isPublished;

    await course.save();

    res.status(200).json({ success: true, course });
  } catch (err) {
    console.error('updateCourse error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Delete a course and its lessons
// @route   DELETE /api/courses/:id
// @access  Admin only
// ─────────────────────────────────────────────────────────────
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    await Lesson.deleteMany({ courseId: req.params.id });
    await Enrollment.deleteMany({ courseId: req.params.id });
    await Course.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Course deleted successfully' });
  } catch (err) {
    console.error('deleteCourse error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Enroll student in a course
// @route   POST /api/courses/:id/enroll
// @access  Student only
// ─────────────────────────────────────────────────────────────
const enrollCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (!course.isPublished) {
      return res.status(400).json({ success: false, message: 'Course is not available for enrollment' });
    }

    const existing = await Enrollment.findOne({
      studentId: req.user._id,
      courseId: req.params.id,
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Already enrolled in this course' });
    }

    const enrollment = await Enrollment.create({
      studentId: req.user._id,
      courseId: req.params.id,
    });

    await Course.findByIdAndUpdate(req.params.id, {
      $inc: { enrollmentCount: 1 },
    });

    res.status(201).json({ success: true, message: 'Enrolled successfully', enrollment });
  } catch (err) {
    console.error('enrollCourse error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────
// @desc    Get student enrollments
// @route   GET /api/courses/enrolled
// @access  Student only
// ─────────────────────────────────────────────────────────────
const getEnrolledCourses = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ studentId: req.user._id })
      .populate('courseId')
      .sort({ enrolledAt: -1 });

    res.status(200).json({ success: true, enrollments });
  } catch (err) {
    console.error('getEnrolledCourses error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  createCourse,
  getCourses,
  getCourse,
  updateCourse,
  deleteCourse,
  enrollCourse,
  getEnrolledCourses,
};

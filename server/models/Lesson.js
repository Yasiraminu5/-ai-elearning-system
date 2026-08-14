const mongoose = require('mongoose');

const LessonSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Lesson title is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Lesson content is required'],
    },
    videoUrl: {
      type: String,
      default: '',
    },
    order: {
      type: Number,
      required: true,
      default: 1,
    },
    duration: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lesson', LessonSchema);

const Discussion = require('../models/Discussion');
const Course     = require('../models/Course');

const getDiscussions = async (req, res) => {
  try {
    const discussions = await Discussion.find({ courseId: req.params.courseId })
      .populate('userId', 'fullName role')
      .populate('replies.userId', 'fullName role')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, discussions });
  } catch (err) {
    console.error('getDiscussions error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const createDiscussion = async (req, res) => {
  try {
    const { title, message } = req.body;
    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required' });
    }
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    const discussion = await Discussion.create({
      courseId: req.params.courseId,
      userId:   req.user._id,
      title,
      message,
    });
    const populated = await Discussion.findById(discussion._id)
      .populate('userId', 'fullName role');
    res.status(201).json({ success: true, discussion: populated });
  } catch (err) {
    console.error('createDiscussion error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const addReply = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).json({ success: false, message: 'Discussion not found' });
    }
    discussion.replies.push({ userId: req.user._id, message });
    await discussion.save();
    const populated = await Discussion.findById(discussion._id)
      .populate('userId', 'fullName role')
      .populate('replies.userId', 'fullName role');
    res.status(201).json({ success: true, discussion: populated });
  } catch (err) {
    console.error('addReply error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const deleteDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).json({ success: false, message: 'Discussion not found' });
    }
    const isOwner = discussion.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await Discussion.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Discussion deleted' });
  } catch (err) {
    console.error('deleteDiscussion error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getDiscussions, createDiscussion, addReply, deleteDiscussion };

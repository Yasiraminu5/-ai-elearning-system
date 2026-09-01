const express = require('express');
const {
  getDiscussions, createDiscussion, addReply, deleteDiscussion,
} = require('../controllers/discussionController');
const { protect } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

router.get('/',           protect, getDiscussions);
router.post('/',          protect, createDiscussion);
router.post('/:id/reply', protect, addReply);
router.delete('/:id',     protect, deleteDiscussion);

module.exports = router;

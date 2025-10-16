const express = require('express');
const {
  sendMessage,
  getInbox,
  getSentMessages,
  getMessage,
  getConversation,
  getUnreadCount
} = require('../controllers/messageController');

const router = express.Router();
const { protect } = require('../middleware/auth');

// All routes are protected
router.get('/inbox', protect, getInbox);
router.get('/sent', protect, getSentMessages);
router.get('/conversation/:userId', protect, getConversation);
router.get('/unread/count', protect, getUnreadCount);
router.get('/:id', protect, getMessage);

router.post('/', protect, sendMessage);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getMessages,
  getEventMessages,
  markAsRead,
  getConversationsList,
  getGlobalMessages,
  markMessageAsSeen,
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.post('/', protect, sendMessage);
router.get('/conversations', protect, getConversationsList);
router.get('/global', protect, getGlobalMessages);
router.get('/:chatId', protect, getMessages);
router.get('/event/:eventId', protect, getEventMessages);
router.put('/:id/read', protect, markAsRead);
router.put('/:id/seen', protect, markMessageAsSeen);

module.exports = router;

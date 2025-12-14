const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getChatRooms, getRoomMessages, sendMessage } = require('../controllers/chatController');

router.get('/rooms', protect, getChatRooms);
router.get('/rooms/:roomId/messages', protect, getRoomMessages);
router.post('/rooms/:roomId/messages', protect, sendMessage);

module.exports = router;

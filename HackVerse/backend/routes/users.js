const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  uploadAvatar,
  getMyEvents,
  getMyTeams,
  searchUsers,
  getUserById,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

const upload = require('../middleware/upload');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/upload-avatar', protect, upload.single('image'), uploadAvatar);
router.get('/my-events', protect, getMyEvents);
router.get('/my-teams', protect, getMyTeams);
router.get('/search', protect, searchUsers);
router.get('/:id', protect, getUserById);

// Admin Routes moved to routes/admin.js

module.exports = router;

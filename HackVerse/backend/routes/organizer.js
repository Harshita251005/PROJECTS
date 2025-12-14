const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getMyEvents,
  getEventDetails,
} = require('../controllers/organizerController');

// All routes require authentication and organizer/admin role
router.use(protect);
router.use(authorize('organizer', 'admin'));

// Get all events created by the organizer
router.get('/events', getMyEvents);

// Get single event details
router.get('/events/:eventId', getEventDetails);



module.exports = router;

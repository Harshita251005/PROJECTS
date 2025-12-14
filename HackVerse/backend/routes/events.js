const express = require('express');
const router = express.Router();
const {
  createEvent,
  getAllEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  unregisterFromEvent,
  getEventParticipants,
  sendAnnouncement,
} = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('organizer'), createEvent);
router.get('/', getAllEvents);
router.get('/:id', getEvent);
router.put('/:id', protect, authorize('organizer'), updateEvent);
router.delete('/:id', protect, authorize('organizer'), deleteEvent);

// Registration
router.post('/:id/register', protect, registerForEvent);
router.post('/:id/unregister', protect, unregisterFromEvent);

router.get('/:id/participants', getEventParticipants);
router.post('/:id/announcement', protect, authorize('organizer'), sendAnnouncement);

module.exports = router;


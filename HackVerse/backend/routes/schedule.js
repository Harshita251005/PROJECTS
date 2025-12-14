const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createScheduleItem, getEventSchedule, updateScheduleItem, deleteScheduleItem } = require('../controllers/scheduleController');

// All routes require authentication
router.use(protect);

// Create schedule item for an event
router.post('/event/:eventId', createScheduleItem);

// Get all schedule items for an event
router.get('/event/:eventId', getEventSchedule);

// Update schedule item
router.put('/:id', updateScheduleItem);

// Delete schedule item
router.delete('/:id', deleteScheduleItem);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  createSubmission,
  getEventSubmissions,
  getSubmission,
  getAllSubmissions,
  getUserProgress,
  updateSubmission,
  finalizeSubmission,

  reviewSubmission,
  getLeaderboard
} = require('../controllers/submissionController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .post(protect, createSubmission)
  .get(protect, authorize('admin'), getAllSubmissions);

router.get('/progress', protect, getUserProgress);

router.route('/:id')
  .get(protect, getSubmission)
  .put(protect, updateSubmission);

router.put('/:id/finalize', protect, finalizeSubmission);
router.put('/:id/review', protect, reviewSubmission);

router.get('/event/:eventId/leaderboard', getLeaderboard);
router.get('/event/:eventId', protect, getEventSubmissions);

module.exports = router;

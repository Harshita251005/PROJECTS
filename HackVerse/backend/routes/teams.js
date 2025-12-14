const express = require('express');
const router = express.Router();
const {
  createTeam,
  getTeams,
  getTeam,
  updateTeam,
  deleteTeam,
  joinTeam,
  leaveTeam,
  inviteToTeam,
  respondToInvitation,
  requestToJoinTeam,
  respondToJoinRequest,
  searchTeams,
} = require('../controllers/teamController');
const { protect, requireEmailVerification } = require('../middleware/auth');

router.get('/', getTeams);
router.post('/', protect, requireEmailVerification, createTeam);
router.get('/:id', getTeam);
router.put('/:id', protect, updateTeam);
router.delete('/:id', protect, deleteTeam);
router.post('/:id/join', protect, requireEmailVerification, joinTeam);
router.post('/:id/leave', protect, leaveTeam);
router.post('/:id/invite', protect, inviteToTeam);
router.post('/:id/invitation/respond', protect, respondToInvitation);
router.post('/:id/join-request', protect, requestToJoinTeam);
router.post('/:id/join-request/:requestId/respond', protect, respondToJoinRequest);
router.get('/search', searchTeams);

module.exports = router;

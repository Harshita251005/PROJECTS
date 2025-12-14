const express = require('express');
const router = express.Router();
const {
  getTickets,
  resolveTicket,
  deleteTicket,
} = require('../controllers/supportController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

router.get('/', getTickets);
router.put('/:id/resolve', resolveTicket);
router.delete('/:id', deleteTicket);

module.exports = router;

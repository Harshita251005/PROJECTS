const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getDashboardStats,
  getUsers,
  updateUserRole,
  toggleUserStatus,
  getAuditLogs,
  getSystemHealth,
  getAnnouncements,
  createAnnouncement
} = require('../controllers/adminController');

// Protect all routes
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getDashboardStats);
router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/status', toggleUserStatus);
router.get('/audit-logs', getAuditLogs);
router.get('/system', getSystemHealth);
router.get('/announcements', getAnnouncements);
router.post('/announcements', createAnnouncement);

module.exports = router;

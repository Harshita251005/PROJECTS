const AuditLog = require('../models/AuditLog');


const auditLog = (action, resource) => {
  return async (req, res, next) => {
    // Store original send function
    const originalSend = res.send;
    
    // Override send function
    res.send = function (data) {
      // Log the action after response is sent
      setImmediate(async () => {
        try {
          const userId = req.user?._id || req.user?.id;
          
          if (!userId) {
            return; // Skip audit if no user
          }

          const auditData = {
            user: userId,
            action,
            resource,
            resourceId: req.params.id || req.body._id,
            changes: req.body,
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.headers['user-agent'],
            details: `${req.method} ${req.originalUrl}`,
            severity: determineSeverity(action),
          };

          await AuditLog.create(auditData);
        } catch (error) {
          console.error('Audit logging error:', error);
        }
      });

      // Call original send
      originalSend.call(this, data);
    };

    next();
  };
};

// Determine severity based on action
const determineSeverity = (action) => {
  const criticalActions = ['delete', 'user_ban', 'role_change', 'permission_grant'];
  const warningActions = ['update', 'bulk_action', 'export_data'];
  
  if (criticalActions.includes(action)) {
    return 'critical';
  } else if (warningActions.includes(action)) {
    return 'warning';
  }
  return 'info';
};

// Middleware specifically for tracking critical admin actions
const auditAdminAction = auditLog;

module.exports = {
  auditLog,
  auditAdminAction,
};

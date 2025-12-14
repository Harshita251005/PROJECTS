const mongoose = require('mongoose');

// Action types for different roles
const ACTION_TYPES = {
  // Admin actions
  USER_ROLE_CHANGED: 'user_role_changed',
  USER_STATUS_TOGGLED: 'user_status_toggled',
  SYSTEM_SETTING_CHANGED: 'system_setting_changed',
  
  // Organizer actions
  EVENT_CREATED: 'event_created',
  EVENT_UPDATED: 'event_updated',
  EVENT_DELETED: 'event_deleted',
  JUDGE_ASSIGNED: 'judge_assigned',
  JUDGE_UNASSIGNED: 'judge_unassigned',
  TEAM_ASSIGNED_TO_JUDGE: 'team_assigned_to_judge',
  
  // Judge actions
  SCORE_SUBMITTED: 'score_submitted',
  SCORE_UPDATED: 'score_updated',
  FEEDBACK_ADDED: 'feedback_added',
  
  // General
  LOGIN: 'login',
  LOGOUT: 'logout',
};

const auditLogSchema = new mongoose.Schema({
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  actorRole: {
    type: String,
    enum: ['admin', 'organizer', 'judge', 'participant'],
    required: true
  },
  action: {
    type: String,
    required: true,
    trim: true
  },
  target: {
    type: String, // e.g., 'User', 'Event', 'Score', 'JudgeAssignment'
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId, // Optional, if targeting a specific document
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  },
  details: {
    type: Object, // Flexible object to store changed fields or other metadata
  },
  ipAddress: {
    type: String,
  },
  userAgent: {
    type: String,
  }
}, {
  timestamps: true
});

// Index for efficient querying
auditLogSchema.index({ actor: 1, createdAt: -1 });
auditLogSchema.index({ eventId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

// Static method to create audit log
auditLogSchema.statics.log = async function(data) {
  return this.create({
    actor: data.actor,
    actorRole: data.actorRole,
    action: data.action,
    target: data.target,
    targetId: data.targetId,
    eventId: data.eventId,
    details: data.details,
    ipAddress: data.ipAddress,
    userAgent: data.userAgent
  });
};

// Static method to get judge scoring logs for an event
auditLogSchema.statics.getJudgeScoringLogs = async function(eventId) {
  return this.find({
    eventId,
    action: { $in: [ACTION_TYPES.SCORE_SUBMITTED, ACTION_TYPES.SCORE_UPDATED] }
  })
    .populate('actor', 'name email')
    .sort({ createdAt: -1 });
};

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
AuditLog.ACTION_TYPES = ACTION_TYPES;

module.exports = AuditLog;

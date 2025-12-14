const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: false, // Changed to false for global announcements
  },
  title: {
    type: String,
    required: [true, 'Announcement title is required'],
    trim: true,
  },
  content: {
    type: String,
    required: [true, 'Announcement content is required'],
  },
  type: {
    type: String,
    enum: ['email', 'broadcast', 'both'],
    default: 'broadcast',
  },
  sentBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  recipients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  recipientRoles: [{
    type: String,
    enum: ['participant', 'organizer', 'all'],
  }],
  sentAt: {
    type: Date,
    default: Date.now,
  },
  emailStatus: {
    sent: {
      type: Number,
      default: 0,
    },
    failed: {
      type: Number,
      default: 0,
    },
    errors: [{
      recipient: String,
      error: String,
    }],
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal',
  },
}, {
  timestamps: true,
});

announcementSchema.index({ event: 1, sentAt: -1 });

module.exports = mongoose.model('Announcement', announcementSchema);

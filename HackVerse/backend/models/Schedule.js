const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Schedule title is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  type: {
    type: String,
    enum: ['session', 'workshop', 'talk', 'break', 'ceremony', 'other'],
    default: 'session',
  },
  speaker: {
    name: String,
    bio: String,
    profilePicture: String,
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required'],
  },
  endTime: {
    type: Date,
    required: [true, 'End time is required'],
  },
  location: {
    type: String,
    default: 'Online',
  },
  meetingLink: {
    type: String,
  },
  tags: [{
    type: String,
  }],
}, {
  timestamps: true,
});

// Index for efficient querying
scheduleSchema.index({ event: 1, startTime: 1 });

module.exports = mongoose.model('Schedule', scheduleSchema);

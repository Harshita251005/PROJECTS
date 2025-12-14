const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
  },
  image: {
    type: String,
    default: '',
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  teams: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
  }],
  maxTeamSize: {
    type: Number,
    default: 4,
  },
  registrationDeadline: {
    type: Date,
  },
  venue: {
    type: String,
    default: 'Online',
  },
  prizes: {
    type: String,
  },
  rules: {
    type: String,
  },
  phases: [{
    name: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
  }],
  tracks: [{
    name: { type: String, required: true },
    description: String,
    prizes: String,
  }],
  sponsors: [{
    name: String,
    logo: String,
    website: String,
  }],
  faqs: [{
    question: String,
    answer: String,
  }],

  currentPhase: {
    type: String,
    enum: ['registration', 'team_formation', 'hacking', 'submission', 'completed'],
    default: 'registration',
  },
  emailAnnouncements: [{
    title: String,
    content: String,
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
  }],

  registrationSettings: {
    requireApproval: {
      type: Boolean,
      default: false,
    },
    maxParticipants: Number,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Calculate status dynamically
eventSchema.virtual('status').get(function() {
  const now = new Date();
  if (now < this.startDate) {
    return 'upcoming';
  } else if (now >= this.startDate && now <= this.endDate) {
    return 'ongoing';
  } else {
    return 'completed';
  }
});

module.exports = mongoose.model('Event', eventSchema);

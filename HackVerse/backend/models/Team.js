const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Team name is required'],
    trim: true,
  },
  leader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  maxMembers: {
    type: Number,
    default: 4,
  },
  skills: [{
    type: String,
    trim: true,
  }],
  lookingFor: [{
    type: String,
    trim: true,
  }],
  track: {
    type: String,
  },
  status: {
    type: String,
    enum: ['recruiting', 'full', 'disbanded'],
    default: 'recruiting',
  },
  memberRoles: {
    type: Map,
    of: {
      type: String,
      enum: ['leader', 'member'],
    },
    default: {},
  },
  activityLog: [{
    action: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    details: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
  }],
  invitations: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  joinRequests: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    message: String,
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
}, {
  timestamps: true,
});

// Ensure leader is in members array
teamSchema.pre('save', function(next) {
  if (!this.members.includes(this.leader)) {
    this.members.push(this.leader);
  }
  next();
});

module.exports = mongoose.model('Team', teamSchema);

const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['GLOBAL', 'EVENT', 'TEAM'],
    required: true,
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    // Can be Event ID or Team ID. Null for Global.
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  // For EVENT type: store organizer ID separately for easy access check
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('ChatRoom', chatRoomSchema);

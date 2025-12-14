const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
  submission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Submission',
    required: true,
  },
  judge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  // Legacy individual score fields (for backward compatibility)
  innovation: {
    type: Number,
    min: 0,
    max: 10,
  },
  technical: {
    type: Number,
    min: 0,
    max: 10,
  },
  feasibility: {
    type: Number,
    min: 0,
    max: 10,
  },
  presentation: {
    type: Number,
    min: 0,
    max: 10,
  },
  // New category-based scoring system
  categories: [{
    name: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
 },
    maxScore: {
      type: Number,
      default: 10,
    },
    weight: {
      type: Number,
      default: 1,
    },
  }],
  totalWeightedScore: {
    type: Number,
    default: 0,
  },
  comments: {
    type: String,
    trim: true,
  },
  isBlind: {
    type: Boolean,
    default: false,
  },
  feedback: [{
    category: String,
    comment: String,
  }],
}, {
  timestamps: true,
});

// Ensure a judge can only score a submission once
scoreSchema.index({ submission: 1, judge: 1 }, { unique: true });

module.exports = mongoose.model('Score', scoreSchema);

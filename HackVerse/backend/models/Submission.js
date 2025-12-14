const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true,
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
  },
  repoLink: {
    type: String,
    required: [true, 'Repository link is required'],
  },
  demoLink: {
    type: String,
  },
  videoLink: {
    type: String,
  },
  slidesLink: {
    type: String,
  },
  files: [{
    name: String,
    url: String,
    type: String,
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  track: {
    type: String,
  },
  version: {
    type: Number,
    default: 1,
  },
  versions: [{
    versionNumber: Number,
    title: String,
    description: String,
    repoLink: String,
    demoLink: String,
    videoLink: String,
    slidesLink: String,
    savedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  status: {
    type: String,
    enum: ['draft', 'submitted', 'finalized', 'rejected', 'reviewed', 'locked'],
    default: 'submitted',
  },
  rejectionRemark: {
    type: String,
    trim: true,
  },
  finalizedAt: {
    type: Date,
  },
  embedData: {
    github: {
      readme: String,
      stars: Number,
      lastCommit: Date,
    },
    video: {
      thumbnail: String,
      duration: Number,
    },
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Submission', submissionSchema);

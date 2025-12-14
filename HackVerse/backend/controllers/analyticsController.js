const User = require('../models/User');
const Team = require('../models/Team');
const Event = require('../models/Event');
const Submission = require('../models/Submission');
const Message = require('../models/Message');

exports.getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTeams = await Team.countDocuments();
    const totalEvents = await Event.countDocuments();
    const totalSubmissions = await Submission.countDocuments();
    const totalMessages = await Message.countDocuments();

    // Get recent activity (last 5 users, last 5 teams)
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('name email role createdAt');
    const recentTeams = await Team.find().sort({ createdAt: -1 }).limit(5).populate('leader', 'name').select('name leader createdAt');

    // Get users by role
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalTeams,
        totalEvents,
        totalSubmissions,
        totalMessages,
      },
      recentActivity: {
        users: recentUsers,
        teams: recentTeams,
      },
      usersByRole,
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ success: false, message: 'Error fetching analytics', error: error.message });
  }
};

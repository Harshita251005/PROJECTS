const Event = require('../models/Event');
const User = require('../models/User');
const Team = require('../models/Team');
const AuditLog = require('../models/AuditLog');


exports.getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user._id })
      .populate('teams')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    console.error('getMyEvents error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching events'
    });
  }
};


exports.getEventDetails = async (req, res) => {
  try {
    const event = await Event.findOne({
      _id: req.params.eventId,
      organizer: req.user._id
    })

      .populate('participants', 'name email')
      .populate({
        path: 'teams',
        populate: { path: 'members', select: 'name email' }
      });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or you are not the organizer'
      });
    }

    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('getEventDetails error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching event details'
    });
  }
};



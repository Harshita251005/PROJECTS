const Event = require('../models/Event');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Announcement = require('../models/Announcement');
const { uploadImage } = require('../utils/cloudinary');
const { sendAnnouncementEmail } = require('../utils/emailService');

// @desc    Create event
// @route   POST /api/events
// @access  Private (Organizer only)
exports.createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      image,
      startDate,
      endDate,
      maxTeamSize,
      registrationDeadline,
      venue,
      prizes,
      rules,
      phases,
      tracks,
      sponsors,
      faqs,

    } = req.body;

    let imageUrl = '';
    if (image) {
      const result = await uploadImage(image, 'hackathon-platform/events');
      if (result.success) {
        imageUrl = result.url;
      }
    }
    // Default AI/Tech images if no image uploaded
    const defaultImages = [
      'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1000&auto=format&fit=crop', // AI Brain
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1000&auto=format&fit=crop', // AI Face
      'https://images.unsplash.com/photo-1555255707-c07a66f21ce8?q=80&w=1000&auto=format&fit=crop',     // Coding
      'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1000&auto=format&fit=crop', // Chip
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1000&auto=format&fit=crop', // Matrix
      'https://images.unsplash.com/photo-1531297461136-82086314330d?q=80&w=1000&auto=format&fit=crop', // Motherboard
      'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=1000&auto=format&fit=crop'  // Robot
    ];

    if (!imageUrl) {
      imageUrl = defaultImages[Math.floor(Math.random() * defaultImages.length)];
    }

    const eventData = {
      title,
      description,
      image: imageUrl, 
      startDate,
      endDate,
      organizer: req.user.id,
      maxTeamSize: maxTeamSize || 4,
    };

    const now = new Date();

    // Calculate phase
    if (phases && phases.length > 0) {
      const sortedPhases = [...phases].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
      let activePhase = null;
      for (const phase of sortedPhases) {
        if (now >= new Date(phase.startDate) && now <= new Date(phase.endDate)) {
          activePhase = phase.name;
          break;
        }
      }
      if (!activePhase) {
        if (now < new Date(sortedPhases[0].startDate)) {
          activePhase = 'registration';
        } else if (now > new Date(sortedPhases[sortedPhases.length - 1].endDate)) {
          activePhase = 'completed';
        }
      }
      if (activePhase) {
         eventData.currentPhase = activePhase;
      }
    }

    const event = await Event.create({
      ...eventData,
      registrationDeadline,
      venue,
      prizes,
      rules,
      phases,
      tracks,
      sponsors,
      faqs,

    });

    // Auto-create Event Chat Room
    const ChatRoom = require('../models/ChatRoom');
    await ChatRoom.create({
      name: event.title,
      type: 'EVENT',
      relatedId: event._id,
      organizer: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event,
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating event',
      error: error.message,
    });
  }
};

// @desc    Get all events
// @route   GET /api/events
// @access  Public
exports.getAllEvents = async (req, res) => {
  try {
    const { status, search } = req.query;

    let query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const events = await Event.find(query)
      .populate('organizer', 'name email')
      .sort({ startDate: -1 });

    res.json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching events',
      error: error.message,
    });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email profilePicture')
      .populate('participants', 'name email profilePicture')
      .populate({
        path: 'teams',
        populate: {
          path: 'members leader',
          select: 'name email profilePicture',
        },
      });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    res.json({
      success: true,
      event,
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching event',
      error: error.message,
    });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Organizer only)
exports.updateEvent = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Check if user is organizer or admin
    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this event',
      });
    }
    


    const {
      title,
      description,
      image,
      startDate,
      endDate,
      maxTeamSize,
      faqs,
      registrationDeadline,
      venue,
      prizes,
      rules,
      phases,
      tracks,
      sponsors,
    } = req.body;

    if (image && image !== event.image) {
      const result = await uploadImage(image, 'hackathon-platform/events');
      if (result.success) {
        event.image = result.url;
      }
    }

    if (title) event.title = title;
    if (description) event.description = description;
    if (startDate) event.startDate = startDate;
    if (endDate) event.endDate = endDate;
    if (maxTeamSize) event.maxTeamSize = maxTeamSize;
    // Status is calculated automatically below
    if (registrationDeadline) event.registrationDeadline = registrationDeadline;
    if (venue) event.venue = venue;
    if (prizes) event.prizes = prizes;
    if (rules) event.rules = rules;
    if (phases) event.phases = phases;
    if (tracks) event.tracks = tracks;
    if (sponsors) event.sponsors = sponsors;
    if (faqs) event.faqs = faqs;

    // Recalculate Phase based on (possibly new) dates
    const now = new Date();
    
    // 2. Determine Phase (if phases exist)
    if (event.phases && event.phases.length > 0) {
      const sortedPhases = [...event.phases].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
      let activePhase = null;
      for (const phase of sortedPhases) {
        if (now >= new Date(phase.startDate) && now <= new Date(phase.endDate)) {
          activePhase = phase.name;
          break;
        }
      }
      if (!activePhase) {
        if (now < new Date(sortedPhases[0].startDate)) {
          activePhase = 'registration';
        } else if (now > new Date(sortedPhases[sortedPhases.length - 1].endDate)) {
          activePhase = 'completed';
        }
      }
      if (activePhase) {
         event.currentPhase = activePhase;
      }
    }


    await event.save();

    // Notify all participants about update
    if (event.participants.length > 0) {
      const notifications = event.participants.map(participantId => ({
        user: participantId,
        type: 'event_update',
        title: 'Event Updated',
        message: `The event "${event.title}" has been updated`,
        relatedId: event._id,
        relatedModel: 'Event',
      }));
      await Notification.insertMany(notifications);
    }

    res.json({
      success: true,
      message: 'Event updated successfully',
      event,
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating event',
      error: error.message,
    });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Admin only)
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    await event.deleteOne();

    res.json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting event',
      error: error.message,
    });
  }
};

// @desc    Register for event
// @route   POST /api/events/:id/register
// @access  Private
exports.registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Check if user is admin or organizer
    if (['admin', 'organizer'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Admins and organizers cannot register for events',
      });
    }

    // Check if already registered
    if (event.participants.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'Already registered for this event',
      });
    }

    // Add user to participants
    event.participants.push(req.user.id);
    await event.save();

    // Add event to user's participated events
    await User.findByIdAndUpdate(req.user.id, {
      $push: { participatedEvents: event._id },
    });

    // Create notification
    await Notification.create({
      user: req.user.id,
      type: 'registration',
      title: 'Registration Successful',
      message: `You have successfully registered for ${event.title}`,
      relatedId: event._id,
      relatedModel: 'Event',
    });

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    if (io) {
      io.to(`event_${event._id}`).emit('eventUpdated', {
        eventId: event._id,
        type: 'registration',
      });
    }

    res.json({
      success: true,
      message: 'Registered for event successfully',
    });
  } catch (error) {
    console.error('Register event error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering for event',
      error: error.message,
    });
  }
};

// @desc    Unregister from event
// @route   POST /api/events/:id/unregister
// @access  Private
exports.unregisterFromEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Check if registered
    if (!event.participants.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'Not registered for this event',
      });
    }

    // Remove user from participants
    event.participants = event.participants.filter(
      participant => participant.toString() !== req.user.id
    );
    await event.save();

    // Remove event from user's participated events
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { participatedEvents: event._id },
    });

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    if (io) {
      io.to(`event_${event._id}`).emit('eventUpdated', {
        eventId: event._id,
        type: 'unregistration',
      });
    }

    res.json({
      success: true,
      message: 'Unregistered from event successfully',
    });
  } catch (error) {
    console.error('Unregister event error:', error);
    res.status(500).json({
      success: false,
      message: 'Error unregistering from event',
      error: error.message,
    });
  }
};

// @desc    Get event participants
// @route   GET /api/events/:id/participants
// @access  Public
exports.getEventParticipants = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      'participants',
      'name email profilePicture'
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    res.json({
      success: true,
      participants: event.participants,
    });
  } catch (error) {
    console.error('Get participants error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching participants',
      error: error.message,
    });
  }
};

// @desc    Send announcement to event participants
// @route   POST /api/events/:id/announcement
// @access  Private (Organizer only)
exports.sendAnnouncement = async (req, res) => {
  try {
    const { title, content, type = 'both', recipientRoles, priority = 'normal' } = req.body;

    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required',
      });
    }

    // Get event
    const event = await Event.findById(req.params.id)
      .populate('participants', 'name email')


    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Check if user is organizer or admin
    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send announcements for this event',
      });
    }

    // Determine recipients based on roles
    let recipients = [];
    if (recipientRoles && recipientRoles.length > 0) {
      if (recipientRoles.includes('all') || recipientRoles.includes('participant')) {
        recipients = [...recipients, ...event.participants];
      }

    } else {
      // Default to all participants
      recipients = event.participants;
    }

    // Remove duplicates
    const uniqueRecipients = [...new Map(recipients.map(r => [r._id.toString(), r])).values()];

    if (uniqueRecipients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No recipients found for this announcement',
      });
    }

    // Create announcement record
    const announcement = await Announcement.create({
      event: event._id,
      title,
      content,
      type,
      sentBy: req.user.id,
      recipients: uniqueRecipients.map(r => r._id),
      recipientRoles: recipientRoles || ['participant'],
      priority,
    });

    let emailsSent = 0;
    let emailsFailed = 0;
    const emailErrors = [];

    // Send emails if type includes email
    if (type === 'email' || type === 'both') {
      for (const recipient of uniqueRecipients) {
        try {
          await sendAnnouncementEmail(
            recipient.email,
            recipient.name,
            event.title,
            title,
            content
          );
          emailsSent++;
        } catch (error) {
          console.error(`Failed to send email to ${recipient.email}:`, error);
          emailsFailed++;
          emailErrors.push({
            recipient: recipient.email,
            error: error.message,
          });
        }
      }

      // Update announcement with email status
      announcement.emailStatus = {
        sent: emailsSent,
        failed: emailsFailed,
        errors: emailErrors,
      };
      await announcement.save();
    }

    let notificationsSent = 0;

    // Create in-app notifications if type includes broadcast
    if (type === 'broadcast' || type === 'both') {
      const notifications = uniqueRecipients.map(recipient => ({
        user: recipient._id,
        type: 'announcement',
        title: `📢 ${title}`,
        message: content.substring(0, 200) + (content.length > 200 ? '...' : ''),
        relatedId: event._id,
        relatedModel: 'Event',
        priority,
      }));

      await Notification.insertMany(notifications);
      notificationsSent = notifications.length;

      // Emit Socket.io event for real-time notifications
      const io = req.app.get('io');
      if (io) {
        // Broadcast to event room
        io.to(`event_${event._id}`).emit('announcement', {
          eventId: event._id,
          title,
          content,
          priority,
          sentAt: new Date(),
        });

        // Send individual notifications
        uniqueRecipients.forEach(recipient => {
          io.to(recipient._id.toString()).emit('newNotification', {
            type: 'announcement',
            title: `📢 ${title}`,
            message: content.substring(0, 200),
            eventId: event._id,
            priority,
          });
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Announcement sent successfully',
      data: {
        announcement: {
          _id: announcement._id,
          title: announcement.title,
          type: announcement.type,
          priority: announcement.priority,
          sentAt: announcement.sentAt,
        },
        emailStatus: {
          sent: emailsSent,
          failed: emailsFailed,
        },
        notificationsSent,
        recipientCount: uniqueRecipients.length,
      },
    });
  } catch (error) {
    console.error('Send announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending announcement',
      error: error.message,
    });
  }
};

const cron = require('node-cron');
const Event = require('../models/Event');
const User = require('../models/User');
const Team = require('../models/Team');
const Notification = require('../models/Notification');
const Submission = require('../models/Submission');
const { sendDeadlineReminder } = require('./emailService');

// Send deadline reminders (runs every hour)
const scheduleDeadlineReminders = () => {
  // Run every hour
  cron.schedule('0 * * * *', async () => {
    try {
      console.log('Running deadline reminder check...');
      
      const now = new Date();
      const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const in1Hour = new Date(now.getTime() + 60 * 60 * 1000);

      // Find events with upcoming deadlines
      const events = await Event.find({
        $or: [
          { registrationDeadline: { $gte: now, $lte: in24Hours } },
          { endDate: { $gte: now, $lte: in24Hours } },
        ],
        status: { $in: ['upcoming', 'ongoing'] },
      });

      for (const event of events) {
        // Check registration deadline (24h reminder)
        if (event.registrationDeadline && 
            event.registrationDeadline >= now && 
            event.registrationDeadline <= in24Hours) {
          
          const participants = await User.find({
            _id: { $in: event.participants },
          });

          for (const participant of participants) {
            // Send email
            await sendDeadlineReminder(
              participant.email,
              participant.name,
              event.title,
              'Registration',
              event.registrationDeadline
            );

            // Create notification
            await Notification.create({
              user: participant._id,
              type: 'event_update',
              title: 'Registration Deadline Approaching',
              message: `The registration deadline for ${event.title} is in 24 hours!`,
              relatedId: event._id,
              relatedModel: 'Event',
              priority: 'high',
            });
          }
        }

        // Check submission  deadline (1h reminder for each phase)
        if (event.phases && event.phases.length > 0) {
          for (const phase of event.phases) {
            if (phase.name === 'submission' && 
                phase.endDate >= now && 
                phase.endDate <= in1Hour) {
              
              const teams = await Team.find({ event: event._id }).populate('members');
              
              for (const team of teams) {
                for (const member of team.members) {
                  await sendDeadlineReminder(
                    member.email,
                    member.name,
                    event.title,
                    'Submission',
                    phase.endDate
                  );

                  await Notification.create({
                    user: member._id,
                    type: 'event_update',
                    title: 'Submission Deadline in 1 Hour!',
                    message: `The submission deadline for ${event.title} is in 1 hour. Submit now!`,
                    relatedId: event._id,
                    relatedModel: 'Event',
                    priority: 'urgent',
                  });
                }
              }
            }
          }
        }
      }

      console.log('Deadline reminder check completed');
    } catch (error) {
      console.error('Deadline reminder error:', error);
    }
  });
};

// Auto-lock submissions after deadline (runs every 5 minutes)
const scheduleSubmissionLocking = () => {
  cron.schedule('*/5 * * * *', async () => {
    try {
      console.log('Checking for submissions to lock...');
      
      const now = new Date();

      // Find events where submission phase has ended
      const events = await Event.find({
        'phases.name': 'submission',
      });

      for (const event of events) {
        const submissionPhase = event.phases.find(p => p.name === 'submission');
        
        if (submissionPhase && submissionPhase.endDate < now) {
          // Lock all submissions for this event that aren't already locked
          const result = await Submission.updateMany(
            {
              event: event._id,
              status: { $ne: 'locked' },
            },
            {
              $set: { status: 'locked' },
            }
          );

          if (result.modifiedCount > 0) {
            console.log(`Locked ${result.modifiedCount} submissions for event: ${event.title}`);
          }
        }
      }
    } catch (error) {
      console.error('Submission locking error:', error);
    }
  });
};

// Update event status and current phase based on time (runs every 5 minutes and on startup)
const updateEventStatuses = async () => {
    try {
      console.log('Running event status update check...');
      const now = new Date();

      // Find all active events (not cancelled)
      const events = await Event.find({
        status: { $ne: 'cancelled' }
      });

      let updatesCount = 0;

      for (const event of events) {
        let shouldSave = false;
        let newStatus = event.status;

        // 1. Determine Status
        if (now < new Date(event.startDate)) {
          newStatus = 'upcoming';
        } else if (now >= new Date(event.startDate) && now <= new Date(event.endDate)) {
          newStatus = 'ongoing';
        } else if (now > new Date(event.endDate)) {
          newStatus = 'completed';
        }

        if (event.status !== newStatus) {
          event.status = newStatus;
          shouldSave = true;
        }

        // 2. Determine Phase
        if (event.phases && event.phases.length > 0) {
          // Sort phases by start date
          const sortedPhases = [...event.phases].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
          
          let activePhase = null;
          
          // Check if we are in a specific phase
          for (const phase of sortedPhases) {
            if (now >= new Date(phase.startDate) && now <= new Date(phase.endDate)) {
              activePhase = phase.name;
              break;
            }
          }

          // If not in a specific phase, check if we are before first or after last
          if (!activePhase) {
            if (now < new Date(sortedPhases[0].startDate)) {
              activePhase = 'registration'; // Default pre-event
            } else if (now > new Date(sortedPhases[sortedPhases.length - 1].endDate)) {
              activePhase = 'completed';
            } else {
               // In between phases? activePhase remains null or previous
            }
          }

          if (activePhase && event.currentPhase !== activePhase) {
             event.currentPhase = activePhase;
             shouldSave = true;
          }
        }

        if (shouldSave) {
           await event.save();
           updatesCount++;
        }
      }

      if (updatesCount > 0) {
        console.log(`Updated status/phase for ${updatesCount} events`);
      }
    } catch (error) {
       console.error('Event status update error:', error);
    }
};

const scheduleEventStatusUpdates = () => {
    // Deprecated: Status is now calculated dynamically.
    // This function is kept empty to avoid breaking imports if any.
    console.log('Event Status Schedular is deprecated (dynamic status enabled)');
};

// Initialize all schedulers
const initializeSchedulers = () => {
  console.log('Initializing task schedulers...');
  scheduleDeadlineReminders();
  scheduleSubmissionLocking();
  scheduleEventStatusUpdates();
  console.log('Task schedulers initialized');
};

module.exports = {
  initializeSchedulers,
  scheduleDeadlineReminders,
  scheduleSubmissionLocking,
  scheduleEventStatusUpdates,
};

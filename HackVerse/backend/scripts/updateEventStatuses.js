const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Event = require('../models/Event');

dotenv.config();

const updateEvents = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hackverse');
    console.log('Connected to MongoDB');

    const now = new Date();
    const events = await Event.find({});
    let updates = 0;

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

          if (activePhase && event.currentPhase !== activePhase) {
             console.log(`Updating phase for ${event.title}: ${event.currentPhase} -> ${activePhase}`);
             event.currentPhase = activePhase;
             shouldSave = true;
          }
        }

        if (shouldSave) {
           await event.save();
           updates++;
        }
    }

    console.log(`Updated ${updates} events.`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

updateEvents();

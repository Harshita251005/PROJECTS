const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Event = require('../backend/models/Event');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const updateStatuses = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hackathon-platform');
    console.log('Connected.');

    const now = new Date();
    console.log('Current Time:', now.toISOString());

    const events = await Event.find({ status: { $ne: 'cancelled' } });
    console.log(`Found ${events.length} active events.`);

    let updates = 0;

    for (const event of events) {
      let shouldSave = false;
      let newStatus = event.status;

      console.log(`Checking Event: ${event.title}`);
      console.log(`  Start: ${event.startDate}`);
      console.log(`  End:   ${event.endDate}`);
      console.log(`  Current Status: ${event.status}`);

      // 1. Determine Status
      if (now < new Date(event.startDate)) {
        newStatus = 'upcoming';
      } else if (now >= new Date(event.startDate) && now <= new Date(event.endDate)) {
        newStatus = 'ongoing';
      } else if (now > new Date(event.endDate)) {
        newStatus = 'completed';
      }

      if (event.status !== newStatus) {
        console.log(`  -> Update Status to: ${newStatus}`);
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
           console.log(`  -> Update Phase to: ${activePhase}`);
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
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
};

updateStatuses();

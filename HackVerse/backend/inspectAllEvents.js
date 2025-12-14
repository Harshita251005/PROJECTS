const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Event = require('./models/Event');
const path = require('path');

dotenv.config();

const inspectAll = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hackathon-platform');
    
    const events = await Event.find({});
    console.log(`Total events: ${events.length}`);
    
    events.forEach(e => {
      console.log(`[${e._id}] "${e.title}"`);
      console.log(`   Status: ${e.status}`);
      console.log(`   Start: ${e.startDate ? e.startDate.toISOString() : 'MISSING'}`);
      console.log(`   End:   ${e.endDate ? e.endDate.toISOString() : 'MISSING'}`);
    });

  } catch (e) {
    console.error(e);
  } finally {
    await mongoose.disconnect();
  }
};

inspectAll();

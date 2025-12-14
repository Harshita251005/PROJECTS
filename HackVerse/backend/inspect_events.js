
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Event = require('./models/Event');

const inspectEvents = async () => {
  try {
    console.log('Connecting to MongoDB...');
    if (!process.env.MONGO_URI) {
        console.error('MONGO_URI is undefined. Check .env');
        process.exit(1);
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected.');

    const events = await Event.find({}).select('title startDate endDate status currentPhase');
    console.log(`Found ${events.length} events:`);
    
    const now = new Date();
    console.log('Current Server Time:', now.toISOString());

    events.forEach(event => {
      console.log(`- ${event.title}:`);
      console.log(`  Start: ${event.startDate ? new Date(event.startDate).toISOString() : 'N/A'}`);
      console.log(`  End:   ${event.endDate ? new Date(event.endDate).toISOString() : 'N/A'}`);
      console.log(`  Status DB: ${event.status}`);
      
      // Calc logic check
      let calculatedStatus = 'unknown';
      if (now < new Date(event.startDate)) calculatedStatus = 'upcoming';
      else if (now >= new Date(event.startDate) && now <= new Date(event.endDate)) calculatedStatus = 'ongoing';
      else if (now > new Date(event.endDate)) calculatedStatus = 'completed';
      
      console.log(`  Status Calc: ${calculatedStatus}`);
      console.log('---');
    });

    mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

inspectEvents();

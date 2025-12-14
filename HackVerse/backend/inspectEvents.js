const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Event = require('./models/Event');
const path = require('path');

dotenv.config();

const inspectEvents = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hackathon-platform');
    
    // Find events with 2026 in title or just list all future-ish events
    // Screenshot titles: "Smart India Ideathon 2025" (completed?), partial "Web Sprint 202?...", "CyberSecurity..."
    
    // Let's just dump all events to be safe, or filter by status 'completed' but date in future?
    const events = await Event.find({});
    
    console.log(`Found ${events.length} events.`);
    
    events.forEach(e => {
      console.log('--------------------------------------------------');
      console.log(`Title: ${e.title}`);
      console.log(`ID: ${e._id}`);
      console.log(`Status (DB): ${e.status}`);
      console.log(`Current Phase (DB): ${e.currentPhase}`);
      console.log(`StartDate (Raw):`, e.startDate);
      console.log(`EndDate (Raw):`, e.endDate);
      
      const start = new Date(e.startDate);
      const end = new Date(e.endDate);
      const now = new Date();
      
      console.log(`StartDate (Parsed): ${start.toString()}`);
      console.log(`EndDate (Parsed): ${end.toString()}`);
      
      console.log(`Now: ${now.toString()}`);
      console.log(`Now < Start: ${now < start}`);
      console.log(`Now > End: ${now > end}`);
    });

  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.disconnect();
  }
};

inspectEvents();

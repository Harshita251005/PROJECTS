const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Event = require('./models/Event');

dotenv.config();

const inspect = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hackathon-platform');
        
        const event = await Event.findOne({ title: { $regex: 'vgnhmjcvbn', $options: 'i' } });
        
        if (event) {
            console.log(`Title: ${event.title}`);
            console.log(`Status: ${event.status}`);
            console.log(`Phase: ${event.currentPhase}`);
            console.log(`Start Raw: ${event.startDate}`);
            console.log(`End Raw:   ${event.endDate}`);
            
            const start = new Date(event.startDate);
            const now = new Date();
            
            console.log(`Start Parsed: ${start.toISOString()}`);
            console.log(`Now: ${now.toISOString()}`);
            console.log(`Now < Start: ${now < start}`);
        } else {
            console.log('Event not found');
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

inspect();

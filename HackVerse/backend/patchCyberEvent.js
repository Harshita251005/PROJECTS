const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Event = require('./models/Event');

dotenv.config();

const patch = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hackathon-platform');
        
        const id = '693e3d2e9907949802e8df2a';
        const event = await Event.findById(id);
        
        if (event) {
            console.log(`Found event: ${event.title}`);
            console.log(`Current Status: ${event.status}`);
            
            // Force reset
            event.status = 'upcoming';
            event.currentPhase = 'registration';
            // Re-assert dates just in case
            event.startDate = new Date('2026-03-28T09:00:00.000Z');
            event.endDate = new Date('2026-03-29T18:00:00.000Z');
            
            await event.save();
            console.log('Successfully updated status to upcoming.');
        } else {
            console.log('Event not found with ID ' + id);
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

patch();

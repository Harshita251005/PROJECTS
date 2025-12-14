const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Event = require('./models/Event');

dotenv.config();

const patch = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hackathon-platform');
        
        const event = await Event.findOne({ title: { $regex: 'vgnhmjcvbn', $options: 'i' } });
        
        if (event) {
            console.log(`Found event: ${event.title}`);
            // Force reset
            event.status = 'completed';
            event.currentPhase = 'completed';
            await event.save();
            console.log('Successfully updated status to completed.');
        } else {
            console.log('Event not found');
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

patch();

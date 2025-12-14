const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Event = require('./models/Event');

dotenv.config();

const fs = require('fs');

const findCyber = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hackathon-platform');
        
        const events = await Event.find({ title: { $regex: 'Cyber', $options: 'i' } });
        
        let output = `Found ${events.length} events matching 'Cyber'.\n`;
        events.forEach(e => {
            output += `ID: ${e._id}\n`;
            output += `Title: ${e.title}\n`;
            output += `Status: ${e.status}\n`;
            output += `Phase: ${e.currentPhase}\n`;
            output += `Start: ${e.startDate}\n`;
            output += `End:   ${e.endDate}\n`;
            output += '-------------------\n';
        });

        fs.writeFileSync('cyber_event_details.txt', output);
        console.log('Written to cyber_event_details.txt');

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

findCyber();

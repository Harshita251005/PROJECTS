const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Event = require('./models/Event');
const path = require('path');

dotenv.config();

const fixDates = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hackathon-platform');
        
        // 1. Fix "Web of Sprint 2026" (Partial match)
        const webEvent = await Event.findOne({ title: { $regex: 'Web of Sprint', $options: 'i' } });
        if (webEvent) {
            console.log('Fixing Web Sprint...');
            // 05/04/2026 -> 2026-04-05
            webEvent.startDate = new Date('2026-04-05T09:00:00.000Z');
            webEvent.endDate = new Date('2026-04-05T18:00:00.000Z');
            webEvent.status = 'upcoming'; // Force correct status
            webEvent.currentPhase = 'registration';
            await webEvent.save();
            console.log('Fixed Web Sprint.');
        } else {
            // Try to find by date similarity if title no match? Or maybe user renamed it?
            // Let's look for "Sprint"
             const sprint = await Event.findOne({ title: { $regex: 'Sprint', $options: 'i' } });
             if(sprint && sprint.status === 'completed') {
                 console.log(`Found candidate: ${sprint.title}`);
                 sprint.startDate = new Date('2026-04-05T09:00:00.000Z');
                 sprint.endDate = new Date('2026-04-05T18:00:00.000Z');
                 sprint.status = 'upcoming';
                 await sprint.save();
             }
        }

        // 2. Fix "CyberSecurity..."
        const cyberEvent = await Event.findOne({ title: { $regex: 'CyberSecurity', $options: 'i' } });
        if (cyberEvent) {
            console.log('Fixing CyberSecurity...');
            // 28/03/2026 -> 2026-03-28
            cyberEvent.startDate = new Date('2026-03-28T09:00:00.000Z');
            cyberEvent.endDate = new Date('2026-03-29T18:00:00.000Z');
            cyberEvent.status = 'upcoming';
            cyberEvent.currentPhase = 'registration';
            await cyberEvent.save();
            console.log('Fixed CyberSecurity.');
        }

        console.log('Done.');

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

fixDates();

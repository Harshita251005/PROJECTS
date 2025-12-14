const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Team = require('./models/Team');
const Event = require('./models/Event');
const User = require('./models/User');

dotenv.config();

const fs = require('fs');

const debugTeam = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hackathon-platform');
        
        const team = await Team.findOne({ name: { $regex: 'Code Warriers', $options: 'i' } })
            .populate('members', 'name email');
            
        let output = '';
        if (!team) {
            output = 'Team "Code Warriers" not found.\n';
            const teams = await Team.find({}).limit(5);
            output += `Recent teams: ${teams.map(t => t.name).join(', ')}`;
        } else {
            output += '--- Team Details ---\n';
            output += `ID: ${team._id}\n`;
            output += `Name: ${team.name}\n`;
            output += `Max Members: ${team.maxMembers} (Type: ${typeof team.maxMembers})\n`;
            output += `Members Count: ${team.members.length}\n`;
            output += `Members: ${team.members.map(m => m.name).join(', ')}\n`;
            
            // Check Event
            const event = await Event.findById(team.event);
            if (event) {
                output += `Event: ${event.title}\n`;
                output += `Event Max Team Size: ${event.maxTeamSize}\n`;
            } else {
                output += 'Event not found??\n';
            }
        }
        
        fs.writeFileSync('team_debug.txt', output);
        console.log('Debug info written to team_debug.txt');

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

debugTeam();

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Team = require('./models/Team');
const Event = require('./models/Event');
const User = require('./models/User');

dotenv.config();

const fixTeam = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hackathon-platform');
        
        const team = await Team.findOne({ name: { $regex: 'Code Warriers', $options: 'i' } });
            
        if (!team) {
            console.log('Team not found');
            return;
        }

        console.log(`Current size: ${team.maxMembers}`);
        team.maxMembers = 4;
        await team.save();
        console.log(`Updated size to: ${team.maxMembers}`);

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

fixTeam();

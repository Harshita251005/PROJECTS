const debugTeams = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hackathon-platform');
        
        // Find recent events
        const events = await Event.find({}).sort({ createdAt: -1 }).limit(5);
        
        console.log(`Checking ${events.length} recent events:`);
        
        for (const event of events) {
            const teams = await Team.find({ event: event._id });
            console.log(`Event: "${event.title}" (ID: ${event._id})`);
            console.log(`  - Organizer: ${event.organizer}`);
            console.log(`  - Status: ${event.status}`);
            console.log(`  - Teams: ${teams.length}`);
            if (teams.length > 0) {
                 teams.forEach(t => console.log(`    * ${t.name}`));
            }
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

debugTeams();

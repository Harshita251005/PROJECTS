const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const AnnouncementSchema = new mongoose.Schema({}, { strict: false });
const Announcement = mongoose.model('Announcement', AnnouncementSchema);

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
        
        const count = await Announcement.countDocuments();
        console.log(`Total Announcements in DB: ${count}`);
        
        const all = await Announcement.find();
        console.log('Announcements:', JSON.stringify(all, null, 2));
        
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

connectDB();

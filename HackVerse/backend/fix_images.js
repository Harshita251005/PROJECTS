const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Event = require('./models/Event');

dotenv.config();

const defaultImages = [
  'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1555255707-c07a66f21ce8?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1000&auto=format&fit=crop', 
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1531297461136-82086314330d?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=1000&auto=format&fit=crop'
];

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    // Find events with empty image string or null
    const events = await Event.find({ $or: [{ image: "" }, { image: null }, { image: { $exists: false } }] });
    console.log(`Found ${events.length} events to fix.`);
    
    for (const event of events) {
      const randomImage = defaultImages[Math.floor(Math.random() * defaultImages.length)];
      event.image = randomImage;
      await event.save();
      console.log(`Updated event: ${event.title}`);
    }
    
    console.log('Done');
    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

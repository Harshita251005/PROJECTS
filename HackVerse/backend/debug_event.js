const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Event = require('./models/Event');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    const event = await Event.findOne({ title: /Global AI Hackathon/i });
    if (event) {
      console.log('Event found:', event.title);
      console.log('Image field:', `"${event.image}"`);
      console.log('Type of image:', typeof event.image);
    } else {
      console.log('Event not found');
    }
    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

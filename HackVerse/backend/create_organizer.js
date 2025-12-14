const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hackathon-platform')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const email = 'organizer@test.com';
    const password = 'password123';
    
    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      console.log('User already exists, updating role to organizer');
      user.role = 'organizer';
      await user.save();
    } else {
      console.log('Creating new organizer user');
      user = await User.create({
        name: 'Test Organizer',
        email,
        password,
        role: 'organizer'
      });
    }
    
    console.log(`User ${user.email} is ready with role ${user.role}`);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

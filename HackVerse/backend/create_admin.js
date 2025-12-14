const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const createAdmin = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hackathon-platform';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const email = 'admin@hackverse.com';
    const password = 'admin123';

    let admin = await User.findOne({ email });

    if (admin) {
      admin.role = 'admin';
      admin.password = password; 
      admin.isActive = true;
      admin.isEmailVerified = true;
      await admin.save();
      console.log('Admin user updated.');
    } else {
      admin = await User.create({
        name: 'Admin User',
        email,
        password,
        role: 'admin',
        isActive: true,
        isEmailVerified: true
      });
      console.log('Admin user created.');
    }

    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createAdmin();

const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const makeOrganizer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📡 Connected to MongoDB');

    // Get email from command line argument or use default
    const email = process.argv[2];

    if (!email) {
      console.log('❌ Please provide an email address');
      console.log('Usage: node make_organizer.js user@example.com');
      process.exit(1);
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.log(`❌ User with email "${email}" not found`);
      process.exit(1);
    }

    console.log(`\n👤 Found user: ${user.name} (${user.email})`);
    console.log(`   Current role: ${user.role}`);

    // Update role to organizer
    user.role = 'organizer';
    await user.save();

    console.log(`✅ Successfully updated role to: organizer`);
    console.log(`\n🎉 ${user.name} can now create and manage events!`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

makeOrganizer();

const User = require('../models/User');
const Event = require('../models/Event');
const Team = require('../models/Team');
const { uploadImage } = require('../utils/cloudinary');


exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('participatedEvents', 'title startDate endDate image')
      .populate({
        path: 'teams',
        populate: {
          path: 'event',
          select: 'title',
        },
      });

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message,
    });
  }
};


exports.updateProfile = async (req, res) => {
  try {
    const { name, email, bio, skills, githubProfile, linkedinProfile, portfolioWebsite } = req.body;

    const user = await User.findById(req.user.id);

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (skills) user.skills = skills;
    if (githubProfile !== undefined) user.githubProfile = githubProfile;
    if (linkedinProfile !== undefined) user.linkedinProfile = linkedinProfile;
    if (portfolioWebsite !== undefined) user.portfolioWebsite = portfolioWebsite;
    
    if (email && email !== user.email) {
      // Check if email already exists
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use',
        });
      }
      user.email = email;
      user.isEmailVerified = false; // Require re-verification
    }

    await user.save();

    // Return full user object for frontend
    const updatedUser = await User.findById(user._id)
      .populate('participatedEvents', 'title startDate endDate image')
      .populate({
        path: 'teams',
        populate: {
          path: 'event',
          select: 'title',
        },
      });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message,
    });
  }
};


exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image provided',
      });
    }

 
    const imagePath = `/uploads/${req.file.filename}`;
    const fullUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}${imagePath}`;
    
    const backendUrl = process.env.VITE_API_URL ? process.env.VITE_API_URL.replace('/api', '') : 'http://localhost:4000';
    const imageUrl = `${backendUrl}${imagePath}`;

 
    const user = await User.findById(req.user.id);
    user.profilePicture = imageUrl;
    await user.save();

    res.json({
      success: true,
      message: 'Profile picture updated successfully',
      profilePicture: imageUrl,
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading avatar',
      error: error.message,
    });
  }
};


exports.getMyEvents = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    let events = [];

    // For organizers, return events they created
    if (user.role === 'organizer') {
      events = await Event.find({ organizer: req.user.id })
        .sort({ createdAt: -1 });
    } else {
      // For other roles, return participated events
      await user.populate('participatedEvents');
      events = user.participatedEvents || [];
    }

    res.json({
      success: true,
      events,
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching events',
      error: error.message,
    });
  }
};


exports.getMyTeams = async (req, res) => {
  try {
    // For organizers, return teams from their events
    if (req.user.role === 'organizer') {
      const events = await Event.find({ organizer: req.user.id }).select('_id');
      const eventIds = events.map(event => event._id);
      
      const teams = await Team.find({ event: { $in: eventIds } })
        .populate('event', 'title startDate endDate')
        .populate('members', 'name email profilePicture')
        .populate('leader', 'name email');
        
      return res.json({
        success: true,
        teams,
      });
    }

    const user = await User.findById(req.user.id).populate({
      path: 'teams',
      populate: [
        { path: 'event', select: 'title startDate endDate' },
        { path: 'members', select: 'name email profilePicture' },
        { path: 'leader', select: 'name email' },
      ],
    });

    res.json({
      success: true,
      teams: user.teams,
    });
  } catch (error) {
    console.error('Get teams error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching teams',
      error: error.message,
    });
  }
};


exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.json({ success: true, users: [] });
    }

    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
      ],
    })
    .select('name email profilePicture')
    .limit(10);

    res.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching users',
      error: error.message,
    });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('participatedEvents', 'title startDate endDate image')
      .populate({
        path: 'teams',
        populate: {
          path: 'event',
          select: 'title',
        },
      });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user details',
      error: error.message,
    });
  }
};

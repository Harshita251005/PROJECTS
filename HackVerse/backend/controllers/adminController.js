const User = require('../models/User');
const Event = require('../models/Event');
const Team = require('../models/Team');
const AuditLog = require('../models/AuditLog');
const Announcement = require('../models/Announcement');
const mongoose = require('mongoose');

exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTeams = await Team.countDocuments();
    const totalEvents = await Event.countDocuments();
    
    const roles = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);


    const recentActivity = await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('actor', 'name email');

    res.status(200).json({
      success: true,
      data: {
        counts: {
          users: totalUsers,
          teams: totalTeams,
          events: totalEvents
        },
        roles,
        recentActivity
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};


exports.getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const { search, role, status } = req.query;

    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) {
      query.role = role;
    }

    
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .skip(startIndex)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};


exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const oldRole = user.role;
    user.role = role;
    await user.save();

    // Create Audit Log
    await AuditLog.log({
      actor: req.user.id,
      actorRole: req.user.role,
      action: AuditLog.ACTION_TYPES.USER_ROLE_CHANGED || 'user_role_changed',
      target: 'User',
      targetId: user._id,
      details: { oldRole, newRole: role },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};


exports.toggleUserStatus = async (req, res) => {
  try {
   
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Toggle logic (assuming field will be added)
    user.isActive = !user.isActive;
    await user.save();

    await AuditLog.log({
      actor: req.user.id,
      actorRole: req.user.role,
      action: user.isActive ? 'user_reactivated' : 'user_deactivated',
      target: 'User',
      targetId: user._id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error toggling user status:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};


exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate('actor', 'name email')
      .sort({ createdAt: -1 })
      .limit(100); // Limit for now

    res.status(200).json({
      success: true,
      data: logs
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};


exports.getSystemHealth = async (req, res) => {
  try {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    
    // Format uptime
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const uptimeString = `${days}d ${hours}h ${minutes}m`;

    const cpuUsage = Math.floor(Math.random() * 30) + 5; // Random 5-35%

    // Memory usage in MB
    const usedMemory = Math.round(memoryUsage.heapUsed / 1024 / 1024);
    const totalMemory = Math.round(memoryUsage.heapTotal / 1024 / 1024);
    const memoryPercentage = Math.round((usedMemory / totalMemory) * 100);

    const healthData = {
      status: 'healthy',
      uptime: uptimeString,
      cpu: cpuUsage,
      memory: memoryPercentage,
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      redis: 'disconnected', // Placeholder
      lastBackup: 'N/A'
    };

    res.status(200).json({
      success: true,
      data: healthData
    });
  } catch (error) {
    console.error('Error fetching system health:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};


exports.getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate('sentBy', 'name email')
      .populate('event', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: announcements
    });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};


exports.createAnnouncement = async (req, res) => {
  try {
    const { title, content, type, recipientRoles, priority } = req.body;

    const announcement = await Announcement.create({
      title,
      content,
      type: type || 'broadcast',
      recipientRoles: recipientRoles || ['all'],
      priority: priority || 'normal',
      sentBy: req.user.id,
      event: null // Explicitly null for global
    });

    // TODO: Trigger socket broadcast or email sending here

    res.status(201).json({
      success: true,
      data: announcement
    });
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

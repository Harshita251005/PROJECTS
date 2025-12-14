const Team = require('../models/Team');
const User = require('../models/User');
const Event = require('../models/Event');
const Notification = require('../models/Notification');
const { sendTeamInviteEmail } = require('../utils/emailService');

// @desc    Get all teams
// @route   GET /api/teams
// @access  Public
exports.getTeams = async (req, res) => {
  try {
    const teams = await Team.find()
      .populate('leader', 'name email profilePicture')
      .populate('members', 'name email profilePicture')
      .populate('event', 'title startDate endDate')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: teams.length,
      teams,
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

// @desc    Create team
// @route   POST /api/teams
// @access  Private (Email verified)
exports.createTeam = async (req, res) => {
  try {
    const { name, eventId, maxMembers } = req.body;

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Check if user is admin or organizer
    if (['admin', 'organizer'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Admins and organizers cannot create teams',
      });
    }

    // Create team
    const team = await Team.create({
      name,
      leader: req.user.id,
      members: [req.user.id],
      event: eventId,
      maxMembers: maxMembers || event.maxTeamSize,
      skills: req.body.skills || [],
    });

    // Add team to user
    await User.findByIdAndUpdate(req.user.id, {
      $push: { teams: team._id },
    });

    // Add team to event
    await Event.findByIdAndUpdate(eventId, {
      $push: { teams: team._id },
    });

    // Auto-create Team Chat Room
    const ChatRoom = require('../models/ChatRoom');
    await ChatRoom.create({
      name: team.name,
      type: 'TEAM',
      relatedId: team._id
    });

    const populatedTeam = await Team.findById(team._id)
      .populate('leader', 'name email profilePicture')
      .populate('members', 'name email profilePicture')
      .populate('event', 'title');

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`event_${eventId}`).emit('eventUpdated', {
        eventId,
        type: 'team_created',
      });
    }

    res.status(201).json({
      success: true,
      message: 'Team created successfully',
      team: populatedTeam,
    });
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating team',
      error: error.message,
    });
  }
};

// @desc    Get team details
// @route   GET /api/teams/:id
// @access  Public
exports.getTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('leader', 'name email profilePicture')
      .populate('members', 'name email profilePicture')
      .populate('event', 'title startDate endDate');

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found',
      });
    }

    res.json({
      success: true,
      team,
    });
  } catch (error) {
    console.error('Get team error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching team',
      error: error.message,
    });
  }
};

// @desc    Update team
// @route   PUT /api/teams/:id
// @access  Private (Team leader only)
exports.updateTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found',
      });
    }

    // Check if user is team leader
    if (team.leader.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only team leader can update the team',
      });
    }

    const { name, maxMembers } = req.body;
    if (name) team.name = name;
    if (maxMembers) team.maxMembers = maxMembers;

    await team.save();

    const updatedTeam = await Team.findById(team._id)
      .populate('leader', 'name email profilePicture')
      .populate('members', 'name email profilePicture')
      .populate('event', 'title');

    res.json({
      success: true,
      message: 'Team updated successfully',
      team: updatedTeam,
    });
  } catch (error) {
    console.error('Update team error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating team',
      error: error.message,
    });
  }
};

// @desc    Delete team
// @route   DELETE /api/teams/:id
// @access  Private (Team leader only)
exports.deleteTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found',
      });
    }

    // Check if user is team leader
    if (team.leader.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only team leader can delete the team',
      });
    }

    // Remove team from all members
    await User.updateMany(
      { _id: { $in: team.members } },
      { $pull: { teams: team._id } }
    );

    // Remove team from event
    await Event.findByIdAndUpdate(team.event, {
      $pull: { teams: team._id },
    });

    await team.deleteOne();

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`event_${team.event}`).emit('eventUpdated', {
        eventId: team.event,
        type: 'team_deleted',
      });
    }

    res.json({
      success: true,
      message: 'Team deleted successfully',
    });
  } catch (error) {
    console.error('Delete team error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting team',
      error: error.message,
    });
  }
};

// @desc    Join team
// @route   POST /api/teams/:id/join
// @access  Private (Email verified)
exports.joinTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id).populate('event', 'title');

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found',
      });
    }

    // Check if user is admin or organizer
    if (['admin', 'organizer'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Admins and organizers cannot join teams',
      });
    }

    // Check if already a member
    if (team.members.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this team',
      });
    }

    // Check if team is full
    if (team.members.length >= team.maxMembers) {
      return res.status(400).json({
        success: false,
        message: 'Team is full',
      });
    }

    // Add user to team
    team.members.push(req.user.id);
    await team.save();

    // Add team to user
    await User.findByIdAndUpdate(req.user.id, {
      $push: { teams: team._id },
    });

    // Create notification for team leader
    await Notification.create({
      user: team.leader,
      type: 'team_join',
      title: 'New Team Member',
      message: `${req.user.name} joined your team ${team.name}`,
      relatedId: team._id,
      relatedModel: 'Team',
    });

    const updatedTeam = await Team.findById(team._id)
      .populate('leader', 'name email profilePicture')
      .populate('members', 'name email profilePicture')
      .populate('event', 'title');

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`event_${team.event._id}`).emit('eventUpdated', {
        eventId: team.event._id,
        type: 'team_joined',
      });
    }

    res.json({
      success: true,
      message: 'Joined team successfully',
      team: updatedTeam,
    });
  } catch (error) {
    console.error('Join team error:', error);
    res.status(500).json({
      success: false,
      message: 'Error joining team',
      error: error.message,
    });
  }
};

// @desc    Leave team
// @route   POST /api/teams/:id/leave
// @access  Private
exports.leaveTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found',
      });
    }

    // Check if user is a member
    if (!team.members.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'You are not a member of this team',
      });
    }

    // Leader cannot leave (must delete team instead)
    if (team.leader.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Team leader cannot leave. Please delete the team or transfer leadership.',
      });
    }

    // Remove user from team
    team.members = team.members.filter(member => member.toString() !== req.user.id);
    await team.save();

    // Remove team from user
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { teams: team._id },
    });

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`event_${team.event}`).emit('eventUpdated', {
        eventId: team.event,
        type: 'team_left',
      });
    }

    res.json({
      success: true,
      message: 'Left team successfully',
    });
  } catch (error) {
    console.error('Leave team error:', error);
    res.status(500).json({
      success: false,
      message: 'Error leaving team',
      error: error.message,
    });
  }
};

// @desc    Invite user to team
// @route   POST /api/teams/:id/invite
// @access  Private (Team leader only)
exports.inviteToTeam = async (req, res) => {
  try {
    const { email } = req.body;
    const team = await Team.findById(req.params.id).populate('event', 'title');

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found',
      });
    }

    // Check if user is team leader
    if (team.leader.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only team leader can invite members',
      });
    }

    // Find user by email
    const invitedUser = await User.findOne({ email });
    if (!invitedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email',
      });
    }

    // Check if already a member
    if (team.members.includes(invitedUser._id)) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this team',
      });
    }

    // Check if already invited
    const existingInvite = team.invitations.find(
      inv => inv.user.toString() === invitedUser._id.toString() && inv.status === 'pending'
    );

    if (existingInvite) {
      return res.status(400).json({
        success: false,
        message: 'User has already been invited',
      });
    }

    // Add to invitations
    team.invitations.push({
      user: invitedUser._id,
      status: 'pending',
    });
    await team.save();

    // Create notification
    await Notification.create({
      user: invitedUser._id,
      type: 'team_invite',
      title: 'Team Invitation',
      message: `${req.user.name} invited you to join team ${team.name} for ${team.event.title}`,
      relatedId: team._id,
      relatedModel: 'Team',
    });

    // Send email
    await sendTeamInviteEmail(email, team.name, req.user.name, team.event.title);

    res.json({
      success: true,
      message: 'Invitation sent successfully',
    });
  } catch (error) {
    console.error('Invite to team error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending invitation',
      error: error.message,
    });
  }
};

// @desc    Respond to team invitation
// @route   POST /api/teams/:id/invitation/respond
// @access  Private
exports.respondToInvitation = async (req, res) => {
  try {
    const { status } = req.body; // 'accepted' or 'rejected'
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found',
      });
    }

    const invitation = team.invitations.find(
      inv => inv.user.toString() === req.user.id && inv.status === 'pending'
    );

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found or already responded',
      });
    }

    invitation.status = status;

    if (status === 'accepted') {
      if (team.members.length >= team.maxMembers) {
        return res.status(400).json({
          success: false,
          message: 'Team is full',
        });
      }
      team.members.push(req.user.id);
      await User.findByIdAndUpdate(req.user.id, {
        $push: { teams: team._id },
      });
    }

    await team.save();

    res.json({
      success: true,
      message: `Invitation ${status}`,
    });
  } catch (error) {
    console.error('Respond invitation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error responding to invitation',
      error: error.message,
    });
  }
};

// @desc    Request to join team
// @route   POST /api/teams/:id/join-request
// @access  Private
exports.requestToJoinTeam = async (req, res) => {
  try {
    const { message } = req.body;
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found',
      });
    }

    // Check if user is admin or organizer
    if (['admin', 'organizer'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Admins and organizers cannot request to join teams',
      });
    }

    if (team.members.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'Already a member',
      });
    }

    const existingRequest = team.joinRequests.find(
      req => req.user.toString() === req.user.id && req.status === 'pending'
    );

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'Request already pending',
      });
    }

    team.joinRequests.push({
      user: req.user.id,
      message,
      status: 'pending',
    });

    await team.save();

    // Notify leader
    await Notification.create({
      user: team.leader,
      type: 'join_request',
      title: 'Join Request',
      message: `${req.user.name} wants to join ${team.name}`,
      relatedId: team._id,
      relatedModel: 'Team',
    });

    res.json({
      success: true,
      message: 'Join request sent',
    });
  } catch (error) {
    console.error('Join request error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending join request',
      error: error.message,
    });
  }
};

// @desc    Respond to join request
// @route   POST /api/teams/:id/join-request/:requestId/respond
// @access  Private (Leader only)
exports.respondToJoinRequest = async (req, res) => {
  try {
    const { status } = req.body; // 'accepted' or 'rejected'
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found',
      });
    }

    if (team.leader.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const request = team.joinRequests.id(req.params.requestId);

    if (!request || request.status !== 'pending') {
      return res.status(404).json({
        success: false,
        message: 'Request not found or already handled',
      });
    }

    request.status = status;

    if (status === 'accepted') {
      if (team.members.length >= team.maxMembers) {
        return res.status(400).json({
          success: false,
          message: 'Team is full',
        });
      }
      team.members.push(request.user);
      await User.findByIdAndUpdate(request.user, {
        $push: { teams: team._id },
      });
    }

    await team.save();

    // Notify user
    await Notification.create({
      user: request.user,
      type: 'join_request_response',
      title: 'Join Request Update',
      message: `Your request to join ${team.name} was ${status}`,
      relatedId: team._id,
      relatedModel: 'Team',
    });

    res.json({
      success: true,
      message: `Request ${status}`,
    });
  } catch (error) {
    console.error('Respond join request error:', error);
    res.status(500).json({
      success: false,
      message: 'Error responding to request',
      error: error.message,
    });
  }
};

// @desc    Search teams
// @route   GET /api/teams/search
// @access  Public
exports.searchTeams = async (req, res) => {
  try {
    const { skills, eventId, status } = req.query;
    let query = {};

    if (eventId) query.event = eventId;
    if (status) query.status = status;
    if (skills) {
      const skillList = skills.split(',').map(s => s.trim());
      query.skills = { $in: skillList.map(s => new RegExp(s, 'i')) };
    }

    const teams = await Team.find(query)
      .populate('leader', 'name email')
      .populate('event', 'title');

    res.json({
      success: true,
      count: teams.length,
      teams,
    });
  } catch (error) {
    console.error('Search teams error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching teams',
      error: error.message,
    });
  }
};

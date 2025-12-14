const ChatRoom = require('../models/ChatRoom');
const Message = require('../models/Message');
const Event = require('../models/Event');
const Team = require('../models/Team');

// @desc    Get Chat Rooms for User
// @route   GET /api/chat/rooms
// @access  Private
exports.getChatRooms = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role; // 'admin', 'organizer', 'participant'

    let rooms = [];

    // 1. GLOBAL Room (Organizers, Admin & Team Leaders)
    // Check if user is a Team Leader
    const isTeamLeader = await Team.exists({ leader: userId });

    if (['admin', 'organizer'].includes(userRole) || isTeamLeader) {
      let globalRoom = await ChatRoom.findOne({ type: 'GLOBAL' });
      if (!globalRoom) {
         // Auto-create if not exists
         globalRoom = await ChatRoom.create({
            name: 'Global Chat',
            type: 'GLOBAL'
         });
      }
      rooms.push(globalRoom);
    }

    // 2. EVENT Rooms
    // - Organizer sees rooms for events they organized
    // - Team Leader sees rooms for events they are participating in
    if (userRole === 'organizer') {
       const myEvents = await Event.find({ organizer: userId }).select('_id title');
       for (const event of myEvents) {
          let room = await ChatRoom.findOne({ type: 'EVENT', relatedId: event._id });
          if (!room) {
             room = await ChatRoom.create({
                name: event.title,
                type: 'EVENT',
                relatedId: event._id,
                organizer: userId
             });
          }
          rooms.push(room);
       }
    } else {
       // Check if user is a Team Leader in any team
       // Find teams where user is leader
       const myLeaderTeams = await Team.find({ leader: userId }).populate('event', 'title');
       for (const team of myLeaderTeams) {
           if(team.event) {
               let room = await ChatRoom.findOne({ type: 'EVENT', relatedId: team.event._id });
               if(room) rooms.push(room);
           }
       }
    }

    // 3. TEAM Rooms
    // - All members (Leader + Members) see their team chat
    if (!['admin', 'organizer'].includes(userRole)) {
      const myTeams = await Team.find({ members: userId }).select('_id name');
      for (const team of myTeams) {
          let room = await ChatRoom.findOne({ type: 'TEAM', relatedId: team._id });
          if (!room) {
              room = await ChatRoom.create({
                  name: team.name,
                  type: 'TEAM',
                  relatedId: team._id
              });
          }
          rooms.push(room);
      }
    }

    // Populate last message
    // Note: In production, better to populate nicely or store last message content in room
    
    res.json({
      success: true,
      rooms
    });

  } catch (error) {
    console.error('Get Chat Rooms Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get Messages for a Room
// @route   GET /api/chat/rooms/:roomId/messages
// @access  Private
exports.getRoomMessages = async (req, res) => {
    try {
        const { roomId } = req.params;
        const messages = await Message.find({ chatRoom: roomId })
            .populate('sender', 'name email profilePicture')
            .sort({ createdAt: 1 }); // Oldest first
        
        res.json({
            success: true,
            messages
        });
    } catch (error) {
        console.error('Get Messages Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Send Message
// @route   POST /api/chat/rooms/:roomId/messages
// @access  Private
exports.sendMessage = async (req, res) => {
    try {
        const { roomId } = req.params;
        const { content } = req.body;

        const message = await Message.create({
            chatRoom: roomId,
            sender: req.user.id,
            content
        });
        
        const populatedMessage = await message.populate('sender', 'name email profilePicture');

        // Socket.io emit
        const io = req.app.get('io');
        if (io) {
            io.to(roomId).emit('newMessage', populatedMessage);
        }

        // Update last message in room
        await ChatRoom.findByIdAndUpdate(roomId, { lastMessage: message._id });

        res.json({
            success: true,
            message: populatedMessage
        });

    } catch (error) {
        console.error('Send Message Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
}

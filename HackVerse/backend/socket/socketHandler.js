const Message = require('../models/Message');
const Notification = require('../models/Notification');

// Store connected users
const users = new Map();

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // User joins with their ID
    socket.on('join', (userId) => {
      users.set(userId, socket.id);
      socket.userId = userId;
      socket.join(userId); // Join a room with their own ID for direct messages
      console.log(`User ${userId} joined with socket ${socket.id}`);
      
      // Broadcast user online
      io.emit('userOnline', userId);
    });

    // Join a specific room (e.g., team chat)
    socket.on('joinRoom', (room) => {
      socket.join(room);
      console.log(`Socket ${socket.id} joined room ${room}`);
    });

    // Join global chat
    socket.on('joinGlobal', () => {
      socket.join('global');
      console.log(`Socket ${socket.id} joined global chat`);
    });

    // Join admin room
    socket.on('joinAdmin', () => {
      socket.join('admins');
      console.log(`Socket ${socket.id} joined admin room`);
    });

    // Send message
    socket.on('sendMessage', async (data) => {
      try {
        const { receiverId, content, eventId, type, teamId } = data;

        if (type === 'global') {
          socket.to('global').emit('newMessage', data);
        } else if (type === 'team' && teamId) {
          socket.to(`team_${teamId}`).emit('newMessage', data);
        } else if (type === 'event' && eventId) {
          socket.to(`event_${eventId}`).emit('newMessage', data);
        } else if (receiverId) {
          const receiverSocketId = users.get(receiverId);
          if (receiverSocketId) {
            io.to(receiverSocketId).emit('newMessage', data);
          }
        }
      } catch (error) {
        console.error('Socket send message error:', error);
        socket.emit('error', { message: 'Error sending message' });
      }
    });

    // Send notification
    socket.on('sendNotification', async (data) => {
      try {
        const { userId, notification } = data;
        const userSocketId = users.get(userId);
        
        if (userSocketId) {
          io.to(userSocketId).emit('newNotification', notification);
        }
      } catch (error) {
        console.error('Socket send notification error:', error);
      }
    });

    // Typing indicator
    socket.on('typing', (data) => {
      const { receiverId, chatId, type, isTyping } = data;
      
      if (type === 'global') {
        socket.to('global').emit('userTyping', { userId: socket.userId, isTyping, chatId: 'global' });
      } else if (type === 'team' && chatId) {
        socket.to(`team_${chatId}`).emit('userTyping', { userId: socket.userId, isTyping, chatId });
      } else if (type === 'event' && chatId) {
        socket.to(`event_${chatId}`).emit('userTyping', { userId: socket.userId, isTyping, chatId });
      } else if (receiverId) {
        const receiverSocketId = users.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('userTyping', {
            userId: socket.userId,
            isTyping,
            chatId: socket.userId // For the receiver, the chat ID is the sender
          });
        }
      }
    });

    // Mark as seen
    socket.on('markSeen', (data) => {
      const { chatId, type, messageId } = data;
      // Broadcast to the room/user that the message was seen
      // This is simplified; usually you'd update DB and then emit
      if (type === 'team' && chatId) {
        socket.to(`team_${chatId}`).emit('messageSeen', { userId: socket.userId, messageId, chatId });
      } else if (type === 'direct' && chatId) { // chatId here is the other user
         const receiverSocketId = users.get(chatId);
         if (receiverSocketId) {
           io.to(receiverSocketId).emit('messageSeen', { userId: socket.userId, messageId, chatId: socket.userId });
         }
      }
    });

    // User disconnect
    socket.on('disconnect', () => {
      if (socket.userId) {
        users.delete(socket.userId);
        io.emit('userOffline', socket.userId);
        console.log(`User ${socket.userId} disconnected`);
      }
    });
  });
};

module.exports = socketHandler;

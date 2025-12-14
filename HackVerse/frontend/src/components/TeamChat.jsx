import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import axios from '../lib/axios';
import { format } from 'date-fns';

const TeamChat = ({ teamId, isMember, isAdmin }) => {
  const { user } = useAuth();
  const { socket, connected } = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const [loading, setLoading] = useState(true);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);



  useEffect(() => {
    if (isMember || isAdmin) {
      const fetchMessages = async () => {
        try {
          const response = await axios.get(`/messages/${teamId}`);
          setMessages(response.data.messages);
          setLoading(false);
          scrollToBottom();
        } catch (error) {
          console.error('Error fetching messages:', error);
          setLoading(false);
        }
      };
      
      fetchMessages();
    }
  }, [teamId, isMember, isAdmin, scrollToBottom]);

  useEffect(() => {
    if ((isMember || isAdmin) && socket && connected) {
      socket.emit('joinRoom', `team_${teamId}`);

      const handleNewMessage = (message) => {
        // Check if message belongs to current team
        if (message.teamId === teamId || message.chatId === teamId) {
          // Don't add if it's our own message (already added optimistically)
          const isMyMessage = message.sender._id === user._id || message.sender === user._id;
          if (!isMyMessage) {
            setMessages(prev => [...prev, message]);
            scrollToBottom();
          }
        }
      };

      socket.on('newMessage', handleNewMessage);

      return () => {
        socket.off('newMessage', handleNewMessage);
        socket.emit('leaveRoom', `team_${teamId}`);
      };
    }
  }, [teamId, socket, connected, isMember, isAdmin, scrollToBottom, user._id]);



  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const messageData = {
        content: newMessage,
        chatId: teamId,
        type: 'team'
      };

      // Optimistic update
      const optimisticMessage = {
        _id: Date.now().toString(),
        content: newMessage,
        sender: { _id: user._id, name: user.name },
        createdAt: new Date().toISOString(),
        chatId: teamId,
        teamId: teamId
      };

      setMessages(prev => [...prev, optimisticMessage]);
      setNewMessage('');
      scrollToBottom();

      // Send to server
      await axios.post('/messages', messageData);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (!isMember && !isAdmin) {
    return (
      <div className="card h-[400px] flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mb-3">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <p className="text-gray-400">Join the team to access chat</p>
      </div>
    );
  }

  return (
    <div className="card h-[500px] flex flex-col p-0 overflow-hidden">
      <div className="p-4 border-b border-gray-700 bg-gray-800/50">
        <h3 className="text-lg font-bold text-white">Team Chat</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="spinner w-6 h-6"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.sender._id === user?._id || msg.sender === user?._id;
            const showAvatar = index === 0 || messages[index - 1].sender._id !== msg.sender._id;

            return (
              <div
                key={msg._id}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                {!isMe && showAvatar && (
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs text-white mr-2 mt-1 shrink-0">
                    {msg.sender.name?.charAt(0) || '?'}
                  </div>
                )}
                {!isMe && !showAvatar && <div className="w-10" />}

                <div className={`max-w-[80%] ${isMe ? 'bg-primary text-white' : 'bg-gray-700 text-gray-200'} rounded-lg px-4 py-2`}>
                  {!isMe && showAvatar && (
                    <p className="text-xs font-bold mb-1 opacity-75">{msg.sender.name}</p>
                  )}
                  <p className="break-words">{msg.content}</p>
                  <p className="text-[10px] opacity-50 text-right mt-1">
                    {format(new Date(msg.createdAt), 'HH:mm')}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-700 bg-gray-800/50">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="input-field flex-1"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="btn-primary px-6"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default TeamChat;

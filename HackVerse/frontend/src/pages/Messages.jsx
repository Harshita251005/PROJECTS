import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import axios from '../lib/axios';
import { format } from 'date-fns';

const Messages = () => {
  const { user } = useAuth();
  const { socket, connected } = useSocket();
  const [rooms, setRooms] = useState({ GLOBAL: [], EVENT: [], TEAM: [] });
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const [searchParams] = useSearchParams();
  const urlRoomId = searchParams.get('roomId');

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

 



  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get('/chat/rooms');
        const fetchedRooms = Array.isArray(response.data.rooms) ? response.data.rooms : [];
        
        // Group by type with safety check
        const grouped = {
            GLOBAL: fetchedRooms.filter(r => r && r.type === 'GLOBAL'),
            EVENT: fetchedRooms.filter(r => r && r.type === 'EVENT'),
            TEAM: fetchedRooms.filter(r => r && r.type === 'TEAM')
        };
        
        setRooms(grouped);
        
        // Auto-select first room if none selected
        if (!activeRoom && fetchedRooms.length > 0 && !urlRoomId) {
            // Priority: Global -> Event -> Team
            if(grouped.GLOBAL.length) setActiveRoom(grouped.GLOBAL[0]);
            else if(grouped.EVENT.length) setActiveRoom(grouped.EVENT[0]);
            else if(grouped.TEAM.length) setActiveRoom(grouped.TEAM[0]);
        }

      } catch (error) {
        console.error('Error fetching rooms:', error);
      }
    };

    fetchRooms();
  }, [activeRoom, urlRoomId]);

  useEffect(() => {
    if (urlRoomId) {
      // flatten rooms to find the one matching urlRoomId
      const allRooms = [...rooms.GLOBAL, ...rooms.EVENT, ...rooms.TEAM];
      const target = allRooms.find(r => r._id === urlRoomId);
      if (target) {
        // Defer update to avoid "synchronous setState" lint error in effect
        setTimeout(() => {
          setActiveRoom(target);
        }, 0);
      }
    }
  }, [urlRoomId, rooms]);

  useEffect(() => {
    if (activeRoom) {
      const fetchMessages = async (roomId) => {
        try {
          const response = await axios.get(`/chat/rooms/${roomId}/messages`);
          setMessages(response.data.messages);
          scrollToBottom();
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      };

      fetchMessages(activeRoom._id);

      // Join the room
      if (socket && connected) {
        socket.emit('joinRoom', activeRoom._id);
      }
    }

    return () => {
      if (activeRoom && socket) {
        socket.emit('leaveRoom', activeRoom._id); // Assuming backend handles leave (or just rely on disconnect)
        // socketHandler doesn't explicitly have leaveRoom but it's good practice for client state turnover if supported
      }
    };
  }, [activeRoom, socket, connected, scrollToBottom]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      // Check if message belongs to current room
      if (activeRoom && message.chatRoom === activeRoom._id) {
          // simple check
          setMessages(prev => [...prev, message]);
          scrollToBottom();
      }
    };

    socket.on('newMessage', handleNewMessage);

    return () => {
      socket.off('newMessage', handleNewMessage);
    };
  }, [socket, activeRoom, scrollToBottom]);



  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeRoom) return;

    try {
      const messageData = {
        content: newMessage,
      };

      // Optimistic update
      const optimisticMessage = {
        _id: Date.now().toString(),
        content: newMessage,
        sender: { _id: user._id, name: user.name },
        chatRoom: activeRoom._id,
        createdAt: new Date().toISOString(),
      };

      setMessages(prev => [...prev, optimisticMessage]);
      setNewMessage('');
      scrollToBottom();

      // Send to server
      await axios.post(`/chat/rooms/${activeRoom._id}/messages`, messageData);

    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const renderRoomList = (sectionTitle, roomList) => {
      if (!roomList || roomList.length === 0) return null;
      return (
          <div className="mb-4">
              <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  {sectionTitle}
              </h3>
              {roomList.map(room => (
                  <div
                    key={room._id}
                    onClick={() => setActiveRoom(room)}
                    className={`px-4 py-3 cursor-pointer hover:bg-gray-700/50 transition-colors ${
                      activeRoom?._id === room._id ? 'bg-gray-700/50 border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'
                    }`}
                  >
                    <div className="font-bold text-white truncate">{room.name}</div>
                    {/* <p className="text-xs text-gray-400 truncate">
                      {room.lastMessage ? '...' : 'No messages yet'} 
                    </p> */}
                  </div>
              ))}
          </div>
      );
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-6xl mx-auto h-[calc(100vh-120px)] flex gap-6">
          {/* Sidebar - Rooms */}
          <div className="w-1/3 card flex flex-col p-0 overflow-hidden bg-gray-800">
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">Chat Rooms</h2>
            </div>
            <div className="flex-1 overflow-y-auto py-2">
              {renderRoomList('Official', rooms.GLOBAL)}
              {renderRoomList('Events', rooms.EVENT)}
              {renderRoomList('Teams', rooms.TEAM)}
              
              {rooms.GLOBAL.length === 0 && rooms.EVENT.length === 0 && rooms.TEAM.length === 0 && (
                   <div className="p-4 text-center text-gray-400">
                      No chat rooms available.
                   </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 card flex flex-col p-0 overflow-hidden bg-gray-800">
            {activeRoom ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-700 bg-gray-900/50">
                  <h3 className="text-xl font-bold text-white">{activeRoom.name}</h3>
                  <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300">
                      {activeRoom.type}
                  </span>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg, index) => {
                    const isMe = msg.sender?._id === user?._id;
                    const showAvatar = index === 0 || messages[index - 1]?.sender?._id !== msg.sender?._id;

                    return (
                      <div
                        key={msg._id}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isMe && showAvatar && (
                          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs text-white mr-2 mt-1">
                            {msg.sender?.name ? msg.sender.name.charAt(0) : '?'}
                          </div>
                        )}
                        {!isMe && !showAvatar && <div className="w-10" />}

                        <div className={`max-w-[70%] ${isMe ? 'bg-primary text-white' : 'bg-gray-700 text-gray-200'} rounded-lg px-4 py-2`}>
                          {!isMe && showAvatar && (
                            <p className="text-xs font-bold mb-1 opacity-75">{msg.sender?.name || 'Unknown'}</p>
                          )}
                          <p>{msg.content}</p>
                          <p className="text-[10px] opacity-50 text-right mt-1">
                            {format(new Date(msg.createdAt), 'HH:mm')}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-700 bg-gray-900/50">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={`Message ${activeRoom.name}...`}
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
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                Select a room to start chatting
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Messages;

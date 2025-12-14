import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const newSocket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000', {
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      newSocket.on('connect', () => {
        console.log('Socket connected');
        setConnected(true);
        setReconnecting(false);
        newSocket.emit('join', user.id || user._id);
        
        // Join admin room if user is admin
        if (user.role === 'admin') {
          newSocket.emit('joinAdmin');
        }
      });

      newSocket.on('disconnect', (reason) => {
        if (reason === 'io server disconnect') {
          // the disconnection was initiated by the server, you need to reconnect manually
          console.log('Socket disconnected by server, reconnecting...');
          newSocket.connect();
        } else if (reason !== 'io client disconnect') {
             // Only log if it wasn't a manual degradation (navigation usually)
             console.log('Socket disconnected:', reason);
        }
        setConnected(false);
      });

      newSocket.on('reconnect_attempt', () => {
        console.log('Socket attempting to reconnect...');
        setReconnecting(true);
      });

      newSocket.on('reconnect', (attemptNumber) => {
        console.log(`Socket reconnected after ${attemptNumber} attempts`);
        setConnected(true);
        setReconnecting(false);
        toast.success('Connection restored');
      });

      newSocket.on('reconnect_error', (error) => {
        console.error('Socket reconnection error:', error);
      });

      newSocket.on('reconnect_failed', () => {
        console.error('Socket reconnection failed');
        setReconnecting(false);
        toast.error('Unable to connect to server');
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setConnected(false);
      });

      newSocket.on('newMessage', (message) => {
        // Handle new message
        console.log('New message received:', message);
        // You can dispatch an event or update state here
      });

      newSocket.on('newNotification', (notification) => {
        // Handle new notification
        console.log('New notification received:', notification);
        toast.success(notification.title);
        // Dispatch custom event for notification bell
        window.dispatchEvent(new CustomEvent('newNotification', { detail: notification }));
      });

      newSocket.on('adminNotification', (notification) => {
        console.log('Admin notification received:', notification);
        toast(notification.message, {
          icon: '🔔',
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        });
      });

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user]);

  const sendMessage = (data) => {
    if (socket && connected) {
      socket.emit('sendMessage', data);
      return true;
    } else {
      console.error('Socket not connected');
      toast.error('Unable to send message. Please check your connection.');
      return false;
    }
  };

  const sendNotification = (data) => {
    if (socket && connected) {
      socket.emit('sendNotification', data);
      return true;
    } else {
      console.error('Socket not connected');
      return false;
    }
  };

  const emitTyping = (receiverId, isTyping) => {
    if (socket && connected) {
      socket.emit('typing', { receiverId, isTyping });
    }
  };

  const value = {
    socket,
    connected,
    reconnecting,
    sendMessage,
    sendNotification,
    emitTyping,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

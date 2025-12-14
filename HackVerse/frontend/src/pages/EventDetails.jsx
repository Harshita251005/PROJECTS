import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import axios from '../lib/axios';
import toast from 'react-hot-toast';

const EventDetails = () => {
  const getRandomImage = (id) => {
    const images = [
      'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1555255707-c07a66f21ce8?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1000&auto=format&fit=crop', 
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1531297461136-82086314330d?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=1000&auto=format&fit=crop'
    ];
    const hash = id ? id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;
    return images[hash % images.length];
  };
  const { id } = useParams();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [scheduleItems, setScheduleItems] = useState([]);

  const fetchEvent = useCallback(async () => {
    try {
      const response = await axios.get(`/events/${id}`);
      if (response.data.success) {
        setEvent(response.data.event);
        if (user) {
          setIsRegistered(
            response.data.event.participants?.some(
              (p) => p._id === user.id || p._id === user._id
            )
          );
        }
      } else {
        console.error('API returned success: false');
        toast.error('Event not found');
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      if (error.response?.status === 404) {
        toast.error('Event not found');
      } else {
        toast.error('Failed to load event');
      }
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  const fetchSchedule = useCallback(async () => {
    try {
      const res = await axios.get(`/schedule/event/${id}`);
      if (res.data.success) {
        setScheduleItems(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
    }
  }, [id]);

  useEffect(() => {
    fetchEvent();
    fetchSchedule();

    if (socket) {
      socket.emit('joinRoom', `event_${id}`);

      const handleEventUpdate = (data) => {
        if (data.eventId === id) {
          fetchEvent();
        }
      };

      socket.on('eventUpdated', handleEventUpdate);

      return () => {
        socket.off('eventUpdated', handleEventUpdate);
        socket.emit('leaveRoom', `event_${id}`);
      };
    }
  }, [id, socket, fetchEvent, fetchSchedule]);

  const handleRegister = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to register');
      navigate('/login');
      return;
    }

    try {
      const response = await axios.post(`/events/${id}/register`);
      if (response.data.success) {
        toast.success('Registered successfully!');
        fetchEvent();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  };

  const handleUnregister = async () => {
    try {
      const response = await axios.post(`/events/${id}/unregister`);
      if (response.data.success) {
        toast.success('Unregistered successfully');
        fetchEvent();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unregistration failed');
    }
  };

  if (loading || authLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="spinner"></div>
        </div>
      </>
    );
  }

  if (!event) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Event not found</h2>
            <button onClick={() => navigate('/events')} className="btn-primary">
              Back to Events
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Event Header */}
          <img
            src={(event.image && event.image.startsWith('http')) ? event.image : getRandomImage(event._id)}
            alt={event.title}
            className="w-full h-64 md:h-96 object-cover rounded-xl mb-8"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = getRandomImage(event._id);
            }}
          />

          <div className="card mb-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-primary-300 font-semibold">{event.currentPhase}</p>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {event.title}
                </h1>
                <p className="text-gray-400">
                  Organized by {event.organizer?.name}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span
                  className={`px-4 py-2 rounded-full text-sm font-medium ${event.status === 'upcoming'
                      ? 'bg-blue-900/30 text-blue-400'
                      : event.status === 'ongoing'
                        ? 'bg-green-900/30 text-green-400'
                        : 'bg-gray-900/30 text-gray-400'
                    }`}
                >
                  {event.status}
                </span>
                {user?.role === 'organizer' && (event.organizer?._id === user._id || event.organizer?._id === user.id) && (
                  <Link to={`/events/${id}/edit`} className="btn-secondary text-sm">
                    Manage Event
                  </Link>
                )}
              </div>
            </div>

            <p className="text-gray-300 mb-6">{event.description}</p>

            {/* Event Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center space-x-3 text-gray-300">
                <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-400">Start Date</p>
                  <p className="font-medium">{new Date(event.startDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-gray-300">
                <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-400">End Date</p>
                  <p className="font-medium">{new Date(event.endDate).toLocaleDateString()}</p>
                </div>
              </div>

              {event.venue && (
                <div className="flex items-center space-x-3 text-gray-300">
                  <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="text-sm text-gray-400">Venue</p>
                    <p className="font-medium">{event.venue}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3 text-gray-300">
                <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-400">Max Team Size</p>
                  <p className="font-medium">{event.maxTeamSize} members</p>
                </div>
              </div>
            </div>

            {/* Registration Button */}
            {isAuthenticated && !['admin', 'organizer'].includes(user?.role) && (
              <div className="mt-6 flex flex-wrap gap-4">
                {isRegistered ? (
                  <button onClick={handleUnregister} className="btn-secondary">
                    Unregister
                  </button>
                ) : (
                  <button onClick={handleRegister} className="btn-primary">
                    Register for Event
                  </button>
                )}
                <Link to="/teams" className="btn-outline">
                  Find a Team
                </Link>
                <Link to={`/events/${id}/submit`} className="btn-primary">
                  Submit Project
                </Link>
              </div>
            )}
          </div>

            {/* Schedule Section */}
            {scheduleItems.length > 0 && (
              <div className="card mb-8">
                <h2 className="text-xl font-bold text-white mb-6">Event Schedule</h2>
                <div className="space-y-4">
                  {scheduleItems.map((item) => (
                    <div key={item._id} className="flex gap-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                      <div className="flex flex-col items-center justify-center min-w-[80px] px-3 py-2 bg-slate-900 rounded border border-slate-700 h-fit">
                        <span className="text-xs text-gray-400 uppercase tracking-wider">{new Date(item.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric'})}</span>
                        <span className="text-lg font-bold text-white">{new Date(item.startTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit'})}</span>
                      </div>
                      <div className="flex-1 border-l-2 border-green-500 pl-4">
                        <h3 className="text-lg font-bold text-white">{item.title} <span className="text-xs font-normal text-gray-500 ml-2 border border-gray-700 px-1 rounded">{item.type}</span></h3>
                         {item.description && <p className="text-gray-400 mt-1">{item.description}</p>}
                         <p className="text-xs text-gray-500 mt-2">Ends: {new Date(item.endTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit'})} {item.location && `• ${item.location}`}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Sections (Prizes, Rules, etc.) */}
          {/* ... (rest of the component) ... */}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default EventDetails;

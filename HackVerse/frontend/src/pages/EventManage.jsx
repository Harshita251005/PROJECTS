import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import axios from '../lib/axios';
import toast from 'react-hot-toast';

// Components
import EventStats from '../components/organizer/EventStats';
import ParticipantList from '../components/organizer/ParticipantList';
import TeamList from '../components/organizer/TeamList';
import AnnouncementComposer from '../components/organizer/AnnouncementComposer';
import ProjectList from '../components/organizer/ProjectList';
import ScheduleList from '../components/organizer/ScheduleList';


const EventManage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchEvent = useCallback(async () => {
    try {
      const response = await axios.get(`/events/${id}`);
      if (response.data.success) {
        const eventData = response.data.event;
        // Verify ownership
        if (eventData.organizer._id !== user.id) {
          toast.error('Unauthorized access');
          navigate('/events');
          return;
        }
        setEvent(eventData);
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      toast.error('Failed to load event');
    } finally {
      setLoading(false);
    }
  }, [id, user, navigate]);

  useEffect(() => {
    fetchEvent();

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
  }, [id, socket, fetchEvent]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="spinner"></div>
        </div>
      </>
    );
  }

  if (!event) return null;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'participants', label: 'Participants' },
    { id: 'teams', label: 'Teams' },
    { id: 'projects', label: 'Projects' },
    { id: 'schedule', label: 'Schedule' },
    { id: 'announcements', label: 'Announcements' },
    // { id: 'judging', label: 'Judging' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                <Link to="/events" className="hover:text-white">Events</Link>
                <span>/</span>
                <Link to={`/events/${id}`} className="hover:text-white">{event.title}</Link>
                <span>/</span>
                <span className="text-white">Manage</span>
              </div>
              <h1 className="text-3xl font-bold text-white">Event Dashboard</h1>
            </div>
            <div className="flex gap-3">
              <Link to={`/events/${id}`} className="btn-secondary">
                View Event
              </Link>
              <Link to={`/events/${id}/edit`} className="btn-primary">
                Edit Event
              </Link>
            </div>
          </div>

          {/* Stats Overview */}
          <EventStats event={event} />

          {/* Tabs */}
          <div className="border-b border-slate-700 mb-8">
            <div className="flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-500'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="card">
                    <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <Link to={`/events/${id}/edit`} className="p-4 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors text-center">
                        <span className="block text-2xl mb-2">✏️</span>
                        <span className="text-sm font-medium text-gray-300">Edit Details</span>
                      </Link>
                      <button onClick={() => setActiveTab('announcements')} className="p-4 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors text-center">
                        <span className="block text-2xl mb-2">📢</span>
                        <span className="text-sm font-medium text-gray-300">Send Update</span>
                      </button>
                      <button onClick={() => setActiveTab('participants')} className="p-4 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors text-center">
                        <span className="block text-2xl mb-2">👥</span>
                        <span className="text-sm font-medium text-gray-300">View Users</span>
                      </button>
                      <button onClick={() => setActiveTab('teams')} className="p-4 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors text-center">
                        <span className="block text-2xl mb-2">🛡️</span>
                        <span className="text-sm font-medium text-gray-300">View Teams</span>
                      </button>
                      <button onClick={() => setActiveTab('projects')} className="p-4 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors text-center">
                        <span className="block text-2xl mb-2">🚀</span>
                        <span className="text-sm font-medium text-gray-300">View Projects</span>
                      </button>
                      <button onClick={() => setActiveTab('schedule')} className="p-4 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors text-center">
                        <span className="block text-2xl mb-2">📅</span>
                        <span className="text-sm font-medium text-gray-300">Edit Schedule</span>
                      </button>
                    </div>
                  </div>

                  <div className="card">
                    <h3 className="text-xl font-bold text-white mb-4">Event Status</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-slate-800 rounded-lg">
                        <span className="text-gray-300">Current Phase</span>
                        <span className="px-3 py-1 bg-primary-900/30 text-primary-400 rounded-full text-sm font-medium capitalize">
                          {event.currentPhase?.replace('_', ' ') || 'Planning'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-800 rounded-lg">
                        <span className="text-gray-300">Status</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                          event.status === 'upcoming' ? 'bg-blue-900/30 text-blue-400' :
                          event.status === 'ongoing' ? 'bg-green-900/30 text-green-400' :
                          'bg-gray-900/30 text-gray-400'
                        }`}>
                          {event.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-800 rounded-lg">
                        <span className="text-gray-300">Visibility</span>
                        <span className="text-gray-400">Public</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'participants' && (
              <ParticipantList participants={event.participants} loading={loading} />
            )}

            {activeTab === 'teams' && (
              <TeamList teams={event.teams} loading={loading} />
            )}

            {activeTab === 'projects' && (
              <ProjectList eventId={id} />
            )}

            {activeTab === 'schedule' && (
              <div className="max-w-3xl mx-auto">
                <ScheduleList eventId={id} />
              </div>
            )}

            {activeTab === 'announcements' && (
              <div className="max-w-3xl mx-auto">
                <AnnouncementComposer eventId={id} />
              </div>
            )}

            {activeTab === 'judging' && (
              <div className="space-y-8">
                <div className="text-center py-12 bg-slate-800 rounded-xl">
                  <h3 className="text-xl font-bold text-white mb-2">Coming Soon</h3>
                  <p className="text-gray-400">Judging features are currently under development.</p>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default EventManage;

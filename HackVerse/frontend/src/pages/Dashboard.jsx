import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import axios from '../lib/axios';
import toast from 'react-hot-toast';
import { getRandomImage } from '../utils/imageUtils';

// Role-specific action cards for the dashboard
const roleHighlights = {
  participant: [
    {
      title: 'Browse Hackathons',
      description: 'Discover upcoming events and register to participate.',
      to: '/events',
    },
    {
      title: 'Join a Team',
      description: 'Find teammates or create your own team for events.',
      to: '/teams',
    },
    {
      title: 'Check Messages',
      description: 'Stay connected with your team and event organizers.',
      to: '/messages',
    },
  ],
  organizer: [
    {
      title: 'Create Event',
      description: 'Set up a new hackathon with tracks, prizes, and schedules.',
      to: '/events/create',
    },
    {
      title: 'Manage Events',
      description: 'View and manage your organized hackathons.',
      to: '/events',
    },
  ],
  };

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ events: 0, teams: 0, messages: 0 });
  const [recentEvents, setRecentEvents] = useState([]);
  const [myTeams, setMyTeams] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [eventsRes, teamsRes, notifRes] = await Promise.all([
        axios.get('/users/my-events'),
        axios.get('/users/my-teams'),
        axios.get('/notifications'),
      ]);

      if (eventsRes.data.success) {
        setRecentEvents(eventsRes.data.events.slice(0, 3));
        setStats(prev => ({ ...prev, events: eventsRes.data.events.length }));
      }

      if (teamsRes.data.success) {
        setMyTeams(teamsRes.data.teams.slice(0, 3));
        setStats(prev => ({ ...prev, teams: teamsRes.data.teams.length }));
      }

      if (notifRes.data.success) {
        setNotifications(notifRes.data.notifications.slice(0, 4));
        setStats(prev => ({ ...prev, messages: notifRes.data.unreadCount || 0 }));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const actionCards = useMemo(() => {
    if (!user?.role) return roleHighlights.participant;
    return roleHighlights[user.role] || roleHighlights.participant;
  }, [user?.role]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="spinner" />
        </div>
      </>
    );
  }

  // Admin view: show a simple overview and link to admin dashboard
  // Admin view: redirect to admin dashboard
  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-4xl font-bold text-white mb-2">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-gray-400">Here's what's happening with your hackathons</p>

            {!user?.isEmailVerified && (
              <div className="mt-4 bg-yellow-900/30 border border-yellow-700 rounded-lg p-4">
                <p className="text-yellow-400 text-sm">
                  ⚠️ Please verify your email to create or join teams. Check your inbox for the verification link.
                </p>
              </div>
            )}
          </div>

          {/* Stats Cards */}
          {user?.role !== 'admin' && (
          <div className={`grid grid-cols-1 gap-6 mb-8 ${user?.role === 'participant' ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
            <div className="card hover:scale-105 transition-transform">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{user?.role === 'organizer' ? 'Events Created' : 'Events Joined'}</p>
                  <p className="text-3xl font-bold text-white mt-1">{stats.events}</p>
                </div>
                <div className="w-12 h-12 bg-primary-600/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            {user?.role === 'participant' && (
              <div className="card hover:scale-105 transition-transform">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">My Teams</p>
                    <p className="text-3xl font-bold text-white mt-1">{stats.teams}</p>
                  </div>
                  <div className="w-12 h-12 bg-secondary-600/20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            <div className="card hover:scale-105 transition-transform">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Unread Alerts</p>
                  <p className="text-3xl font-bold text-white mt-1">{stats.messages}</p>
                </div>
                <div className="w-12 h-12 bg-amber-600/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="card hover:scale-105 transition-transform">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Role</p>
                  <p className="text-3xl font-bold text-white mt-1 capitalize">{user?.role}</p>
                </div>
                <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          )}

          {/* Role-based Guidance */}
          <div className={`grid grid-cols-1 gap-4 mb-10 ${user?.role === 'organizer' ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
            {actionCards.map((action, index) => (
              <Link key={action.title} to={action.to} className="card hover:border-primary-500 transition-all group">
                <div className="flex items-start space-x-3">
                  <span className="text-xs text-gray-500 font-semibold uppercase tracking-wide">0{index + 1}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-primary-400 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-gray-400 text-sm mt-2">{action.description}</p>
                    <span className="text-primary-400 text-sm font-medium mt-4 inline-flex items-center gap-1">
                      Open Workspace
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Notifications + Quick Links */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="card lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">Mission Control</h2>
                  <p className="text-gray-400 text-sm">Navigate across the platform features instantly.</p>
                </div>
              </div>
              <div className={`grid grid-cols-1 gap-4 mt-4 ${user?.role === 'organizer' ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
                <Link to="/events" className="card bg-slate-800/60 border border-slate-700 hover:border-primary-500 transition-all">
                  <p className="text-xs uppercase text-gray-400">Discover</p>
                  <h3 className="text-white text-xl font-semibold mt-2">Browse Events</h3>
                  <p className="text-gray-400 text-sm mt-1">Filter by phase, track and format to find your next hack.</p>
                </Link>
                {user?.role === 'participant' && (
                  <Link to="/teams" className="card bg-slate-800/60 border border-slate-700 hover:border-secondary-500 transition-all">
                    <p className="text-xs uppercase text-gray-400">Collaborate</p>
                    <h3 className="text-white text-xl font-semibold mt-2">Manage Teams</h3>
                    <p className="text-gray-400 text-sm mt-1">Handle invites, roles and track-specific rooms.</p>
                  </Link>
                )}
                <Link to="/messages" className="card bg-slate-800/60 border border-slate-700 hover:border-green-500 transition-all">
                  <p className="text-xs uppercase text-gray-400">Engage</p>
                  <h3 className="text-white text-xl font-semibold mt-2">Open Messages</h3>
                  <p className="text-gray-400 text-sm mt-1">Jump into team, event or direct channels in real time.</p>
                </Link>
                <Link to="/profile" className="card bg-slate-800/60 border border-slate-700 hover:border-yellow-500 transition-all">
                  <p className="text-xs uppercase text-gray-400">Profile</p>
                  <h3 className="text-white text-xl font-semibold mt-2">Update Preferences</h3>
                  <p className="text-gray-400 text-sm mt-1">Control notifications, bio, skills and availability.</p>
                </Link>
              </div>
            </div>

            <div className="card h-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Latest Alerts</h2>
                <Link to="/messages" className="text-sm text-primary-400 hover:text-primary-300">View all</Link>
              </div>
              <div className="space-y-4">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div key={notif._id} className="border border-slate-700 rounded-lg p-3 bg-slate-900/50">
                      <p className="text-sm text-gray-400 uppercase tracking-wide">{notif.type}</p>
                      <p className="text-white font-semibold mt-1">{notif.title}</p>
                      <p className="text-sm text-gray-400 mt-1">{notif.message}</p>
                      <p className="text-xs text-gray-500 mt-2">{new Date(notif.createdAt).toLocaleString()}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-6">No new notifications</div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Events and Teams */}
          <div className={`grid grid-cols-1 gap-8 ${user?.role === 'participant' ? 'lg:grid-cols-2' : ''}`}>
            {/* Recent Events */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">{user?.role === 'organizer' ? 'My Events' : 'Recent Events'}</h2>
                <Link to="/events" className="text-primary-500 hover:text-primary-400 text-sm font-medium">View All →</Link>
              </div>
              <div className="space-y-4">
                {recentEvents.length > 0 ? (
                  recentEvents.map((event) => (
                    <Link key={event._id} to={`/events/${event._id}`} className="card hover:border-primary-500 transition-all block">
                      <div className="flex items-start space-x-4">
                        {event.image && (
                          <img 
                            src={event.image} 
                            alt={event.title} 
                            className="w-16 h-16 rounded-lg object-cover" 
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = getRandomImage(event._id);
                            }}
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="text-white font-semibold">{event.title}</h3>
                          <p className="text-gray-400 text-sm mt-1">{new Date(event.startDate).toLocaleDateString()}</p>
                          <span className={`inline-block mt-2 px-2 py-1 text-xs rounded ${event.status === 'upcoming' ? 'bg-blue-900/30 text-blue-400' : event.status === 'ongoing' ? 'bg-green-900/30 text-green-400' : 'bg-gray-900/30 text-gray-400'}`}>
                            {event.status}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="card text-center py-8">
                    <p className="text-gray-400">{user?.role === 'organizer' ? 'No events created yet' : 'No events joined yet'}</p>
                    <Link to={user?.role === 'organizer' ? '/events/create' : '/events'} className="btn-primary mt-4 inline-block">
                      {user?.role === 'organizer' ? 'Create Event' : 'Browse Events'}
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* My Teams */}
            {user?.role === 'participant' && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">My Teams</h2>
                <div className="space-y-4">
                  {myTeams.length > 0 ? (
                    myTeams.map((team) => (
                      <Link key={team._id} to={`/teams/${team._id}`} className="card hover:border-secondary-500 transition-all block">
                        <div>
                          <h3 className="text-white font-semibold">{team.name}</h3>
                          <p className="text-gray-400 text-sm mt-1">{team.event?.title}</p>
                          <div className="flex items-center mt-3 space-x-2">
                            <div className="flex -space-x-2">
                              {team.members?.slice(0, 3).map((member, idx) => (
                                <div key={idx} className="w-8 h-8 rounded-full bg-primary-600 border-2 border-slate-800 flex items-center justify-center">
                                  {member.profilePicture ? (
                                    <img src={member.profilePicture} alt={member.name} className="w-full h-full rounded-full object-cover" />
                                  ) : (
                                    <span className="text-white text-xs">{member.name?.charAt(0)}</span>
                                  )}
                                </div>
                              ))}
                            </div>
                            <span className="text-gray-400 text-sm">{team.members?.length} members</span>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="card text-center py-8">
                      <p className="text-gray-400">No teams yet</p>
                      {user?.isEmailVerified ? (
                        <Link to="/teams/create" className="btn-secondary mt-4 inline-block">Create Team</Link>
                      ) : (
                        <p className="text-yellow-400 text-sm mt-2">Verify your email to create teams</p>
                      )}
                    </div>
                  )}
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

export default Dashboard;

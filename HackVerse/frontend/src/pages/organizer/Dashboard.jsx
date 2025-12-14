import { useState, useEffect } from 'react';
import axios from '../../lib/axios';
import { Calendar, Users, Gavel, BarChart3, Plus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    totalParticipants: 0,
    totalJudges: 0
  });
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('/organizer/events');
        if (res.data.success) {
          const events = res.data.data;
          setRecentEvents(events.slice(0, 5));
          
          // Calculate stats
          setStats({
            totalEvents: events.length,
            activeEvents: events.filter(e => e.status === 'ongoing').length,
            totalParticipants: events.reduce((sum, e) => sum + (e.participants?.length || 0), 0),
            totalJudges: events.reduce((sum, e) => sum + (e.judges?.length || 0), 0)
          });
        }
      } catch (error) {
        console.error('Error fetching organizer data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statCards = [
    { label: 'Total Events', value: stats.totalEvents, icon: Calendar, color: 'from-purple-500 to-pink-500' },
    { label: 'Active Events', value: stats.activeEvents, icon: BarChart3, color: 'from-green-500 to-emerald-500' },
    { label: 'Total Participants', value: stats.totalParticipants, icon: Users, color: 'from-blue-500 to-cyan-500' },
    { label: 'Assigned Judges', value: stats.totalJudges, icon: Gavel, color: 'from-orange-500 to-amber-500' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Organizer Dashboard</h1>
          <p className="text-gray-400 mt-1">Manage your hackathons and events</p>
        </div>
        <Link 
          to="/events/create" 
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={18} />
          Create Event
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-slate-900 rounded-xl border border-slate-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{stat.label}</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {loading ? '...' : stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Events */}
      <div className="bg-slate-900 rounded-xl border border-slate-800">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Recent Events</h2>
          <Link to="/organizer/events" className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1">
            View All <ArrowRight size={16} />
          </Link>
        </div>
        <div className="p-6">
          {loading ? (
            <p className="text-gray-500">Loading events...</p>
          ) : recentEvents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No events yet</p>
              <Link 
                to="/events/create" 
                className="text-purple-400 hover:text-purple-300"
              >
                Create your first event →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentEvents.map(event => (
                <div key={event._id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-white">{event.title}</h3>
                    <p className="text-sm text-gray-400">
                      {new Date(event.startDate).toLocaleDateString()} • {event.participants?.length || 0} participants
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded text-xs capitalize ${
                      event.status === 'ongoing' ? 'bg-green-500/20 text-green-400' :
                      event.status === 'upcoming' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {event.status}
                    </span>
                    <Link 
                      to={`/organizer/events/${event._id}`}
                      className="text-purple-400 hover:text-purple-300 text-sm"
                    >
                      Manage
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

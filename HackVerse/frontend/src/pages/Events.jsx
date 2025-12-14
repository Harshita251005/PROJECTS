import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import axios from '../lib/axios';
import toast from 'react-hot-toast';
import { getRandomImage } from '../utils/imageUtils';

import { useAuth } from '../context/AuthContext';

const Events = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const [trackFilter, setTrackFilter] = useState('all');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const params = {};
        if (filter !== 'all') params.status = filter;
        if (search) params.search = search;
  
        const response = await axios.get('/events', { params });
        if (response.data.success) {
          setEvents(response.data.events);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        toast.error('Failed to load events');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [filter, search]);



  const trackOptions = useMemo(() => {
    const tracks = new Set();
    events.forEach(event => {
      event.tracks?.forEach(track => {
        if (track?.name) {
          tracks.add(track.name);
        }
      });
    });
    return Array.from(tracks);
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesTrack = trackFilter === 'all' || event.tracks?.some(track => track.name === trackFilter);
      return matchesTrack;
    });
  }, [events, trackFilter]);



  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold gradient-text mb-2">Hackathon Events</h1>
              <p className="text-gray-400">Discover and join exciting hackathons</p>
            </div>
            {user?.role === 'organizer' && (
              <Link to="/events/create" className="btn-primary">
                Create Event
              </Link>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-4 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="Search events..."
                className="input-field flex-1"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select
                className="input-field md:w-48"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Events</option>
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
            </div>



            {trackOptions.length > 0 && (
              <div className="flex flex-wrap gap-3 items-center">
                <p className="text-sm text-gray-400">Tracks:</p>
                <button
                  onClick={() => setTrackFilter('all')}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    trackFilter === 'all'
                      ? 'bg-secondary-600/20 text-secondary-100 border-secondary-400'
                      : 'border-slate-700 text-gray-400 hover:border-secondary-500 hover:text-white'
                  }`}
                >
                  All Tracks
                </button>
                {trackOptions.map((track) => (
                  <button
                    key={track}
                    onClick={() => setTrackFilter(track)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      trackFilter === track
                        ? 'bg-secondary-600/20 text-secondary-100 border-secondary-400'
                        : 'border-slate-700 text-gray-400 hover:border-secondary-500 hover:text-white'
                    }`}
                  >
                    {track}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Events Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="spinner"></div>
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <Link
                  key={event._id}
                  to={`/events/${event._id}`}
                  className="card hover:scale-105 transition-transform group"
                >
                  <img
                    src={(event.image && event.image.startsWith('http')) ? event.image : getRandomImage(event._id)}
                    alt={event.title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                    onError={(e) => {
                      e.target.onerror = null; 
                      e.target.src = getRandomImage(event._id);
                    }}
                  />
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary-400 transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {event.description}
                  </p>
                  <div className="space-y-3 text-sm text-gray-300">
                    <div className="flex items-center justify-between">
                      <span>
                        📅 {new Date(event.startDate).toLocaleDateString()} →{' '}
                        {new Date(event.endDate).toLocaleDateString()}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          event.status === 'upcoming'
                            ? 'bg-blue-900/30 text-blue-400'
                            : event.status === 'ongoing'
                            ? 'bg-green-900/30 text-green-400'
                            : event.status === 'completed'
                            ? 'bg-gray-900/40 text-gray-300'
                            : 'bg-rose-900/40 text-rose-300'
                        }`}
                      >
                        {event.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-wide text-gray-400">Phase</span>
                      <span className="text-white font-semibold capitalize">
                        {event.currentPhase?.replace('_', ' ') || 'registration'}
                      </span>
                    </div>
                    {event.tracks?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {event.tracks.slice(0, 3).map((track) => (
                          <span
                            key={track.name}
                            className="px-2 py-1 rounded-full bg-slate-800/70 text-xs text-gray-200 border border-slate-700"
                          >
                            {track.name}
                          </span>
                        ))}
                        {event.tracks.length > 3 && (
                          <span className="text-xs text-gray-500">+{event.tracks.length - 3} more</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-700 text-sm text-gray-400 flex justify-between">
                    <span>👥 {event.participants?.length || 0} participants</span>
                    <span>🏆 {event.teams?.length || 0} teams</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="card text-center py-12">
              <p className="text-gray-400 text-lg">No events found</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Events;

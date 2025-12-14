import { useState, useEffect } from 'react';
import axios from '../../lib/axios';
import { Calendar, MapPin, Users, Gavel, Plus, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get('/organizer/events');
        if (res.data.success) {
          setEvents(res.data.data);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = events.filter(event => {
    const matchesFilter = filter === 'all' || event.status === filter;
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });


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
    // Simple deterministic hash from id string
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return images[hash % images.length];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">My Events</h1>
          <p className="text-gray-400 mt-1">Manage hackathons you've created</p>
        </div>
        <Link 
          to="/events/create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={18} />
          Create Event
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'upcoming', 'ongoing', 'completed'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                filter === status 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-slate-800 text-gray-400 hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-gray-500 col-span-full">Loading events...</p>
        ) : filteredEvents.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 mb-4">No events found</p>
            <Link to="/events/create" className="text-purple-400 hover:text-purple-300">
              Create your first event →
            </Link>
          </div>
        ) : (
          filteredEvents.map(event => (
            <div key={event._id} className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden group hover:border-purple-500/50 transition-colors">
              {/* Banner */}
              <div className="h-32 bg-slate-800 relative">
                <img 
                  src={(event.image && event.image.startsWith('http')) ? event.image : getRandomImage(event._id)} 
                  alt={event.title} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = getRandomImage(event._id);
                  }}
                />
                <span className={`absolute top-2 right-2 px-2 py-1 rounded text-xs capitalize ${
                  event.status === 'ongoing' ? 'bg-green-500/80' :
                  event.status === 'upcoming' ? 'bg-blue-500/80' :
                  'bg-gray-500/80'
                } text-white`}>
                  {event.status}
                </span>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors">
                  {event.title}
                </h3>
                
                <div className="mt-3 space-y-2 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    <span>{new Date(event.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} />
                    <span>{event.venue || 'Online'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={14} />
                    <span>{event.participants?.length || 0} participants</span>
                  </div>

                </div>

                {/* Actions */}
                <div className="mt-4 pt-4 border-t border-slate-800 flex gap-2">
                  <Link
                    to={`/events/${event._id}/manage`}
                    className="flex-1 py-2 text-center rounded bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 text-sm font-medium transition-colors"
                  >
                    Manage
                  </Link>

                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Events;

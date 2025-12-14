import { useState, useEffect } from 'react';
import axios from '../../lib/axios';
import { Search, Plus, Calendar, MapPin, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get('/events'); // Using public events endpoint for now, should be admin specific if needed
        if (res.data.success) {
          setEvents(res.data.events);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);


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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Event Management</h1>
          <p className="text-gray-400 mt-1">Oversee all hackathons and events.</p>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-gray-500">Loading events...</p>
        ) : events.length === 0 ? (
          <p className="text-gray-500">No events found.</p>
        ) : (
          events.map((event) => (
            <div key={event._id} className="card group hover:border-cyan-500/50 transition-colors">
              <div className="h-32 -mx-6 -mt-6 mb-4 bg-slate-800 relative overflow-hidden">
                <img 
                  src={(event.image && event.image.startsWith('http')) ? event.image : getRandomImage(event._id)} 
                  alt={event.title} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = getRandomImage(event._id);
                  }}
                />
                <div className="absolute top-2 right-2 px-2 py-1 rounded bg-black/50 backdrop-blur text-xs text-white capitalize">
                  {event.status}
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                {event.title}
              </h3>
              
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Calendar size={14} />
                  <span>{new Date(event.startDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={14} />
                  <span>{event.location || 'Online'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={14} />
                  <span>{event.participants?.length || 0} participants</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-800 flex gap-2">

                <Link 
                  to={`/events/${event._id}`}
                  className="w-full py-2 text-center rounded border border-slate-700 hover:bg-slate-800 text-sm text-gray-300 transition-colors"
                >
                  View
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Events;

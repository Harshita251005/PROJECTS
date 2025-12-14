import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import axios from '../lib/axios';
import toast from 'react-hot-toast';
import EventEditForm from '../components/organizer/EventEditForm';

const EventEdit = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axios.get(`/events/${id}`);
        if (response.data.success) {
          const eventData = response.data.event;
          // Verify ownership
          if (eventData.organizer._id !== user.id && user.role !== 'admin') {
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
    };
    fetchEvent();
  }, [id, user.id, user.role, navigate]);



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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
              <Link to="/events" className="hover:text-white">Events</Link>
              <span>/</span>
              <Link to={`/events/${id}`} className="hover:text-white">{event.title}</Link>
              <span>/</span>
              <span className="text-white">Edit</span>
            </div>
            <h1 className="text-3xl font-bold text-white">Edit Event</h1>
          </div>

          <EventEditForm event={event} />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default EventEdit;

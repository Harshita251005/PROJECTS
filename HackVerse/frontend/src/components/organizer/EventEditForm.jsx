import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from '../../lib/axios';

const EventEditForm = ({ event }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    maxTeamSize: 4,
    status: 'upcoming',
    venue: '',
    prizes: '',
    rules: '',
    image: '',
  });

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        description: event.description || '',
        startDate: event.startDate ? new Date(event.startDate).toISOString().split('T')[0] : '',
        endDate: event.endDate ? new Date(event.endDate).toISOString().split('T')[0] : '',
        maxTeamSize: event.maxTeamSize || 4,
        status: event.status || 'upcoming',
        venue: event.venue || '',
        prizes: event.prizes || '',
        rules: event.rules || '',
        image: event.image || '',
      });
    }
  }, [event]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.put(`/events/${event._id}`, formData);
      if (response.data.success) {
        toast.success('Event updated successfully');
        navigate(`/events/${event._id}/manage`);
      }
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error(error.response?.data?.message || 'Failed to update event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Info Section */}
      <div className="card">
        <h3 className="text-xl font-bold text-white mb-6">Basic Information</h3>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Event Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="input-field w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="input-field w-full"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="input-field w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">End Date</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="input-field w-full"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Max Team Size</label>
              <input
                type="number"
                name="maxTeamSize"
                value={formData.maxTeamSize}
                onChange={handleChange}
                min="1"
                className="input-field w-full"
                required
              />
            </div>
            {/* Status is managed automatically */}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Venue</label>
            <input
              type="text"
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              className="input-field w-full"
              placeholder="e.g., Online or Physical Address"
            />
          </div>
        </div>
      </div>

      {/* Media Section removed as Cloudinary is not configured */}

      {/* Details Section */}
      <div className="card">
        <h3 className="text-xl font-bold text-white mb-6">Additional Details</h3>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Prizes</label>
            <textarea
              name="prizes"
              value={formData.prizes}
              onChange={handleChange}
              rows="4"
              className="input-field w-full"
              placeholder="List prizes and rewards..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Rules</label>
            <textarea
              name="rules"
              value={formData.rules}
              onChange={handleChange}
              rows="4"
              className="input-field w-full"
              placeholder="Event rules and guidelines..."
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => navigate(`/events/${event._id}/manage`)}
          className="btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary min-w-[120px] flex justify-center"
        >
          {loading ? <div className="spinner w-5 h-5"></div> : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export default EventEditForm;

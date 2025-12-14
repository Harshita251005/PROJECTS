import { useState } from 'react';
import { toast } from 'react-hot-toast';
import axios from '../../lib/axios';

const AnnouncementComposer = ({ eventId, onAnnouncementSent }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'both',
    recipientRoles: ['participant'],
    priority: 'normal',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRoleChange = (role) => {
    setFormData((prev) => {
      const roles = prev.recipientRoles.includes(role)
        ? prev.recipientRoles.filter((r) => r !== role)
        : [...prev.recipientRoles, role];
      return { ...prev, recipientRoles: roles };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.recipientRoles.length === 0) {
      toast.error('Please select at least one recipient group');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`/events/${eventId}/announcement`, formData);
      if (response.data.success) {
        toast.success('Announcement sent successfully!');
        setFormData({
          title: '',
          content: '',
          type: 'both',
          recipientRoles: ['participant'],
          priority: 'normal',
        });
        if (onAnnouncementSent) {
          onAnnouncementSent(response.data.data);
        }
      }
    } catch (error) {
      console.error('Error sending announcement:', error);
      toast.error(error.response?.data?.message || 'Failed to send announcement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3 className="text-xl font-bold text-white mb-6">Send Announcement</h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Submission Deadline Extended"
            className="input-field w-full"
            required
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Content <span className="text-red-500">*</span>
          </label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Write your announcement here..."
            rows="4"
            className="input-field w-full resize-none"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Delivery Type */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Delivery Method
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="email"
                  checked={formData.type === 'email'}
                  onChange={handleChange}
                  className="text-primary-500 focus:ring-primary-500"
                />
                <span className="text-gray-300">Email Only</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="broadcast"
                  checked={formData.type === 'broadcast'}
                  onChange={handleChange}
                  className="text-primary-500 focus:ring-primary-500"
                />
                <span className="text-gray-300">In-App Only</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="both"
                  checked={formData.type === 'both'}
                  onChange={handleChange}
                  className="text-primary-500 focus:ring-primary-500"
                />
                <span className="text-gray-300">Both</span>
              </label>
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Priority
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="input-field w-full"
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        {/* Recipients */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Recipients <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-4">
            {['participant'].map((role) => (
              <label key={role} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.recipientRoles.includes(role)}
                  onChange={() => handleRoleChange(role)}
                  className="rounded border-gray-600 text-primary-500 focus:ring-primary-500 bg-slate-800"
                />
                <span className="text-gray-300 capitalize">{role}s</span>
              </label>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex justify-center items-center"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Sending...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
                Send Announcement
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AnnouncementComposer;

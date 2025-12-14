import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import axios from '../lib/axios';
import toast from 'react-hot-toast';

const SubmitProject = () => {
  const { id } = useParams(); // Event ID
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [event, setEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    repositoryUrl: '',
    demoUrl: '',
    technologies: '',
  });

  const fetchEvent = useCallback(async () => {
    try {
      const response = await axios.get(`/events/${id}`);
      if (response.data.success) {
        setEvent(response.data.event);
        // Basic check if user is a participant
        const isParticipant = response.data.event.participants?.some(
          (p) => p._id === user.id || p._id === user._id
        );
        if (!isParticipant) {
             toast.error('You must be a registered participant to submit a project.');
             navigate(`/events/${id}`);
        }
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      toast.error('Failed to load event details');
    }
  }, [id, navigate, user._id, user.id]);

  useEffect(() => {
    fetchEvent();
  }, [id, fetchEvent]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Fetch user's team for this event
      const teamRes = await axios.get('/users/my-teams');
      if (teamRes.data.success) {
        const teams = teamRes.data.teams;
        // Find team for this event. Note: team.event might be an object or ID depending on population
        const myTeam = teams.find(t => 
          t.event === id || t.event?._id === id
        );

        if (!myTeam) {
          toast.error('You must join a team to submit a project');
          navigate(`/events/${id}`);
          return;
        }

        // Check if user is leader
        // myTeam.leader can be object or ID
        const leaderId = myTeam.leader?._id || myTeam.leader;
        if (leaderId !== user.id && leaderId !== user._id) {
           toast.error('Only the Team Leader can submit the project');
           navigate(`/events/${id}`);
           return;
        }

        const submissionData = {
          eventId: id,
          teamId: myTeam._id,
          title: formData.title,
          description: formData.description,
          repoLink: formData.repositoryUrl,
          demoLink: formData.demoUrl,
          technologies: formData.technologies.split(',').map(t => t.trim()),
        };

        const res = await axios.post('/submissions', submissionData);

        if (res.data.success) {
          toast.success('Project submitted successfully!');
          navigate(`/events/${id}`);
        }
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit project');
    } finally {
      setLoading(false);
    }
  };

  if (!event) return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
          <div className="spinner"></div>
      </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <Navbar />
      <div className="flex-1 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Submit Project</h1>
            <p className="text-gray-400">for {event.title}</p>
          </div>

          <div className="card bg-slate-900 border border-slate-800 rounded-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Project Title</label>
                <input
                  type="text"
                  name="title"
                  required
                  className="input-field w-full bg-slate-950 border-slate-700 focus:border-primary-500"
                  placeholder="e.g., HackVerse Platform"
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  name="description"
                  required
                  rows="4"
                  className="input-field w-full bg-slate-950 border-slate-700 focus:border-primary-500"
                  placeholder="Describe your project, the problem it solves, and its key features..."
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Repository URL</label>
                  <input
                    type="url"
                    name="repositoryUrl"
                    required
                    className="input-field w-full bg-slate-950 border-slate-700 focus:border-primary-500"
                    placeholder="https://github.com/username/project"
                    value={formData.repositoryUrl}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Demo URL (Optional)</label>
                  <input
                    type="url"
                    name="demoUrl"
                    className="input-field w-full bg-slate-950 border-slate-700 focus:border-primary-500"
                    placeholder="https://project-demo.com"
                    value={formData.demoUrl}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Technologies Used</label>
                <input
                  type="text"
                  name="technologies"
                  required
                  className="input-field w-full bg-slate-950 border-slate-700 focus:border-primary-500"
                  placeholder="e.g., React, Node.js, MongoDB, Socket.io"
                  value={formData.technologies}
                  onChange={handleChange}
                />
                <p className="text-xs text-gray-500 mt-1">Separate technologies with commas</p>
              </div>

              <div className="pt-6 flex gap-4">
                <button
                  type="button"
                  onClick={() => navigate(`/events/${id}`)}
                  className="px-6 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1"
                >
                  {loading ? 'Submitting...' : 'Submit Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SubmitProject;

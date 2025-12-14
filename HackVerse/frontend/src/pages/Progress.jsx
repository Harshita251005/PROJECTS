import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import axios from '../lib/axios';
import toast from 'react-hot-toast';

const Progress = () => {
  const { user } = useAuth();
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      const response = await axios.get('/submissions/progress');
      if (response.data.success) {
        setProgressData(response.data.progress);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
      toast.error('Failed to load progress data');
    } finally {
      setLoading(false);
    }
  };



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

  // Admin view: no personal progress, show a simple dashboard link
  // Admin view: redirect to admin dashboard
  if (user?.role === 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Redirecting to Admin Dashboard...</p>
          <Link to="/admin" className="btn-primary">Go to Admin Dashboard</Link>
        </div>
      </div>
    );
  }

  const metrics = progressData?.metrics || {};

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-4xl font-bold text-white mb-2">Progress Tracking</h1>
            <p className="text-gray-400">Monitor your hackathon journey and showcase your achievements.</p>
          </div>

          {/* Overall Progress Card */}
          <div className="card mb-8 bg-gradient-to-br from-primary-900/30 to-secondary-900/30 border-primary-500/30">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Overall Progress</h2>
                <p className="text-gray-400 text-sm mt-1">Your hackathon journey completion</p>
              </div>
              <div className="text-right">
                <div className="text-5xl font-bold text-primary-400">{metrics.completionPercentage}%</div>
                <p className="text-gray-400 text-sm mt-1">Complete</p>
              </div>
            </div>
            {/* Progress Bar */}
            <div className="relative w-full h-4 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-1000 ease-out"
                style={{ width: `${metrics.completionPercentage}%` }}
              />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card hover:scale-105 transition-transform">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Events Joined</p>
                  <p className="text-3xl font-bold text-white mt-1">{metrics.totalEvents || 0}</p>
                </div>
                <div className="w-12 h-12 bg-primary-600/20 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🎯</span>
                </div>
              </div>
            </div>
            <div className="card hover:scale-105 transition-transform">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Teams Joined</p>
                  <p className="text-3xl font-bold text-white mt-1">{metrics.totalTeams || 0}</p>
                </div>
                <div className="w-12 h-12 bg-secondary-600/20 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">👥</span>
                </div>
              </div>
            </div>
            <div className="card hover:scale-105 transition-transform">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Submissions</p>
                  <p className="text-3xl font-bold text-white mt-1">{metrics.totalSubmissions || 0}</p>
                </div>
                <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📝</span>
                </div>
              </div>
            </div>
            <div className="card hover:scale-105 transition-transform">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Finalized</p>
                  <p className="text-3xl font-bold text-white mt-1">{metrics.finalizedSubmissions || 0}</p>
                </div>
                <div className="w-12 h-12 bg-amber-600/20 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">✅</span>
                </div>
              </div>
            </div>
          </div>



          {/* Submissions Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Submissions by Status */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Submission Status</h2>
              <div className="space-y-4">
                {Object.entries(progressData?.submissionsByStatus || {}).map(([status, submissions]) => (
                  submissions.length > 0 && (
                    <div key={status} className="card">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-white capitalize">{status}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm ${status === 'draft' ? 'bg-yellow-900/30 text-yellow-400' : status === 'finalized' ? 'bg-blue-900/30 text-blue-400' : status === 'reviewed' ? 'bg-green-900/30 text-green-400' : 'bg-gray-900/30 text-gray-400'}`}>
                          {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {submissions.map((sub) => (
                          <div key={sub._id} className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                            <p className="text-white font-medium">{sub.title}</p>
                            <p className="text-sm text-gray-400 mt-1">{sub.event?.title}</p>
                            <p className="text-xs text-gray-500 mt-1">Team: {sub.team?.name} • Version {sub.version}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                ))}
                {metrics.totalSubmissions === 0 && (
                  <div className="card text-center py-8">
                    <p className="text-gray-400 mb-4">No submissions yet</p>
                    <Link to="/teams" className="btn-primary inline-block">Join a Team to Start</Link>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Teams */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Your Teams</h2>
              <div className="space-y-4">
                {progressData?.teams?.length > 0 ? (
                  progressData.teams.map((team) => (
                    <Link key={team._id} to={`/teams/${team._id}`} className="card block hover:border-primary-500 transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-white">{team.name}</h3>
                          <p className="text-sm text-gray-400 mt-1">{team.event?.title || 'Event not specified'}</p>
                          <div className="flex items-center mt-2 space-x-2">
                            <span className="text-xs text-gray-500">{team.members?.length || 0} members</span>
                            {team.leader?.toString() === user?._id?.toString() && (
                              <span className="px-2 py-1 bg-primary-900/30 text-primary-400 text-xs rounded">Leader</span>
                            )}
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs ${team.event?.status === 'upcoming' ? 'bg-blue-900/30 text-blue-400' : team.event?.status === 'ongoing' ? 'bg-green-900/30 text-green-400' : 'bg-gray-900/30 text-gray-400'}`}>
                          {team.event?.status || 'N/A'}
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="card text-center py-8">
                    <p className="text-gray-400 mb-4">No teams yet</p>
                    <Link to="/teams" className="btn-secondary inline-block">Browse Teams</Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Progress;

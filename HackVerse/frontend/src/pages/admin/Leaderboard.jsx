import { useState, useEffect } from 'react';
import axios from '../../lib/axios';
import { Trophy, ExternalLink, Github, Youtube, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const Leaderboard = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const res = await axios.get('/submissions');
      if (res.data.success) {
        setSubmissions(res.data.submissions);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast.error(error.response?.data?.message || 'Failed to load submissions: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Project Submissions</h1>
          <p className="text-gray-400 mt-1">Review and evaluate all team projects.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-400">Loading submissions...</p>
        </div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/50 rounded-xl border border-slate-800">
          <Trophy size={48} className="mx-auto text-slate-700 mb-4" />
          <p className="text-gray-400">No projects submitted yet.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {submissions.map((sub) => (
            <div key={sub._id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 transition-all hover:border-slate-700">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-white">{sub.title}</h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                            sub.status === 'finalized' ? 'bg-green-900/30 text-green-400' :
                            sub.status === 'draft' ? 'bg-yellow-900/30 text-yellow-400' :
                            'bg-blue-900/30 text-blue-400'
                        }`}>
                            {sub.status}
                        </span>
                    </div>
                    <p className="text-gray-400 mb-3">{sub.description}</p>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                        <span className="flex items-center gap-1">
                            <span className="font-semibold text-gray-300">Team:</span> {sub.team?.name || 'Unknown'}
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="font-semibold text-gray-300">Event:</span> {sub.event?.title || 'Unknown'}
                        </span>
                        {sub.team?.leader && (
                             <span className="flex items-center gap-1">
                                <span className="font-semibold text-gray-300">Leader:</span> {sub.team.leader.name}
                            </span>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {sub.repoLink && (
                            <a href={sub.repoLink} target="_blank" rel="noopener noreferrer" 
                               className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm transition-colors">
                                <Github size={16} /> Repository
                            </a>
                        )}
                        {sub.demoLink && (
                            <a href={sub.demoLink} target="_blank" rel="noopener noreferrer" 
                               className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg text-sm transition-colors">
                                <ExternalLink size={16} /> Live Demo
                            </a>
                        )}
                        {sub.videoLink && (
                            <a href={sub.videoLink} target="_blank" rel="noopener noreferrer" 
                               className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm transition-colors">
                                <Youtube size={16} /> Video
                            </a>
                        )}
                         {sub.slidesLink && (
                            <a href={sub.slidesLink} target="_blank" rel="noopener noreferrer" 
                               className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 rounded-lg text-sm transition-colors">
                                <FileText size={16} /> Slides
                            </a>
                        )}
                    </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;

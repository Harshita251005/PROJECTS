import { useState, useEffect } from 'react';
import axios from '../../lib/axios';
import { Trophy, ExternalLink, Github, Youtube, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const ProjectList = ({ eventId }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (eventId) {
      const fetchSubmissions = async () => {
        try {
          const res = await axios.get(`/submissions/event/${eventId}`);
          if (res.data.success) {
            setSubmissions(res.data.submissions);
          }
        } catch (error) {
          console.error('Error fetching submissions:', error);
          toast.error('Failed to load project submissions');
        } finally {
          setLoading(false);
        }
      };
      
      fetchSubmissions();
    }
  }, [eventId]);



  const handleReview = async (id, status, remark = '') => {
    try {
      const res = await axios.put(`/submissions/${id}/review`, { status, remark });
      if (res.data.success) {
        toast.success(`Project ${status} successfully`);
        // Refresh list locally
        setSubmissions(submissions.map(sub => 
          sub._id === id ? { ...sub, status, rejectionRemark: remark } : sub
        ));
      }
    } catch (error) {
      console.error('Error reviewing submission:', error);
      toast.error('Failed to update status');
    }
  };

  const handleReject = (id) => {
    const remark = window.prompt("Enter rejection remark (optional):");
    if (remark !== null) {
      handleReview(id, 'rejected', remark);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="spinner"></div>
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-900/50 rounded-xl border border-slate-800">
        <Trophy size={48} className="mx-auto text-slate-700 mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">No Projects Yet</h3>
        <p className="text-gray-400">Teams haven't submitted any projects for this event yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">
          Submitted Projects <span className="text-gray-400 text-sm font-normal ml-2">({submissions.length})</span>
        </h3>
      </div>

      <div className="grid gap-6">
        {submissions.map((sub) => (
          <div key={sub._id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 transition-all hover:border-slate-700">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-white">{sub.title}</h3>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                    sub.status === 'finalized' ? 'bg-green-900/30 text-green-400' :
                    sub.status === 'rejected' ? 'bg-red-900/30 text-red-400' :
                    sub.status === 'draft' ? 'bg-yellow-900/30 text-yellow-400' :
                    'bg-blue-900/30 text-blue-400'
                  }`}>
                    {sub.status === 'finalized' ? 'Approved' : sub.status}
                  </span>
                </div>
                <p className="text-gray-400 mb-3">{sub.description}</p>
                {sub.rejectionRemark && sub.status === 'rejected' && (
                  <div className="bg-red-900/20 border border-red-900/50 p-2 rounded mb-3 text-sm text-red-300">
                    <strong>Remark:</strong> {sub.rejectionRemark}
                  </div>
                )}
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <span className="font-semibold text-gray-300">Team:</span> {sub.team?.name || 'Unknown'}
                  </span>
                  {sub.team?.members && (
                    <span className="flex items-center gap-1">
                      <span className="font-semibold text-gray-300">Members:</span> {sub.team.members.length}
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

              {/* Approval Actions */}
              <div className="flex items-center gap-2 mt-4 md:mt-0">
                 {sub.status !== 'finalized' && (
                  <button 
                  onClick={() => handleReview(sub._id, 'finalized')}
                  className="p-2 bg-green-900/30 hover:bg-green-900/50 text-green-400 rounded-lg transition-colors border border-green-900/50"
                  title="Approve Submission"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </button>
                 )}
                {sub.status !== 'rejected' && (
                   <button 
                   onClick={() => handleReject(sub._id)}
                   className="p-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-lg transition-colors border border-red-900/50"
                   title="Reject Submission"
                 >
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
                )}
               
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectList;

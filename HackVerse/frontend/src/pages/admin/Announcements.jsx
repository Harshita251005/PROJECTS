import { useState, useEffect } from 'react';
import axios from '../../lib/axios';
import { Bell } from 'lucide-react';
import toast from 'react-hot-toast';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await axios.get('/admin/announcements');
      if (res.data.success) {
        setAnnouncements(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Global Announcements</h1>
          <p className="text-gray-400 mt-1">Manage system-wide notifications.</p>
        </div>

      </div>



      <div className="space-y-4">
        {loading ? (
          <p className="text-gray-500">Loading announcements...</p>
        ) : announcements.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/50 rounded-xl border border-slate-800">
            <Bell size={48} className="mx-auto text-slate-700 mb-4" />
            <p className="text-gray-400">No announcements yet.</p>
          </div>
        ) : (
          announcements.map((announcement) => (
            <div key={announcement._id} className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{announcement.title}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs uppercase font-bold ${
                      announcement.priority === 'urgent' ? 'bg-red-900/30 text-red-400' :
                      announcement.priority === 'high' ? 'bg-orange-900/30 text-orange-400' :
                      'bg-blue-900/30 text-blue-400'
                    }`}>
                      {announcement.priority}
                    </span>
                    <span className="text-xs text-gray-500 bg-slate-800 px-2 py-0.5 rounded">
                      {announcement.type}
                    </span>
                  </div>
                  <p className="text-gray-300 whitespace-pre-wrap">{announcement.content}</p>
                  <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
                    <span>By: {announcement.sentBy?.name || 'Admin'}</span>
                    <span>Target: {announcement.recipientRoles.join(', ')}</span>
                    <span>{new Date(announcement.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Announcements;

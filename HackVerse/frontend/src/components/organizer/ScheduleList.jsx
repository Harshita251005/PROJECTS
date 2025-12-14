import { useState } from 'react';
import axios from '../../lib/axios';
import toast from 'react-hot-toast';

const ScheduleList = ({ eventId }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState({
    title: '',
    startTime: '',
    endTime: '',
    description: '',
    type: 'session'
  });

  const fetchSchedule = async () => {
    try {
      const res = await axios.get(`/schedule/event/${eventId}`);
      if (res.data.success) {
        setItems(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  useState(() => {
    fetchSchedule();
  }, [eventId]);

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.title || !newItem.startTime || !newItem.endTime) return;

    try {
      setLoading(true);
      const response = await axios.post(`/schedule/event/${eventId}`, newItem);

      if (response.data.success) {
        toast.success('Schedule item added');
        setItems([...items, response.data.data]);
        setNewItem({ 
          title: '', 
          startTime: '', 
          endTime: '', 
          description: '', 
          type: 'session' 
        });
      }
    } catch (error) {
      console.error('Error adding schedule item:', error);
      toast.error('Failed to add item');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      setLoading(true);
      const response = await axios.delete(`/schedule/${itemId}`);

      if (response.data.success) {
        toast.success('Schedule item removed');
        setItems(items.filter(item => item._id !== itemId));
      }
    } catch (error) {
      console.error('Error removing schedule item:', error);
      toast.error('Failed to remove item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-xl font-bold text-white mb-4">Manage Schedule</h3>
        
        <form onSubmit={handleAddItem} className="mb-6 bg-slate-800 p-4 rounded-lg border border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Start Time</label>
              <input
                type="datetime-local"
                required
                className="input-field w-full text-sm"
                value={newItem.startTime}
                onChange={(e) => setNewItem({ ...newItem, startTime: e.target.value })}
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">End Time</label>
              <input
                type="datetime-local"
                required
                className="input-field w-full text-sm"
                value={newItem.endTime}
                onChange={(e) => setNewItem({ ...newItem, endTime: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
             <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-400 mb-1">Activity Title</label>
              <input
                type="text"
                required
                placeholder="e.g., Opening Ceremony"
                className="input-field w-full text-sm"
                value={newItem.title}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
              />
            </div>
            <div>
               <label className="block text-sm font-medium text-gray-400 mb-1">Type</label>
               <select 
                  className="input-field w-full text-sm"
                  value={newItem.type}
                  onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
               >
                 <option value="session">Session</option>
                 <option value="workshop">Workshop</option>
                 <option value="talk">Talk</option>
                 <option value="break">Break</option>
                 <option value="ceremony">Ceremony</option>
                 <option value="other">Other</option>
               </select>
            </div>
          </div>
          <div className="mb-4">
             <label className="block text-sm font-medium text-gray-400 mb-1">Description (Optional)</label>
             <input
                type="text"
                placeholder="Brief details about this activity"
                className="input-field w-full text-sm"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              />
          </div>
          <div className="flex justify-end">
            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary text-sm px-4 py-2"
            >
              {loading ? 'Adding...' : 'Add to Schedule'}
            </button>
          </div>
        </form>

        <div className="space-y-3">
          {items.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No schedule items added yet.</p>
          ) : (
             items.sort((a,b) => new Date(a.startTime) - new Date(b.startTime)).map((item) => (
              <div key={item._id} className="flex items-start justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
                <div className="flex gap-4">
                   <div className="flex flex-col items-center justify-center min-w-[60px] px-2 py-1 bg-slate-900 rounded border border-slate-700">
                     <span className="text-xs text-gray-400">{new Date(item.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric'})}</span>
                     <span className="text-sm font-bold text-white">{new Date(item.startTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit'})}</span>
                   </div>
                   <div>
                     <h4 className="font-semibold text-white">{item.title} <span className="text-xs font-normal text-gray-500 ml-2 border border-gray-700 px-1 rounded">{item.type}</span></h4>
                     {item.description && <p className="text-sm text-gray-400">{item.description}</p>}
                     <p className="text-xs text-gray-500 mt-1">Ends: {new Date(item.endTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit'})}</p>
                   </div>
                </div>
                <button 
                  onClick={() => handleRemoveItem(item._id)}
                  disabled={loading}
                  className="text-gray-500 hover:text-red-400 transition-colors p-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleList;

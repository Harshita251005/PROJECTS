import { useState, useEffect, useCallback } from 'react';
import axios from '../../lib/axios';
import { MessageSquare, CheckCircle, Clock, User, Calendar, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const Messages = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchTickets = useCallback(async () => {
    try {
      const res = await axios.get('/support', {
        params: { status: filter === 'all' ? undefined : filter }
      });
      console.log('Support response:', res.data);
      if (res.data.success && Array.isArray(res.data.data)) {
        setTickets(res.data.data);
      } else {
        console.error('Invalid tickets data:', res.data);
        setTickets([]);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchTickets();
  }, [filter, fetchTickets]);

  const resolveTicket = async (id) => {
    try {
      const res = await axios.put(`/support/${id}/resolve`);
      if (res.data.success) {
        toast.success('Ticket marked as resolved');
        // Update local state to reflect change without refetch
        setTickets(tickets.map(ticket => 
          ticket._id === id ? { ...ticket, status: 'resolved' } : ticket
        ));
      }
    } catch (error) {
      console.error('Error resolving ticket:', error);
      toast.error('Failed to resolve ticket');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-emerald-500/10 text-emerald-400';
      case 'resolved': return 'bg-blue-500/10 text-blue-400';
      case 'closed': return 'bg-gray-500/10 text-gray-400';
      default: return 'bg-slate-700 text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Support Messages</h1>
          <p className="text-gray-400 mt-1">Manage user inquiries and support tickets.</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button 
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === 'all' ? 'bg-slate-800 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('open')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === 'open' ? 'bg-slate-800 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Open
          </button>
          <button 
            onClick={() => setFilter('resolved')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === 'resolved' ? 'bg-slate-800 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Resolved
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading messages...</div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl bg-slate-900/50">
            <MessageSquare size={48} className="mx-auto text-slate-700 mb-4" />
            <h3 className="text-lg font-medium text-white">No messages found</h3>
            <p className="text-gray-500">No support tickets match the current filter.</p>
          </div>
        ) : (
          Array.isArray(tickets) && tickets.map((ticket) => (
            <div key={ticket._id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors">
              <div className="flex flex-col md:flex-row gap-4 justify-between md:items-start">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                    <span className="text-xs text-slate-500">#{ticket._id.slice(-6)}</span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(ticket.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white">{ticket.subject}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{ticket.description}</p>
                </div>
                
                <div className="flex flex-col items-end gap-3 min-w-[200px]">
                   <div className="flex items-center gap-2 text-sm text-gray-300 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                     <User size={14} className="text-cyan-400" />
                     <span>{ticket.user?.name || 'Guest User'}</span>
                   </div>
                   <div className="text-xs text-gray-500">{ticket.user?.email || 'No email provided'}</div>
                   
                   {ticket.status === 'open' && (
                     <button 
                       onClick={() => resolveTicket(ticket._id)}
                       className="mt-2 flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg text-sm font-medium transition-all"
                     >
                       <CheckCircle size={16} />
                       Mark Resolved
                     </button>
                   )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
  
export default Messages;

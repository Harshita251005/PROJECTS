import { useState } from 'react';
import axios from '../../lib/axios';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

const TicketList = ({ tickets, onUpdate }) => {
  const [resolving, setResolving] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const handleResolve = async (ticketId) => {
    setResolving(ticketId);
    try {
      const response = await axios.put(`/support/${ticketId}/resolve`);
      if (response.data.success) {
        toast.success('Ticket resolved');
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error('Resolve error:', error);
      toast.error('Failed to resolve ticket');
    } finally {
      setResolving(null);
    }
  };

  const handleDelete = async (ticketId) => {
    if (!window.confirm('Are you sure you want to delete this ticket?')) return;
    
    setDeleting(ticketId);
    try {
      const response = await axios.delete(`/support/${ticketId}`);
      if (response.data.success) {
        toast.success('Ticket deleted');
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete ticket');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-4">
      {tickets.map((ticket) => (
        <div key={ticket._id} className="card border border-slate-800 bg-slate-900/50 hover:bg-slate-900 transition-colors">
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide ${
                  ticket.status === 'resolved' ? 'bg-green-900/30 text-green-400' : 'bg-amber-900/30 text-amber-400'
                }`}>
                  {ticket.status}
                </span>
                <span className="text-xs text-gray-500">
                  {format(new Date(ticket.createdAt), 'MMM d, yyyy • HH:mm')}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-white">
                {ticket.subject || 'No Subject'}
              </h3>
            </div>
            <div className="flex gap-2">
              {ticket.status !== 'resolved' && (
                <button
                  onClick={() => handleResolve(ticket._id)}
                  disabled={resolving === ticket._id}
                  className="text-sm px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                >
                  {resolving === ticket._id ? '...' : 'Resolve'}
                </button>
              )}
              <button
                onClick={() => handleDelete(ticket._id)}
                disabled={deleting === ticket._id}
                className="text-gray-400 hover:text-red-400 p-1 transition-colors"
                title="Delete Ticket"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          <div className="bg-slate-950/50 p-4 rounded-lg mb-3 text-gray-300 text-sm whitespace-pre-wrap">
            {ticket.message}
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white font-bold">
              {ticket.name ? ticket.name.charAt(0).toUpperCase() : '?'}
            </div>
            <span>{ticket.name} ({ticket.email})</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TicketList;

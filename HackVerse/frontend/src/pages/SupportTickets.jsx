import React, { useState, useEffect } from 'react';

import Navbar from '../components/Navbar';

const SupportTickets = () => {

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/support', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setTickets(data.data);
      } else {
        setError(data.message);
      }
    } catch {
      setError('Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  const resolveTicket = async (id) => {
    try {
      const response = await fetch(`http://localhost:4000/api/support/${id}/resolve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setTickets(tickets.map(ticket => 
          ticket._id === id ? { ...ticket, status: 'resolved' } : ticket
        ));
      }
    } catch (err) {
      console.error('Error resolving ticket:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Support Tickets</h1>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-600 py-12">{error}</div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {tickets.map((ticket) => (
                <li key={ticket._id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium text-gray-900">{ticket.subject}</h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      ticket.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {ticket.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{ticket.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div>
                      <span className="font-medium">{ticket.user?.name || 'Anonymous'}</span>
                      <span className="mx-2">•</span>
                      <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                    </div>
                    {ticket.status === 'open' && (
                      <button
                        onClick={() => resolveTicket(ticket._id)}
                        className="text-indigo-600 hover:text-indigo-900 font-medium"
                      >
                        Mark as Resolved
                      </button>
                    )}
                  </div>
                </li>
              ))}
              {tickets.length === 0 && (
                <li className="p-12 text-center text-gray-500">
                  No support tickets found
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportTickets;

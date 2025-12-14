import { useState } from 'react';
import { Link } from 'react-router-dom';

const ParticipantList = ({ participants, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');
 // all, team, solo

  const filteredParticipants = participants?.filter((p) => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Note: Backend doesn't currently send team status in participant list
    // This would be an enhancement for later
    return matchesSearch;
  }) || [];

  const handleExport = () => {
    if (!participants?.length) return;

    const headers = ['Name', 'Email', 'Joined Date'];
    const csvContent = [
      headers.join(','),
      ...participants.map(p => [
        `"${p.name}"`,
        `"${p.email}"`,
        `"${new Date().toLocaleDateString()}"` // We don't have join date in simple participant list
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'participants.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!participants?.length) {
    return (
      <div className="text-center py-12 bg-slate-900/50 rounded-xl border border-slate-800">
        <svg className="w-16 h-16 mx-auto text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h3 className="text-lg font-medium text-white mb-1">No participants yet</h3>
        <p className="text-gray-400">Share your event to get people to register!</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h3 className="text-xl font-bold text-white">
          Participants <span className="text-gray-400 text-sm font-normal">({participants.length})</span>
        </h3>
        <div className="flex gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search participants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field py-2 pl-10 pr-4 text-sm w-full md:w-64"
            />
            <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button onClick={handleExport} className="btn-secondary py-2 px-4 text-sm flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-700 text-gray-400 text-sm uppercase tracking-wider">
              <th className="py-3 px-4">Participant</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {filteredParticipants.map((participant) => (
              <tr key={participant._id} className="hover:bg-slate-800/50 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold mr-3 overflow-hidden">
                      {participant.profilePicture ? (
                        <img src={participant.profilePicture} alt={participant.name} className="w-full h-full object-cover" />
                      ) : (
                        participant.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <span className="text-white font-medium">{participant.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-300">{participant.email}</td>
                <td className="py-3 px-4 text-right">
                  <Link 
                    to={`/profile/${participant._id}`}
                    className="text-primary-400 hover:text-primary-300 text-sm font-medium"
                  >
                    View Profile
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {filteredParticipants.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          No participants found matching "{searchTerm}"
        </div>
      )}
    </div>
  );
};

export default ParticipantList;

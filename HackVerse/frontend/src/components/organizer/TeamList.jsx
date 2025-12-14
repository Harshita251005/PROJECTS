import { useState } from 'react';
import { Link } from 'react-router-dom';

const TeamList = ({ teams, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTeams = teams?.filter((team) => {
    const matchesSearch = 
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.leader?.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  }) || [];

  const handleExport = () => {
    if (!teams?.length) return;

    const headers = ['Team Name', 'Leader', 'Members Count', 'Joined At'];
    const csvContent = [
      headers.join(','),
      ...teams.map(t => [
        `"${t.name}"`,
        `"${t.leader?.name || 'Unknown'}"`,
        `"${t.members?.length || 0}"`,
        `"${new Date(t.createdAt).toLocaleDateString()}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'teams.csv');
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

  if (!teams?.length) {
    return (
      <div className="text-center py-12 bg-slate-900/50 rounded-xl border border-slate-800">
        <svg className="w-16 h-16 mx-auto text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h3 className="text-lg font-medium text-white mb-1">No teams yet</h3>
        <p className="text-gray-400">Wait for participants to form teams!</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h3 className="text-xl font-bold text-white">
          Teams <span className="text-gray-400 text-sm font-normal">({teams.length})</span>
        </h3>
        <div className="flex gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search teams..."
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
              <th className="py-3 px-4">Team Info</th>
              <th className="py-3 px-4">Members</th>
              <th className="py-3 px-4">Joined At</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {filteredTeams.map((team) => (
              <tr key={team._id} className="hover:bg-slate-800/50 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex flex-col">
                    <span className="text-white font-medium">{team.name}</span>
                    <span className="text-gray-400 text-xs">Leader: {team.leader?.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex -space-x-2">
                    {team.members?.slice(0, 5).map((member, idx) => (
                      <div key={idx} className="w-8 h-8 rounded-full bg-slate-700 border border-slate-800 flex items-center justify-center text-xs text-white overflow-hidden" title={member.name}>
                        {member.profilePicture ? (
                          <img src={member.profilePicture} alt={member.name} className="w-full h-full object-cover" />
                        ) : (
                          member.name?.charAt(0).toUpperCase()
                        )}
                      </div>
                    ))}
                    {team.members?.length > 5 && (
                      <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs text-white">
                        +{team.members.length - 5}
                      </div>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-300">
                  {new Date(team.createdAt).toLocaleDateString()}
                  <p className="text-xs text-gray-500">{new Date(team.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                </td>
                <td className="py-3 px-4 text-right flex items-center justify-end gap-2">
                  <Link 
                    to={`/messages?chatId=${team._id}`}
                    className="text-gray-400 hover:text-white transition-colors"
                    title="Message Team"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </Link>
                  <Link 
                    to={`/teams/${team._id}`}
                    className="text-primary-400 hover:text-primary-300 text-sm font-medium"
                  >
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {filteredTeams.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          No teams found matching "{searchTerm}"
        </div>
      )}
    </div>
  );
};

export default TeamList;

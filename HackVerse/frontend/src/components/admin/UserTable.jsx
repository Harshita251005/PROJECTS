import { useState } from 'react';
import axios from '../../lib/axios';
import { toast } from 'react-hot-toast';

const UserTable = ({ users, onUpdate }) => {
  const [updating, setUpdating] = useState(null);

  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;

    setUpdating(userId);
    try {
      const response = await axios.put(`/users/${userId}/role`, { role: newRole });
      if (response.data.success) {
        toast.success('User role updated successfully');
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error('Update role error:', error);
      toast.error(error.response?.data?.message || 'Failed to update role');
    } finally {
      setUpdating(null);
    }
  };

  const roles = ['participant', 'organizer', 'judge', 'mentor', 'admin'];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-700 text-gray-400 text-sm uppercase tracking-wider">
            <th className="p-4">User</th>
            <th className="p-4">Email</th>
            <th className="p-4">Role</th>
            <th className="p-4">Joined</th>
            <th className="p-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {users.map((user) => (
            <tr key={user._id} className="hover:bg-slate-800/50 transition-colors">
              <td className="p-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold mr-3 overflow-hidden">
                    {user.profilePicture ? (
                      <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="font-medium text-white">{user.name}</span>
                </div>
              </td>
              <td className="p-4 text-gray-300">{user.email}</td>
              <td className="p-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize
                  ${user.role === 'admin' ? 'bg-red-900/30 text-red-400' :
                    user.role === 'organizer' ? 'bg-purple-900/30 text-purple-400' :
                    user.role === 'judge' ? 'bg-amber-900/30 text-amber-400' :
                    user.role === 'mentor' ? 'bg-emerald-900/30 text-emerald-400' :
                    'bg-blue-900/30 text-blue-400'
                  }`}>
                  {user.role}
                </span>
              </td>
              <td className="p-4 text-gray-400 text-sm">
                {new Date(user.createdAt).toLocaleDateString()}
              </td>
              <td className="p-4 text-right">
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user._id, e.target.value)}
                  disabled={updating === user._id}
                  className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-primary-500"
                >
                  {roles.map(role => (
                    <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;

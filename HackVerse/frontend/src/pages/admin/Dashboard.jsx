import { useEffect, useState } from 'react';
import axios from '../../lib/axios';
import { 
  Users, 
  Trophy, 
  Calendar, 
  FileText, 
  TrendingUp, 
  Activity,
  AlertTriangle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/admin/stats');
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  const { counts, roles, recentActivity } = stats || {};

  const statCards = [
    { label: 'Total Users', value: counts?.users || 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Total Teams', value: counts?.teams || 0, icon: Trophy, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { label: 'Total Events', value: counts?.events || 0, icon: Calendar, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { label: 'System Health', value: 'Healthy', icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Welcome back, Admin. Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Role Distribution */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">User Distribution</h2>
          <div className="space-y-4">
            {roles?.map((role) => {
              const total = counts?.users || 1;
              const percentage = Math.round((role.count / total) * 100);
              return (
                <div key={role._id}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-300 capitalize">{role._id}</span>
                    <span className="text-gray-400">{role.count} users ({percentage}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity?.map((log) => (
              <div key={log._id} className="flex items-start gap-3 text-sm">
                <div className="mt-1 p-1.5 rounded bg-slate-800 text-gray-400">
                  <FileText size={14} />
                </div>
                <div>
                  <p className="text-gray-300">
                    <span className="font-medium text-white">{log.admin?.name}</span>
                    {' '}{log.action.toLowerCase().replace('_', ' ')}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(log.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
            {(!recentActivity || recentActivity.length === 0) && (
              <p className="text-gray-500 text-sm">No recent activity.</p>
            )}
          </div>
          <div className="mt-6 pt-4 border-t border-slate-800">
            <Link to="/admin/audit" className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
              View all logs <TrendingUp size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

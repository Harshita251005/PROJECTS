import { useState, useEffect } from 'react';
import axios from '../../lib/axios';
import { Activity, Server, Database, Cpu, AlertTriangle, CheckCircle } from 'lucide-react';

const System = () => {
  // Mock system health data for now, as backend endpoint for real-time system metrics isn't fully built
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await axios.get('/admin/system');
        if (res.data.success) {
          setHealth(res.data.data);
        }
      } catch (error) {
        console.error('Error fetching system health:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
    // Refresh every 30 seconds
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="text-white">Loading system stats...</div>;
  }

  if (!health) {
    return <div className="text-red-400">Failed to load system stats.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">System Health</h1>
        <p className="text-gray-400 mt-1">Monitor infrastructure and service status.</p>
      </div>

      {/* Status Banner */}
      <div className={`p-6 rounded-xl border ${
        health.status === 'healthy' 
          ? 'bg-emerald-500/10 border-emerald-500/20' 
          : 'bg-red-500/10 border-red-500/20'
      }`}>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-full ${
            health.status === 'healthy' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {health.status === 'healthy' ? <CheckCircle size={32} /> : <AlertTriangle size={32} />}
          </div>
          <div>
            <h2 className={`text-xl font-bold capitalize ${
              health.status === 'healthy' ? 'text-emerald-400' : 'text-red-400'
            }`}>
              System is {health.status}
            </h2>
            <p className="text-gray-400">All services are running optimally.</p>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400 text-sm">CPU Usage</span>
            <Cpu size={20} className="text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-2">{health.cpu}%</div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full" style={{ width: `${health.cpu}%` }}></div>
          </div>
        </div>

        <div className="card bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400 text-sm">Memory Usage</span>
            <Activity size={20} className="text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-2">{health.memory}%</div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-purple-500 h-full rounded-full" style={{ width: `${health.memory}%` }}></div>
          </div>
        </div>

        <div className="card bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400 text-sm">Database</span>
            <Database size={20} className="text-amber-400" />
          </div>
          <div className="text-xl font-bold text-white capitalize">{health.database}</div>
          <p className="text-xs text-gray-500 mt-1">Latency: 24ms</p>
        </div>

        <div className="card bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400 text-sm">Uptime</span>
            <Server size={20} className="text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-white">{health.uptime}</div>
          <p className="text-xs text-gray-500 mt-1">Since last deploy</p>
        </div>
      </div>
    </div>
  );
};

export default System;

import { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

import axios from '../lib/axios';
import { useSocket } from '../context/SocketContext';

const LiveLeaderboard = () => {
  const { id } = useParams();
  const { socket } = useSocket();

  const [event, setEvent] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await axios.get(`/submissions/event/${id}/leaderboard`);
      if (res.data.success) {
        setLeaderboard(res.data.leaderboard || res.data.data || []);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchEvent = useCallback(async () => {
    try {
      const res = await axios.get(`/events/${id}`);
      if (res.data.success) {
        setEvent(res.data.event);
      }
    } catch (error) {
      console.error('Error fetching event:', error);
    }
  }, [id]);

  useEffect(() => {
    fetchLeaderboard();
    fetchEvent();
    const interval = setInterval(fetchLeaderboard, 30000);
    return () => clearInterval(interval);
  }, [fetchLeaderboard, fetchEvent]);

  useEffect(() => {
    if (!socket) return;
    const room = `event_${id}`;
    socket.emit('joinRoom', room);

    const handleLeaderboardUpdate = ({ eventId }) => {
      if (eventId?.toString() === id) {
        fetchLeaderboard();
      }
    };

    socket.on('leaderboardUpdate', handleLeaderboardUpdate);

    return () => {
      socket.off('leaderboardUpdate', handleLeaderboardUpdate);
    };
  }, [socket, id, fetchLeaderboard]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-4"
          >
            <span>←</span> Back to Dashboard
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm text-cyan-300 uppercase tracking-wide font-semibold mb-2">
                Live Leaderboard
              </p>
              <h1 className="text-3xl font-bold text-white mb-2">
                {event?.title || 'Event Leaderboard'}
              </h1>
              <p className="text-slate-400">
                Scores refresh automatically whenever judges submit updates
              </p>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="spinner"></div>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-12 bg-slate-800 rounded-xl">
            <p className="text-gray-400">No submissions yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {leaderboard.map((team, index) => (
              <div key={team._id} className="flex items-center justify-between p-4 bg-slate-800 rounded-xl border border-slate-700">
                <div className="flex items-center gap-4">
                  <span className={`text-2xl font-bold w-8 text-center ${
                    index === 0 ? 'text-yellow-400' :
                    index === 1 ? 'text-gray-400' :
                    index === 2 ? 'text-amber-600' : 'text-slate-500'
                  }`}>#{index + 1}</span>
                  <div>
                    <h3 className="font-bold text-white">{team.project?.title || 'Untitled Project'}</h3>
                    <p className="text-sm text-cyan-400">{team.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">{team.score || 0}</p>
                  <p className="text-xs text-slate-500">points</p>
                </div>
              </div>
            ))}
            {lastUpdated && (
                <p className="text-center text-xs text-slate-500 mt-4">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                </p>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between mt-8 text-sm">
          <Link
            to="/messages"
            className="text-cyan-400 hover:text-cyan-300"
          >
            Need to brief judges? Ping them in Messages →
          </Link>
          <Link
            to={`/events/${id}`}
            className="text-violet-400 hover:text-violet-300"
          >
            View Event Overview →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LiveLeaderboard;

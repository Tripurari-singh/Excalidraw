"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Sparkles, Plus, ArrowRight } from 'lucide-react';
import { HTTP_BACKEND_URL } from '@/config';

export default function Dashboard() {
  const router = useRouter();
  const [roomName, setRoomName] = useState('');
  const [joinSlug, setJoinSlug] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const getToken = () => localStorage.getItem('token');

  const createRoom = async () => {
    if (!roomName.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(
        `${HTTP_BACKEND_URL}/room`,
        { name: roomName },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      router.push(`/canvas/${res.data.roomId}`);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async () => {
    if (!joinSlug.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${HTTP_BACKEND_URL}/room/${joinSlug}`);
      if (res.data.room) {
        router.push(`/canvas/${res.data.room.id}`);
      } else {
        setError('Room not found');
      }
    } catch {
      setError('Room not found');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col">
      <nav className="border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-red-500" />
            <span className="text-2xl font-bold text-white">DrawSpace</span>
          </div>
          <button
            onClick={() => { localStorage.removeItem('token'); router.push('/'); }}
            className="text-gray-300 hover:text-white transition-colors px-4 py-2 hover:bg-gray-800/50 rounded-lg"
          >
            Sign Out
          </button>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg flex flex-col gap-6">
          <h1 className="text-4xl font-bold text-white text-center">Your Boards</h1>

          {error && (
            <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-1">
              <Plus className="w-5 h-5 text-red-400" />
              <h2 className="text-lg font-semibold text-white">Create New Board</h2>
            </div>
            <input
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
              placeholder="Board name (e.g. my-project)"
              value={roomName}
              onChange={e => setRoomName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && createRoom()}
            />
            <button
              onClick={createRoom}
              disabled={loading || !roomName.trim()}
              className="group w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 disabled:from-gray-600 disabled:to-gray-500 text-white py-3 rounded-lg font-semibold transition-all hover:shadow-xl hover:shadow-red-500/30 flex items-center justify-center gap-2"
            >
              {loading ? 'Creating...' : (<>Create Board <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>)}
            </button>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-white">Join Existing Board</h2>
            <input
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
              placeholder="Enter board slug (e.g. my-project)"
              value={joinSlug}
              onChange={e => setJoinSlug(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && joinRoom()}
            />
            <button
              onClick={joinRoom}
              disabled={loading || !joinSlug.trim()}
              className="w-full bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
            >
              Join Board
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

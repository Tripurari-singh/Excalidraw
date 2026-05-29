"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Sparkles, Plus, ArrowRight, LogOut, Layout } from "lucide-react";
import { HTTP_BACKEND_URL } from "@/config";

interface Room {
  id: number;
  slug: string;
  adminId: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [roomName, setRoomName]   = useState("");
  const [joinSlug, setJoinSlug]   = useState("");
  const [rooms, setRooms]         = useState<Room[]>([]);
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [username, setUsername]   = useState("");

  // ─── Auth Guard ───────────────────────────────────────────────────────────
  // Runs once on mount — if no token, kick them to signin immediately
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/signin");
      return;
    }

    // Fetch current user info + existing rooms in parallel
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      axios.get(`${HTTP_BACKEND_URL}/me`, { headers }),
      axios.get(`${HTTP_BACKEND_URL}/rooms`, { headers }),
    ])
      .then(([meRes, roomsRes]) => {
        setUsername(meRes.data.user.username);
        setRooms(roomsRes.data.rooms);
      })
      .catch(() => {
        // Token is invalid or expired — clear it and redirect
        localStorage.removeItem("token");
        router.replace("/signin");
      });
  }, [router]);

  const getToken = () => localStorage.getItem("token") ?? "";

  // ─── Actions ──────────────────────────────────────────────────────────────

  const createRoom = async () => {
    if (!roomName.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(
        `${HTTP_BACKEND_URL}/room`,
        { name: roomName.trim() },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      router.push(`/canvas/${res.data.room.id}`);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to create room");
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async () => {
    if (!joinSlug.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${HTTP_BACKEND_URL}/room/${joinSlug.trim()}`);
      if (res.data.room) {
        router.push(`/canvas/${res.data.room.id}`);
      } else {
        setError("Room not found");
      }
    } catch {
      setError("Room not found. Check the slug and try again.");
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  // ─── UI ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col">

      {/* Navbar */}
      <nav className="border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-red-500" />
            <span className="text-2xl font-bold text-white">DrawSpace</span>
          </div>
          <div className="flex items-center gap-4">
            {username && (
              <span className="text-gray-400 text-sm">
                Hey, <span className="text-white font-medium">{username}</span>
              </span>
            )}
            <button
              onClick={signOut}
              className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors px-4 py-2 hover:bg-gray-800/50 rounded-lg"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12 flex flex-col gap-10">

        <h1 className="text-4xl font-bold text-white">Your Boards</h1>

        {error && (
          <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Create + Join side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Create */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-red-400" />
              <h2 className="text-lg font-semibold text-white">Create New Board</h2>
            </div>
            <input
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
              placeholder="e.g. my-project"
              value={roomName}
              onChange={e => setRoomName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && createRoom()}
            />
            <button
              onClick={createRoom}
              disabled={loading || !roomName.trim()}
              className="group w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 disabled:from-gray-600 disabled:to-gray-500 text-white py-3 rounded-lg font-semibold transition-all hover:shadow-xl hover:shadow-red-500/30 flex items-center justify-center gap-2"
            >
              {loading ? "Creating..." : (
                <>Create Board <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </div>

          {/* Join */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-white">Join Existing Board</h2>
            <input
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
              placeholder="Enter board slug"
              value={joinSlug}
              onChange={e => setJoinSlug(e.target.value)}
              onKeyDown={e => e.key === "Enter" && joinRoom()}
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

        {/* Room listing */}
        {rooms.length > 0 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Layout className="w-5 h-5 text-red-400" />
              All Boards
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {rooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => router.push(`/canvas/${room.id}`)}
                  className="group bg-gray-800/50 border border-gray-700 hover:border-red-500/50 rounded-xl p-5 text-left transition-all hover:shadow-lg hover:shadow-red-500/10 hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium group-hover:text-red-400 transition-colors">
                      {room.slug}
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-red-400 group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-gray-500 text-xs mt-1">Room #{room.id}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

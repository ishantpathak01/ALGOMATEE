import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Trophy,
  Flame,
  Clock,
  Code2,
  Calendar,
  ExternalLink,
  Award,
  ChevronRight,
  Filter,
  CheckCircle,
  Sparkles,
  Users,
} from "lucide-react";
import { getAllContests } from "../../APIs/contest";

export default function ContestsHub() {
  const [contests, setContests] = useState([]);
  const [tab, setTab] = useState("all"); // all, active, past
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContests = async () => {
      setLoading(true);
      const res = await getAllContests();
      if (res && res.data) {
        setContests(res.data);
      }
      setLoading(false);
    };
    fetchContests();
  }, []);

  const filtered = contests.filter((c) => {
    if (tab === "active") return c.status === "active";
    if (tab === "past") return c.status === "completed";
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-[#0a0f1d] to-black_A text-white pt-28 pb-20 px-4 md:px-12">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Hero Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-500/10 border border-blue-500/30 text-blue-400">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>AlgoMate Competitive Programming Arena</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
            Weekly Coding Contests
          </h1>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed">
            Curated and assigned by industry mentors. Test your skills against real
            LeetCode classics, GeeksforGeeks algorithms, and mentor-crafted DSA
            challenges to climb the leaderboard!
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <div className="flex space-x-2">
            {[
              { id: "all", label: "All Contests" },
              { id: "active", label: "Live & Active" },
              { id: "past", label: "Past Contests & Archives" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all ${
                  tab === t.id
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                    : "text-gray-400 hover:text-white bg-gray-900/60 hover:bg-gray-800 border border-gray-800"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <span className="text-xs text-gray-500 font-mono hidden sm:inline">
            Showing {filtered.length} Contests
          </span>
        </div>

        {/* Contests Grid */}
        {loading ? (
          <div className="py-20 text-center text-gray-400 space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
            <p>Loading contests...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center bg-gray-900/40 rounded-2xl border border-gray-800 text-gray-400 space-y-2">
            <Trophy className="w-10 h-10 mx-auto opacity-30 text-blue-400" />
            <p className="text-base font-medium">No contests found in this tab.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((contest) => {
              const isActive = contest.status === "active";
              const leetcodeCount =
                contest.problems?.filter((p) => p.source === "LeetCode").length || 0;
              const gfgCount =
                contest.problems?.filter((p) => p.source === "GeeksForGeeks")
                  .length || 0;
              const mentorCount =
                contest.problems?.filter(
                  (p) => p.source === "AlgoMate" || p.source === "Custom"
                ).length || 0;

              return (
                <div
                  key={contest._id || contest.id}
                  className={`relative rounded-2xl p-6 bg-gray-900/80 border transition-all duration-300 hover:shadow-2xl flex flex-col justify-between ${
                    isActive
                      ? "border-blue-500/40 hover:border-blue-400 shadow-blue-500/10"
                      : "border-gray-800 hover:border-gray-700"
                  }`}
                >
                  <div className="space-y-4">
                    {/* Status & Contest number */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {isActive ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            Live Contest
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-gray-800 text-gray-400 border border-gray-700">
                            Completed
                          </span>
                        )}
                        <span className="text-xs text-gray-400 font-mono">
                          #{contest.contestNumber || 42}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1.5 text-xs text-amber-400 font-semibold bg-amber-950/30 px-2.5 py-1 rounded-lg border border-amber-800/40">
                        <Trophy className="w-3.5 h-3.5 text-amber-400" />
                        <span>{contest.rewardCoins || 250} Coins</span>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                        {contest.title}
                      </h3>
                      <p className="text-gray-400 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                        {contest.description}
                      </p>
                    </div>

                    {/* Assigned by Mentor */}
                    <div className="flex items-center space-x-3 bg-gray-950/60 p-2.5 rounded-xl border border-gray-800/80">
                      <img
                        src={
                          contest.mentorAvatar ||
                          "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&auto=format&fit=crop&q=80"
                        }
                        alt={contest.mentorName}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-blue-400"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" /> Assigned by Mentor
                        </p>
                        <p className="text-xs font-bold text-gray-200 truncate">
                          {contest.mentorName || "AlgoMate Lead Mentor"}
                        </p>
                      </div>
                    </div>

                    {/* Problem Source Pills */}
                    <div className="flex flex-wrap gap-2 text-[11px]">
                      {leetcodeCount > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-950/40 text-amber-300 border border-amber-800/50">
                          {leetcodeCount}x LeetCode
                        </span>
                      )}
                      {gfgCount > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-950/40 text-emerald-300 border border-emerald-800/50">
                          {gfgCount}x GeeksForGeeks
                        </span>
                      )}
                      {mentorCount > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-purple-950/40 text-purple-300 border border-purple-800/50">
                          {mentorCount}x Mentor Special
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions & Meta */}
                  <div className="pt-6 border-t border-gray-800 mt-5 flex items-center justify-between">
                    <div className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{contest.durationMinutes || 90} mins</span>
                      <span className="mx-1">·</span>
                      <Users className="w-3.5 h-3.5" />
                      <span>{contest.leaderboard?.length || 12} participants</span>
                    </div>

                    <Link
                      to={`/contests/${contest._id || contest.id}`}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? "bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30"
                          : "bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white"
                      }`}
                    >
                      <span>{isActive ? "Enter Contest" : "View Results"}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

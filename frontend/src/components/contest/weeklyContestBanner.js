import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Trophy,
  Flame,
  Clock,
  Code2,
  ExternalLink,
  Award,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { getWeeklyContest } from "../../APIs/contest";

export default function WeeklyContestBanner() {
  const [contest, setContest] = useState(null);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const fetchContest = async () => {
      const res = await getWeeklyContest();
      if (res && res.data) {
        setContest(res.data);
      }
    };
    fetchContest();
  }, []);

  useEffect(() => {
    if (!contest?.endTime) return;

    const timer = setInterval(() => {
      const diff = new Date(contest.endTime).getTime() - new Date().getTime();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(timer);
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [contest]);

  if (!contest) return null;

  const leetcodeCount =
    contest.problems?.filter((p) => p.source === "LeetCode").length || 1;
  const gfgCount =
    contest.problems?.filter((p) => p.source === "GeeksForGeeks").length || 1;
  const mentorCount =
    contest.problems?.filter(
      (p) => p.source === "AlgoMate" || p.source === "Custom"
    ).length || 1;

  return (
    <div className="max-w-6xl mx-auto px-6 my-16 z-20 relative">
      <div className="relative rounded-3xl overflow-hidden p-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-2xl">
        <div className="bg-gray-950/95 backdrop-blur-xl rounded-[22px] p-6 md:p-10 text-white relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-blue-600/20 blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-purple-600/20 blur-3xl pointer-events-none"></div>

          {/* Header row: Live Badge + Assigned by Mentor */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6 mb-6">
            <div className="flex items-center space-x-3">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-emerald-400" />
                Live Weekly Coding Contest
              </span>
              <span className="text-xs text-gray-400 font-mono">
                #{contest.contestNumber || 42}
              </span>
            </div>

            {/* Mentor Attribution */}
            <div className="flex items-center space-x-3 bg-gray-900/80 border border-gray-800 px-4 py-2 rounded-2xl">
              <img
                src={
                  contest.mentorAvatar ||
                  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80"
                }
                alt={contest.mentorName}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-500/50"
              />
              <div className="text-left">
                <p className="text-[11px] text-blue-400 uppercase tracking-wider font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 inline" /> Assigned by Mentor
                </p>
                <p className="text-xs font-bold text-white">
                  {contest.mentorName || "AlgoMate Lead Mentor"}
                </p>
              </div>
            </div>
          </div>

          {/* Main content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left 7 cols: Title, description, problem breakdown */}
            <div className="lg:col-span-7 space-y-5">
              <div>
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
                  {contest.title}
                </h2>
                <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                  {contest.description}
                </p>
              </div>

              {/* Problem Pills: LeetCode + GFG + Mentor Problems */}
              <div className="flex flex-wrap gap-2.5 pt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-amber-950/40 border border-amber-800/60 text-amber-300">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  LeetCode Problems ({leetcodeCount})
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-emerald-950/40 border border-emerald-800/60 text-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  GeeksForGeeks Problems ({gfgCount})
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-purple-950/40 border border-purple-800/60 text-purple-300">
                  <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                  Mentor Exclusive DSA ({mentorCount})
                </span>
              </div>

              {/* Contest Questions preview list */}
              <div className="space-y-2 pt-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Contest Problem Set:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  {contest.problems?.slice(0, 3).map((prob, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-gray-900/60 border border-gray-800/80 hover:border-gray-700 transition-all flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            prob.source === "LeetCode"
                              ? "bg-amber-900/40 text-amber-400"
                              : prob.source === "GeeksForGeeks"
                              ? "bg-emerald-900/40 text-emerald-400"
                              : "bg-purple-900/40 text-purple-400"
                          }`}
                        >
                          {prob.source}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {prob.points || 100} pts
                        </span>
                      </div>
                      <p className="font-semibold text-gray-200 line-clamp-1">
                        {prob.title}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right 5 cols: Countdown Timer, Reward & Actions */}
            <div className="lg:col-span-5 bg-gradient-to-b from-gray-900/90 to-black/90 p-6 rounded-2xl border border-gray-800 space-y-5 text-center">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400 font-medium mb-3 flex items-center justify-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-400 inline" /> Contest Ends In:
                </p>

                {/* Countdown display */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-gray-800/80 p-2.5 rounded-xl border border-gray-700/60">
                    <span className="text-2xl md:text-3xl font-extrabold text-white font-mono">
                      {String(timeLeft.days).padStart(2, "0")}
                    </span>
                    <p className="text-[10px] uppercase text-gray-400 mt-1">Days</p>
                  </div>
                  <div className="bg-gray-800/80 p-2.5 rounded-xl border border-gray-700/60">
                    <span className="text-2xl md:text-3xl font-extrabold text-white font-mono">
                      {String(timeLeft.hours).padStart(2, "0")}
                    </span>
                    <p className="text-[10px] uppercase text-gray-400 mt-1">Hours</p>
                  </div>
                  <div className="bg-gray-800/80 p-2.5 rounded-xl border border-gray-700/60">
                    <span className="text-2xl md:text-3xl font-extrabold text-white font-mono">
                      {String(timeLeft.minutes).padStart(2, "0")}
                    </span>
                    <p className="text-[10px] uppercase text-gray-400 mt-1">Mins</p>
                  </div>
                  <div className="bg-gray-800/80 p-2.5 rounded-xl border border-gray-700/60">
                    <span className="text-2xl md:text-3xl font-extrabold text-blue-400 font-mono">
                      {String(timeLeft.seconds).padStart(2, "0")}
                    </span>
                    <p className="text-[10px] uppercase text-gray-400 mt-1">Secs</p>
                  </div>
                </div>
              </div>

              {/* Prize banner */}
              <div className="flex items-center justify-center space-x-2 text-xs py-2 px-3 bg-amber-950/30 border border-amber-800/40 rounded-xl text-amber-300">
                <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Win <strong>{contest.rewardCoins || 350} AlgoCoins</strong> + Verified Certificate
                </span>
              </div>

              {/* CTAs */}
              <div className="space-y-2 pt-1">
                <Link
                  to={`/contests/${contest._id || contest.id}`}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 hover:scale-[1.02] transition-all"
                >
                  <Code2 className="w-4 h-4" />
                  <span>Enter Contest Arena</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/contests"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-xs text-gray-300 hover:text-white bg-gray-800/60 hover:bg-gray-800 border border-gray-700 transition-all"
                >
                  <span>View All Weekly Contests & Leaderboards</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

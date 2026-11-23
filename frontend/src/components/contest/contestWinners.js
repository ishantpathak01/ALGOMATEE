import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Trophy, Crown } from "lucide-react";
import { getPublishedWinners } from "../../APIs/contest";

const fmt = (m) => {
  if (m === null || m === undefined) return "-";
  const total = Math.round(m * 60);
  const h = Math.floor(total / 3600);
  const mm = Math.floor((total % 3600) / 60);
  const ss = total % 60;
  if (h > 0) return `${h}h ${String(mm).padStart(2, "0")}m`;
  if (mm > 0) return `${mm}m ${String(ss).padStart(2, "0")}s`;
  return `${ss}s`;
};

const STYLE = {
  1: { medal: "\u{1F947}", label: "1st", ring: "ring-yellow-400", glow: "from-yellow-500/20 border-yellow-500/60", size: "w-20 h-20", lift: "md:-mt-4" },
  2: { medal: "\u{1F948}", label: "2nd", ring: "ring-gray-300", glow: "from-gray-400/20 border-gray-400/50", size: "w-16 h-16", lift: "" },
  3: { medal: "\u{1F949}", label: "3rd", ring: "ring-orange-400", glow: "from-orange-500/20 border-orange-500/50", size: "w-16 h-16", lift: "" },
};

/** Home screen: shows the winners the admin published, after the contest has ended. */
export default function ContestWinners() {
  const [contest, setContest] = useState(null);

  useEffect(() => {
    (async () => {
      const res = await getPublishedWinners(1);
      if (Array.isArray(res?.data) && res.data[0]) setContest(res.data[0]);
    })();
  }, []);

  if (!contest || !contest.winners?.length) return null;

  // podium order: 2nd, 1st, 3rd
  const byRank = (r) => contest.winners.find((w) => w.rank === r);
  const podium = [byRank(2), byRank(1), byRank(3)].filter(Boolean);

  return (
    <div className="max-w-6xl mx-auto px-6 my-16 z-20 relative">
      <div className="rounded-3xl p-1 bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 shadow-2xl">
        <div className="bg-gray-950/95 rounded-[22px] p-6 md:p-10 text-white">
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-amber-950/80 text-amber-300 border border-amber-800/80">
              <Trophy className="w-3.5 h-3.5" /> Contest Results
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold mt-3">{contest.title} - Winners</h2>
            <p className="text-gray-400 text-sm mt-1">
              Ended {new Date(contest.endTime).toLocaleDateString()} · Congratulations to our top performers!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            {podium.map((w) => {
              const st = STYLE[w.rank];
              return (
                <div key={w.userId} className={`rounded-2xl border bg-gradient-to-b ${st.glow} to-gray-900/60 p-5 text-center ${st.lift}`}>
                  <div className="text-3xl mb-2">{st.medal}</div>
                  <img
                    src={w.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(w.userName || "Coder")}`}
                    alt={w.userName}
                    className={`${st.size} rounded-full object-cover mx-auto ring-4 ${st.ring}`}
                  />
                  <p className="mt-3 font-bold text-lg flex items-center justify-center gap-1.5">
                    {w.rank === 1 && <Crown className="w-4 h-4 text-yellow-400" />}
                    {w.userName}
                  </p>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">{st.label} place</p>
                  <div className="mt-3 flex justify-center gap-2 text-xs">
                    <span className="px-2.5 py-1 rounded-lg bg-gray-900 border border-gray-800 text-emerald-400 font-semibold">{w.score} pts</span>
                    <span className="px-2.5 py-1 rounded-lg bg-gray-900 border border-gray-800 text-gray-300">
                      {w.problemsSolved}/{w.totalProblems} solved
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-gray-900 border border-gray-800 text-gray-300">{fmt(w.timeMinutes)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-8">
            <Link to="/contests" className="text-sm text-blue-400 hover:text-blue-300 font-semibold">
              View all contests →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

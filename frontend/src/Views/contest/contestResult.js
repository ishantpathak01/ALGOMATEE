import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Trophy, Clock, CheckCircle, XCircle, ArrowLeft, Target, AlertTriangle, Users } from "lucide-react";
import { getMyResult } from "../../APIs/contest";

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

const MEDAL = { 1: "\u{1F947}", 2: "\u{1F948}", 3: "\u{1F949}" };
const ord = (n) => (n % 10 === 1 && n % 100 !== 11 ? `${n}st` : n % 10 === 2 && n % 100 !== 12 ? `${n}nd` : n % 10 === 3 && n % 100 !== 13 ? `${n}rd` : `${n}th`);

const Stat = ({ icon: Icon, label, value, tone = "text-blue-400" }) => (
  <div className="rounded-2xl bg-gray-900/80 border border-gray-800 p-4 text-center">
    <Icon className={`w-5 h-5 mx-auto mb-1 ${tone}`} />
    <p className="text-2xl font-extrabold">{value}</p>
    <p className="text-[11px] uppercase tracking-wider text-gray-400 mt-0.5">{label}</p>
  </div>
);

export default function ContestResult() {
  const { contestId } = useParams();
  const [state, setState] = useState({ loading: true });

  useEffect(() => {
    (async () => {
      const r = await getMyResult(contestId);
      if (r?.status === 200 && r.data) setState({ loading: false, data: r.data });
      else setState({ loading: false, error: r?.message || "Could not load your result.", endTime: r?.endTime });
    })();
  }, [contestId]);

  const shell = (children) => (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-[#0a0f1d] to-black text-white pt-28 pb-20 px-4 md:px-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link to="/contests" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" /> All contests
        </Link>
        {children}
      </div>
    </div>
  );

  if (state.loading) {
    return shell(
      <div className="py-20 text-center text-gray-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-3"></div>
        Loading your result...
      </div>
    );
  }

  if (state.error) {
    return shell(
      <div className="py-16 text-center bg-gray-900/40 rounded-2xl border border-gray-800 space-y-2">
        <AlertTriangle className="w-10 h-10 mx-auto text-amber-400" />
        <p className="font-semibold">{state.error}</p>
        {state.endTime && (
          <p className="text-sm text-gray-400">Contest ends {new Date(state.endTime).toLocaleString()}.</p>
        )}
      </div>
    );
  }

  const { contest, me, totalParticipants, winners, winnersPublished } = state.data;

  return shell(
    <>
      <div className="text-center space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/10 border border-blue-500/30 text-blue-400">
          <Trophy className="w-3.5 h-3.5 text-amber-400" /> Your Result
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold">{contest.title}</h1>
        <p className="text-gray-400 text-sm">Ended {new Date(contest.endTime).toLocaleString()}</p>
      </div>

      {!me ? (
        <div className="py-12 text-center bg-gray-900/40 rounded-2xl border border-gray-800 text-gray-400">
          <p className="font-medium">You didn't take part in this contest.</p>
          <p className="text-sm mt-1">{totalParticipants} participant{totalParticipants === 1 ? "" : "s"} took part.</p>
        </div>
      ) : (
        <>
          <div className="rounded-3xl p-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500">
            <div className="bg-gray-950 rounded-[22px] p-8 text-center">
              <p className="text-xs uppercase tracking-wider text-gray-400">Your rank</p>
              <p className="text-6xl font-extrabold mt-1">
                {MEDAL[me.rank] || ""} {ord(me.rank)}
              </p>
              <p className="text-gray-400 text-sm mt-1">out of {totalParticipants} participant{totalParticipants === 1 ? "" : "s"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Stat icon={Target} label="Points" value={me.score} tone="text-amber-400" />
            <Stat icon={CheckCircle} label="Solved" value={`${me.solvedCount}/${me.totalProblems}`} tone="text-emerald-400" />
            <Stat icon={Clock} label="Total time" value={fmt(me.totalTimeMinutes)} />
            <Stat icon={XCircle} label="Wrong tries" value={me.wrongSubmissions} tone="text-rose-400" />
          </div>
          <p className="text-xs text-gray-500 -mt-4 text-center">
            Ranking: more points first; ties go to lower time. Time includes +5 min for each wrong try before a solve.
          </p>

          <div className="rounded-2xl bg-gray-900/80 border border-gray-800 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-800 font-semibold">Problem breakdown</div>
            <div className="divide-y divide-gray-800">
              {me.perProblem.map((p) => (
                <div key={p.problemId} className="px-5 py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{p.title}</p>
                    <p className="text-xs text-gray-400">
                      {p.attempts} attempt{p.attempts === 1 ? "" : "s"} · {p.solved ? `solved at ${fmt(p.minutes)}${p.penaltyMinutes ? ` (+${p.penaltyMinutes}m penalty)` : ""}` : p.lastVerdict}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm text-amber-300">{p.solved ? `+${p.points}` : `0/${p.points}`}</span>
                    {p.solved ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <XCircle className="w-5 h-5 text-gray-600" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {winnersPublished && winners.length > 0 && (
        <div className="rounded-2xl bg-gray-900/80 border border-amber-800/40 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-800 font-semibold flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400" /> Top performers
          </div>
          <div className="divide-y divide-gray-800">
            {winners.map((w) => (
              <div key={w.userId} className="px-5 py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-2xl">{MEDAL[w.rank]}</span>
                  <p className="font-medium truncate">{w.userName}</p>
                </div>
                <p className="text-xs text-gray-400 shrink-0">
                  {w.score} pts · {w.problemsSolved}/{w.totalProblems} solved · {fmt(w.timeMinutes)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

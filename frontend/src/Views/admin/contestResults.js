import React, { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import {
  getAllContests,
  getAdminResults,
  getAdminSubmissionCode,
  setContestWinners,
} from "../../APIs/contest";

const fmt = (m) => {
  if (m === null || m === undefined) return "—";
  const total = Math.round(m * 60); // minutes (decimal) -> seconds
  const h = Math.floor(total / 3600);
  const mm = Math.floor((total % 3600) / 60);
  const ss = total % 60;
  if (h > 0) return `${h}h ${String(mm).padStart(2, "0")}m ${String(ss).padStart(2, "0")}s`;
  if (mm > 0) return `${mm}m ${String(ss).padStart(2, "0")}s`;
  return `${ss}s`;
};
const when = (d) => (d ? new Date(d).toLocaleString() : "—");

export default function AdminContestResults({ embedded = false, initialContestId = "" }) {
  const [contests, setContests] = useState([]);
  const [contestId, setContestId] = useState("");
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(null); // expanded participant userId
  const [codeView, setCodeView] = useState(null);
  // Manual winners: { [userId]: 1 | 2 | 3 }. Loaded once per contest so the 10s refresh never wipes unsaved picks.
  const [picks, setPicks] = useState({});
  const [published, setPublished] = useState(false);
  const [saving, setSaving] = useState(false);
  const picksLoadedFor = useRef("");

  useEffect(() => {
    (async () => {
      const r = await getAllContests();
      const list = Array.isArray(r?.data) ? r.data : [];
      setContests(list);
      const wanted = list.find((c) => String(c._id) === String(initialContestId));
      if (wanted) setContestId(String(wanted._id));
      else if (list[0]) setContestId(String(list[0]._id));
    })();
  }, []);

  const load = useCallback(async () => {
    if (!contestId) return;
    const r = await getAdminResults(contestId);
    if (r?.status === 200 && r.data) {
      setReport(r.data);
      setPublished(!!r.data.winnersPublished);
      if (picksLoadedFor.current !== contestId) {
        const init = {};
        (r.data.winners || []).forEach((w) => (init[w.userId] = w.rank));
        setPicks(init);
        picksLoadedFor.current = contestId;
      }
      setError("");
    } else {
      setReport(null);
      setError(r?.message || "Could not load results.");
    }
  }, [contestId]);

  // live: refresh every 10 seconds
  useEffect(() => {
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, [load]);

  const setRank = (userId, rank) => {
    setPicks((prev) => {
      const next = { ...prev };
      if (rank) Object.keys(next).forEach((id) => { if (next[id] === rank) delete next[id]; }); // one person per rank
      if (rank) next[userId] = rank;
      else delete next[userId];
      return next;
    });
  };

  const saveWinners = async (publish) => {
    const winners = Object.entries(picks).map(([userId, rank]) => ({ userId, rank: Number(rank) }));
    if (publish && winners.length === 0) {
      toast.error("Pick at least one winner first.");
      return;
    }
    setSaving(true);
    const r = await setContestWinners(contestId, { winners, publish });
    setSaving(false);
    if (r?.status === 200) {
      toast.success(r.message || "Saved.");
      setPublished(!!r.data?.winnersPublished);
    } else {
      toast.error(r?.message || "Could not save winners.");
    }
  };

  const viewCode = async (subId) => {
    const r = await getAdminSubmissionCode(contestId, subId);
    setCodeView(r?.data || { code: r?.message || "Could not load code", language: "", userName: "" });
  };

  const exportCsv = () => {
    if (!report) return;
    const head = ["Rank", "Name", "Email", "Entered at", "Solved", "Points", "Ranking time (min, incl. penalty)", "Time to solve all (min)", "Wrong tries", "Submissions"];
    const lines = report.participants.map((p) =>
      [p.rank, p.name, p.email || "", when(p.enteredAt), `${p.solvedCount}/${p.totalProblems}`, p.score, p.totalTimeMinutes, p.timeToSolveAllMinutes ?? "", p.wrongSubmissions, p.totalSubmissions]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    );
    const blob = new Blob([[head.join(","), ...lines].join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${report.contest.title.replace(/[^a-z0-9]+/gi, "_")}_results.csv`;
    a.click();
  };

  return (
    <div className={embedded ? "text-white" : "min-h-screen bg-gray-950 text-white pt-24 pb-16 px-4"}>
      <div className={embedded ? "space-y-6" : "max-w-7xl mx-auto space-y-6"}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold">Contest Results (Admin)</h1>
            <p className="text-xs text-gray-400">Live from real submissions · refreshes every 10 seconds</p>
          </div>
          <div className="flex gap-2">
            <select
              value={contestId}
              onChange={(e) => { setContestId(e.target.value); setOpen(null); }}
              className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm"
            >
              {contests.map((c) => (
                <option key={c._id} value={c._id}>{c.title}</option>
              ))}
            </select>
            <button onClick={exportCsv} disabled={!report} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-sm font-semibold">
              Export CSV
            </button>
          </div>
        </div>

        {error && <div className="p-4 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-sm">{error}</div>}
        {!error && contests.length === 0 && <p className="text-gray-400 text-sm">No contests created yet.</p>}

        {report && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                ["Registered (entered)", report.summary.registered],
                ["Solved all questions", report.summary.solvedAll],
                ["Avg time to solve all", fmt(report.summary.avgTimeToSolveAll)],
                ["Time per participant", `${report.contest.durationMinutes} min`],
              ].map(([k, v]) => (
                <div key={k} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <p className="text-[11px] uppercase tracking-wider text-gray-400">{k}</p>
                  <p className="text-2xl font-bold mt-1">{v}</p>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-400">
              Window: {when(report.contest.startTime)} → {when(report.contest.endTime)} · A question scores only when ALL its test cases pass.
              Ranking = most points, then least time (each wrong try adds 5 min).
            </p>

            <div className="rounded-xl border border-amber-800/50 bg-amber-950/20 p-4 space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-amber-300">Top 3 winners (you choose manually)</p>
                  <p className="text-xs text-gray-400">
                    Set 1st / 2nd / 3rd in the “Winner” column below, then publish. Published winners show on the home
                    screen after the contest ends. Status:{" "}
                    <span className={published ? "text-emerald-400 font-semibold" : "text-gray-300 font-semibold"}>
                      {published ? "Published" : "Not published"}
                    </span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button disabled={saving} onClick={() => saveWinners(false)} className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-sm font-semibold border border-gray-700">
                    {published ? "Unpublish (keep picks)" : "Save draft"}
                  </button>
                  <button disabled={saving} onClick={() => saveWinners(true)} className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-gray-950 text-sm font-bold">
                    {published ? "Update published winners" : "Publish to home screen"}
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                {[1, 2, 3].map((rk) => {
                  const id = Object.keys(picks).find((u) => picks[u] === rk);
                  const person = id && report.participants.find((p) => p.userId === id);
                  return (
                    <span key={rk} className="px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800">
                      {["🥇 1st", "🥈 2nd", "🥉 3rd"][rk - 1]}: <b>{person ? person.name : "— not chosen —"}</b>
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-800">
              <table className="w-full text-sm">
                <thead className="bg-gray-900 text-gray-400 text-xs uppercase">
                  <tr>
                    {["#", "Participant", "Entered at", "Solved", "Points", "Ranking time", "Time to solve all", "Wrong tries", "Subs", "Winner"].map((h) => (
                      <th key={h} className="px-3 py-2 text-left whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {report.participants.length === 0 && (
                    <tr><td colSpan={10} className="px-3 py-6 text-center text-gray-500">Nobody has entered this contest yet.</td></tr>
                  )}
                  {report.participants.map((p) => (
                    <React.Fragment key={p.userId}>
                      <tr onClick={() => setOpen(open === p.userId ? null : p.userId)} className="border-t border-gray-800 hover:bg-gray-900/60 cursor-pointer">
                        <td className="px-3 py-2 font-mono font-bold">{p.rank}</td>
                        <td className="px-3 py-2">
                          <p className="font-semibold">{p.name}</p>
                          <p className="text-[11px] text-gray-500">{p.email}</p>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-300">{when(p.enteredAt)}</td>
                        <td className="px-3 py-2">{p.solvedCount}/{p.totalProblems}{p.allSolved && <span className="ml-1 text-emerald-400">✓</span>}</td>
                        <td className="px-3 py-2 font-mono text-emerald-400 font-bold">{p.score}</td>
                        <td className="px-3 py-2">{fmt(p.totalTimeMinutes)}</td>
                        <td className="px-3 py-2">{fmt(p.timeToSolveAllMinutes)}</td>
                        <td className="px-3 py-2">{p.wrongSubmissions}</td>
                        <td className="px-3 py-2">{p.totalSubmissions}</td>
                        <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={picks[p.userId] || ""}
                            onChange={(e) => setRank(p.userId, e.target.value ? Number(e.target.value) : 0)}
                            className="bg-gray-900 border border-gray-700 rounded-lg px-2 py-1 text-xs"
                          >
                            <option value="">—</option>
                            <option value="1">1st</option>
                            <option value="2">2nd</option>
                            <option value="3">3rd</option>
                          </select>
                        </td>
                      </tr>
                      {open === p.userId && (
                        <tr className="bg-gray-900/40">
                          <td colSpan={10} className="px-4 py-3">
                            <div className="grid gap-3 md:grid-cols-2">
                              {p.perProblem.map((q) => (
                                <div key={q.problemId} className="rounded-lg border border-gray-800 p-3 space-y-1">
                                  <div className="flex justify-between">
                                    <p className="font-semibold text-sm">{q.title}</p>
                                    <span className={q.solved ? "text-emerald-400 text-xs" : "text-gray-500 text-xs"}>
                                      {q.solved ? `Solved · +${q.points} pts` : "Not solved · 0 pts"}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-gray-400">
                                    {q.solved ? `Solved at ${fmt(q.minutes)} · ${q.wrongBeforeSolve} wrong before (+${q.penaltyMinutes}m penalty)` : `Best: ${q.bestPassed}/${q.totalTests} tests · ${q.lastVerdict}`}
                                  </p>
                                  {q.submissions.map((s) => (
                                    <div key={s.id} className="flex items-center justify-between text-[11px] text-gray-300">
                                      <span>{s.status} · {s.passed}/{s.total} · {s.language} · at {fmt(s.minutesFromEntry)}</span>
                                      <button onClick={() => viewCode(s.id)} className="text-blue-400 hover:text-blue-300">View code</button>
                                    </div>
                                  ))}
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {codeView && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setCodeView(null)}>
            <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-3xl max-h-[80vh] overflow-auto p-5" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between mb-3">
                <p className="font-semibold text-sm">{codeView.userName} · {codeView.language}</p>
                <button onClick={() => setCodeView(null)} className="text-gray-400 hover:text-white">Close</button>
              </div>
              <pre className="text-xs bg-gray-950 border border-gray-800 rounded-lg p-3 overflow-auto whitespace-pre-wrap">{codeView.code}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect, useCallback } from "react";
import {
  getAllContests,
  getAdminResults,
  getAdminSubmissionCode,
} from "../../APIs/contest";

const fmt = (m) => {
  if (m === null || m === undefined) return "—";
  const h = Math.floor(m / 60);
  const r = m % 60;
  return h > 0 ? `${h}h ${String(r).padStart(2, "0")}m` : `${r}m`;
};
const when = (d) => (d ? new Date(d).toLocaleString() : "—");

export default function AdminContestResults() {
  const [contests, setContests] = useState([]);
  const [contestId, setContestId] = useState("");
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(null); // expanded participant userId
  const [codeView, setCodeView] = useState(null);

  useEffect(() => {
    (async () => {
      const r = await getAllContests();
      const list = Array.isArray(r?.data) ? r.data : [];
      setContests(list);
      if (list[0]) setContestId(String(list[0]._id));
    })();
  }, []);

  const load = useCallback(async () => {
    if (!contestId) return;
    const r = await getAdminResults(contestId);
    if (r?.status === 200 && r.data) {
      setReport(r.data);
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
    <div className="min-h-screen bg-gray-950 text-white pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
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

            <div className="overflow-x-auto rounded-xl border border-gray-800">
              <table className="w-full text-sm">
                <thead className="bg-gray-900 text-gray-400 text-xs uppercase">
                  <tr>
                    {["#", "Participant", "Entered at", "Solved", "Points", "Ranking time", "Time to solve all", "Wrong tries", "Subs"].map((h) => (
                      <th key={h} className="px-3 py-2 text-left whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {report.participants.length === 0 && (
                    <tr><td colSpan={9} className="px-3 py-6 text-center text-gray-500">Nobody has entered this contest yet.</td></tr>
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
                      </tr>
                      {open === p.userId && (
                        <tr className="bg-gray-900/40">
                          <td colSpan={9} className="px-4 py-3">
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

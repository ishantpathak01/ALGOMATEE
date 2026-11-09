import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAppContext } from "../../../context/userContext";
import {
  createContest,
  getMentorContests,
} from "../../../APIs/contest";
import { getCodingSheet } from "../../../APIs/problem";

const DIFF = ["Easy", "Medium", "Hard"];
const TYPES = [
  { value: "weekly", label: "Weekly Contest" },
  { value: "special", label: "Special" },
  { value: "practice", label: "Practice" },
];

export default function MentorContests() {
  const { user } = useAppContext();
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [myProblems, setMyProblems] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "weekly",
    startTime: "",
    endTime: "",
  });

  // problems: mix of custom (from mentor sheet) + external LC/GFG
  const [problems, setProblems] = useState([
    {
      type: "custom",
      problemId: "",
      title: "",
      difficulty: "Medium",
      points: 100,
      link: "",
      platform: "AlgoMate",
    },
  ]);

  const load = async () => {
    setLoading(true);
    const res = await getMentorContests();
    if (res?.status === 200) setContests(res.data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (!user?._id) return;
    load();
    // load mentor's own coding problems for selection
    (async () => {
      const res = await getCodingSheet({ Id: user._id });
      if (res?.status === 200 && Array.isArray(res.data)) {
        setMyProblems(res.data);
      }
    })();
  }, [user?._id]);

  const addProblemRow = (kind = "custom") => {
    setProblems((prev) => [
      ...prev,
      {
        type: kind,
        problemId: "",
        title: "",
        difficulty: "Medium",
        points: kind === "custom" ? 100 : 150,
        link: "",
        platform:
          kind === "leetcode"
            ? "Leetcode"
            : kind === "gfg"
            ? "GeeksForGeeks"
            : "AlgoMate",
      },
    ]);
  };

  const updateProblem = (idx, field, value) => {
    setProblems((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      // auto fill title when selecting own problem
      if (field === "problemId" && value) {
        const found = myProblems.find((p) => p._id === value);
        if (found) {
          next[idx].title = found.Name;
          next[idx].difficulty = found.Level || "Medium";
          next[idx].type = "custom";
          next[idx].platform = "AlgoMate";
        }
      }
      return next;
    });
  };

  const removeProblem = (idx) => {
    setProblems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error("Title required");
    if (!form.startTime || !form.endTime)
      return toast.error("Start & end time required");
    if (problems.length === 0) return toast.error("Add at least one problem");

    for (const p of problems) {
      if (!p.title.trim()) return toast.error("Every problem needs a title");
      if ((p.type === "leetcode" || p.type === "gfg" || p.type === "external") && !p.link) {
        return toast.error("External problems need a link");
      }
    }

    setSubmitting(true);
    const payload = {
      ...form,
      mentorId: user._id,
      problems: problems.map((p) => ({
        ...p,
        points: Number(p.points) || 100,
      })),
    };
    const res = await createContest(payload);
    setSubmitting(false);
    if (res?.status === 200) {
      toast.success("Contest created!");
      setShowForm(false);
      setForm({
        title: "",
        description: "",
        type: "weekly",
        startTime: "",
        endTime: "",
      });
      setProblems([
        {
          type: "custom",
          problemId: "",
          title: "",
          difficulty: "Medium",
          points: 100,
          link: "",
          platform: "AlgoMate",
        },
      ]);
      load();
    } else {
      toast.error(res?.message || "Failed to create contest");
    }
  };

  if (!user?.Verified) {
    return (
      <div className="min-h-screen text-white text-lg opacity-50 flex justify-center items-center flex-col space-y-2">
        <h1>Your request has not been approved by the manager yet.</h1>
      </div>
    );
  }

  const card =
    "bg-slate-800/40 border border-slate-700/60 rounded-xl p-5 shadow-lg";

  return (
    <div className="container mx-auto px-4 py-6 text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Contests
          </h1>
          <p className="text-slate-400 text-sm">
            Create weekly coding contests with your own DSA questions or LeetCode / GFG links
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg font-medium transition"
        >
          {showForm ? "Close" : "+ New Contest"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className={`${card} mb-8 space-y-4`}>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-400">Title</label>
              <input
                className="w-full mt-1 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 outline-none focus:border-blue-400"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Weekly DSA Contest #12"
                required
              />
            </div>
            <div>
              <label className="text-sm text-slate-400">Type</label>
              <select
                className="w-full mt-1 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 outline-none focus:border-blue-400"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-400">Start</label>
              <input
                type="datetime-local"
                className="w-full mt-1 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 outline-none focus:border-blue-400"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm text-slate-400">End</label>
              <input
                type="datetime-local"
                className="w-full mt-1 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 outline-none focus:border-blue-400"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                required
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-slate-400">Description</label>
            <textarea
              className="w-full mt-1 bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 outline-none focus:border-blue-400 h-20 resize-none"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What will participants practice?"
            />
          </div>

          <div className="border-t border-slate-700 pt-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h3 className="font-semibold">Problems</h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => addProblemRow("custom")}
                  className="text-xs px-3 py-1.5 rounded bg-slate-700 hover:bg-slate-600"
                >
                  + Own DSA
                </button>
                <button
                  type="button"
                  onClick={() => addProblemRow("leetcode")}
                  className="text-xs px-3 py-1.5 rounded bg-orange-600/30 text-orange-300 hover:bg-orange-600/50"
                >
                  + LeetCode
                </button>
                <button
                  type="button"
                  onClick={() => addProblemRow("gfg")}
                  className="text-xs px-3 py-1.5 rounded bg-green-600/30 text-green-300 hover:bg-green-600/50"
                >
                  + GFG
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {problems.map((p, idx) => (
                <div
                  key={idx}
                  className="grid sm:grid-cols-6 gap-2 items-end bg-slate-900/50 p-3 rounded-lg"
                >
                  {p.type === "custom" ? (
                    <div className="sm:col-span-2">
                      <label className="text-xs text-slate-500">Your problem</label>
                      <select
                        className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-sm"
                        value={p.problemId}
                        onChange={(e) =>
                          updateProblem(idx, "problemId", e.target.value)
                        }
                      >
                        <option value="">Select from your sheet…</option>
                        {myProblems.map((mp) => (
                          <option key={mp._id} value={mp._id}>
                            {mp.Name} ({mp.Level})
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="sm:col-span-2">
                      <label className="text-xs text-slate-500">
                        {p.type === "leetcode" ? "LeetCode" : "GFG"} Link
                      </label>
                      <input
                        className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-sm"
                        placeholder="https://…"
                        value={p.link}
                        onChange={(e) => updateProblem(idx, "link", e.target.value)}
                      />
                    </div>
                  )}
                  <div>
                    <label className="text-xs text-slate-500">Title</label>
                    <input
                      className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-sm"
                      value={p.title}
                      onChange={(e) => updateProblem(idx, "title", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Difficulty</label>
                    <select
                      className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-sm"
                      value={p.difficulty}
                      onChange={(e) =>
                        updateProblem(idx, "difficulty", e.target.value)
                      }
                    >
                      {DIFF.map((d) => (
                        <option key={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Points</label>
                    <input
                      type="number"
                      className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-sm"
                      value={p.points}
                      onChange={(e) => updateProblem(idx, "points", e.target.value)}
                    />
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => removeProblem(idx)}
                      className="w-full text-red-300 text-sm py-1.5 border border-red-500/40 rounded hover:bg-red-500/10"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-500 px-6 py-2.5 rounded-lg font-medium disabled:opacity-50"
            >
              {submitting ? "Creating…" : "Create Contest"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-slate-400 text-center py-10">Loading…</p>
      ) : contests.length === 0 ? (
        <div className={`${card} text-center text-slate-400 py-12`}>
          No contests yet. Create your first weekly contest!
        </div>
      ) : (
        <div className="space-y-3">
          {contests.map((c) => (
            <div key={c._id} className={card}>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-lg">{c.title}</h3>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full border ${
                    c.status === "live"
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      : c.status === "upcoming"
                      ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
                      : "bg-slate-500/20 text-slate-300 border-slate-500/40"
                  }`}
                >
                  {c.status}
                </span>
                <span className="text-xs bg-slate-700 px-2 py-0.5 rounded">
                  {c.type}
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1">
                {c.problems?.length || 0} problems ·{" "}
                {new Date(c.startTime).toLocaleString()} →{" "}
                {new Date(c.endTime).toLocaleString()}
              </p>
              {c.description && (
                <p className="text-sm text-slate-300 mt-2">{c.description}</p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                {(c.problems || []).map((p, i) => (
                  <span
                    key={i}
                    className="text-xs bg-slate-900 border border-slate-600 px-2 py-1 rounded"
                  >
                    {p.platform}: {p.title} ({p.difficulty})
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

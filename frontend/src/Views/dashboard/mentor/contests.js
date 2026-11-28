import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Trophy,
  PlusCircle,
  Clock,
  Trash2,
  ExternalLink,
  Sparkles,
  Award,
  Layers,
  Code2,
  CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { getAllContests, createContest } from "../../../APIs/contest";
import { useAppContext } from "../../../context/userContext";

export default function MentorContests() {
  const { user } = useAppContext();
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Contest Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [rewardCoins, setRewardCoins] = useState(300);
  const [difficulty, setDifficulty] = useState("Intermediate");

  // Problems to include in contest
  const blankProblem = () => ({
    title: "",
    difficulty: "Easy",
    points: 20,
    statement: "",
    inputFormat: "",
    outputFormat: "",
    constraints: "",
    testcases: [{ input: "", output: "", isHidden: false }],
    mentorHint: "",
  });
  const [problems, setProblems] = useState([blankProblem()]);

  const loadContests = async () => {
    setLoading(true);
    const res = await getAllContests();
    if (res && res.data) {
      setContests(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadContests();
  }, []);

  const handleAddProblem = () => {
    setProblems([...problems, blankProblem()]);
  };

  const handleRemoveProblem = (idx) => {
    if (problems.length <= 1) {
      toast.error("At least one problem is required for a contest.");
      return;
    }
    setProblems(problems.filter((_, i) => i !== idx));
  };

  const handleUpdateProblem = (idx, field, value) => {
    const updated = [...problems];
    updated[idx][field] = value;
    if (field === "difficulty") {
      // suggested points, you can still type any number you like
      updated[idx].points = { Easy: 20, Medium: 25, Hard: 50 }[value] ?? updated[idx].points;
    }
    setProblems(updated);
  };

  const handleAddProblemTestCase = (probIdx) => {
    const updated = [...problems];
    if (!updated[probIdx].testcases) updated[probIdx].testcases = [];
    updated[probIdx].testcases.push({ input: "", output: "", isHidden: false });
    setProblems(updated);
  };

  const handleRemoveProblemTestCase = (probIdx, tcIdx) => {
    const updated = [...problems];
    if ((updated[probIdx].testcases || []).length <= 1) {
      toast.error("At least one testcase is required per problem.");
      return;
    }
    updated[probIdx].testcases = updated[probIdx].testcases.filter(
      (_, i) => i !== tcIdx
    );
    setProblems(updated);
  };

  const handleUpdateProblemTestCase = (probIdx, tcIdx, field, value) => {
    const updated = [...problems];
    if (!updated[probIdx].testcases) updated[probIdx].testcases = [];
    updated[probIdx].testcases[tcIdx][field] = value;
    setProblems(updated);
  };

  const handleCreateContest = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a contest title.");
      return;
    }

    if (!startAt || !endAt) {
      toast.error("Please set the contest start and end date/time.");
      return;
    }
    const startMs = new Date(startAt).getTime();
    const endMs = new Date(endAt).getTime();
    if (!(endMs > startMs)) {
      toast.error("End time must be after the start time.");
      return;
    }
    if (!(Number(durationMinutes) > 0)) {
      toast.error("Enter the time each participant gets (minutes).");
      return;
    }

    for (const [i, pr] of problems.entries()) {
      if (!(pr.testcases || []).some((t) => !t.isHidden)) {
        toast.error(`Problem #${i + 1} needs at least one visible (sample) test case.`);
        return;
      }
    }

    const payload = {
      title,
      startTime: new Date(startAt).toISOString(),
      endTime: new Date(endAt).toISOString(),
      description,
      mentorName: user?.Name || "Senior Mentor",
      mentorBio: user?.Bio || "AlgoMate Competitive Programming Mentor",
      mentorAvatar: user?.Picture || "",
      durationMinutes: Number(durationMinutes),
      rewardCoins: Number(rewardCoins) || 300,
      difficulty,
      problems,
      isWeekly: true,
      status: "active",
    };

    toast.loading("Assigning and publishing weekly contest...", {
      id: "create-contest",
    });
    const res = await createContest(payload);
    if (res && (res.status === 201 || res.data)) {
      toast.success("Weekly Contest Assigned and Published Successfully!", {
        id: "create-contest",
      });
      setShowCreateModal(false);
      loadContests();
    } else {
      toast.error("Failed to assign contest.", { id: "create-contest" });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 text-white max-w-6xl space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-900/90 border border-gray-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center space-x-2 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Mentor Arena Management</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">
            Weekly Coding Contests
          </h1>
          <p className="text-gray-400 text-xs md:text-sm mt-1">
            Assign weekly coding contests with your own problems, test cases and points.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all shrink-0"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Assign New Contest</span>
        </button>
      </div>

      {/* Contests List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-200 flex items-center space-x-2">
          <span>Active & Scheduled Contests</span>
          <span className="text-xs text-gray-500 font-mono">
            ({contests.length})
          </span>
        </h2>

        {loading ? (
          <div className="py-16 text-center text-gray-400 space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
            <p>Loading contests...</p>
          </div>
        ) : contests.length === 0 ? (
          <div className="p-12 text-center bg-gray-900/50 rounded-2xl border border-gray-800 text-gray-400 space-y-3">
            <Trophy className="w-10 h-10 mx-auto opacity-30 text-amber-400" />
            <p className="font-semibold text-white">No Contests Created Yet</p>
            <p className="text-xs text-gray-500">
              Click "Assign New Contest" above to launch a weekly challenge for students!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {contests.map((c) => (
              <div
                key={c._id || c.id}
                className="bg-gray-900/80 border border-gray-800 hover:border-gray-700 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-800">
                      {c.status || "Active"}
                    </span>
                    <span className="text-xs text-amber-400 font-semibold flex items-center space-x-1">
                      <Trophy className="w-3.5 h-3.5 inline" />
                      <span>{c.rewardCoins || 300} Coins</span>
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white">{c.title}</h3>
                    <p className="text-gray-400 text-xs mt-1 line-clamp-2">
                      {c.description}
                    </p>
                  </div>

                  {/* Problem badges */}
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                      Assigned Problems ({c.problems?.length || 0}):
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {c.problems?.map((p, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-gray-800 text-gray-300 border border-gray-700"
                        >
                          {p.title || `Question ${idx + 1}`}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-800 flex items-center justify-between text-xs">
                  <div className="text-gray-400 flex items-center space-x-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{c.durationMinutes} min each</span>
                    <span>·</span>
                    <span>{c.startTime ? new Date(c.startTime).toLocaleString() : ""} → {c.endTime ? new Date(c.endTime).toLocaleString() : ""}</span>
                    <span>·</span>
                    <span>{c.participantCount || 0} contestants</span>
                  </div>

                  <Link
                    to={`/contests/${c._id || c.id}`}
                    className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all flex items-center space-x-1"
                  >
                    <span>View Arena</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assign Contest Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-3xl w-full max-w-3xl p-6 md:p-8 max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-gray-800 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <span>Assign Weekly Coding Contest</span>
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Add your own problems, test cases and points for each question.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-gray-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateContest} className="space-y-5">
              {/* Contest Title & Duration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">
                    Contest Title
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. AlgoMate Weekly Contest #43"
                    className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-300">
                      Contest opens (anyone can enter from)
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={startAt}
                      onChange={(e) => setStartAt(e.target.value)}
                      className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-300">
                      Contest closes (last time to enter)
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={endAt}
                      onChange={(e) => setEndAt(e.target.value)}
                      className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-300">
                      Time per participant (mins)
                    </label>
                    <input
                      type="number"
                      required
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(e.target.value)}
                      className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-300">
                      Reward Coins
                    </label>
                    <input
                      type="number"
                      required
                      value={rewardCoins}
                      onChange={(e) => setRewardCoins(e.target.value)}
                      className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300">
                  Contest Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain contest goals, interview topics covered..."
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Problems Section */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                  <label className="text-sm font-bold text-gray-200 flex items-center space-x-2">
                    <Code2 className="w-4 h-4 text-blue-400" />
                    <span>Contest Problem Set ({problems.length})</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddProblem}
                    className="flex items-center space-x-1 text-xs px-3 py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 transition-all"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>+ Add Problem</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {problems.map((prob, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-gray-950 border border-gray-800 space-y-3 relative group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold font-mono text-blue-400">
                          Problem #{idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveProblem(idx)}
                          className="text-gray-500 hover:text-red-400 p-1 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-[11px] text-gray-400">
                            Problem Title
                          </label>
                          <input
                            type="text"
                            required
                            value={prob.title}
                            onChange={(e) =>
                              handleUpdateProblem(idx, "title", e.target.value)
                            }
                            placeholder="e.g. Detect Cycle in Graph"
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-xs text-white"
                          />
                        </div>

                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[11px] text-gray-400">
                              Difficulty
                            </label>
                            <select
                              value={prob.difficulty}
                              onChange={(e) =>
                                handleUpdateProblem(
                                  idx,
                                  "difficulty",
                                  e.target.value
                                )
                              }
                              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-xs text-white"
                            >
                              <option value="Easy">Easy</option>
                              <option value="Medium">Medium</option>
                              <option value="Hard">Hard</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] text-gray-400">
                              Points (your choice, e.g. Easy 20 / Medium 25 / Hard 50)
                            </label>
                            <input
                              type="number"
                              value={prob.points}
                              onChange={(e) =>
                                handleUpdateProblem(
                                  idx,
                                  "points",
                                  Number(e.target.value)
                                )
                              }
                              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-xs text-white"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] text-gray-400">
                          Problem Statement (press Enter for new paragraphs)
                        </label>
                        <textarea
                          rows={5}
                          value={prob.statement}
                          onChange={(e) =>
                            handleUpdateProblem(idx, "statement", e.target.value)
                          }
                          placeholder={"Describe the problem clearly.\n\nYou can use several paragraphs."}
                          className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-xs text-white resize-y whitespace-pre-wrap"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {[
                          ["inputFormat", "Input Format", "First line: N\nSecond line: N integers"],
                          ["outputFormat", "Output Format", "Print a single integer"],
                          ["constraints", "Constraints (one per line)", "1 <= N <= 10^5\n-10^9 <= A[i] <= 10^9"],
                        ].map(([field, label, ph]) => (
                          <div key={field} className="space-y-1">
                            <label className="text-[11px] text-gray-400">{label}</label>
                            <textarea
                              rows={3}
                              value={prob[field] || ""}
                              onChange={(e) => handleUpdateProblem(idx, field, e.target.value)}
                              placeholder={ph}
                              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-xs text-white font-mono resize-y whitespace-pre-wrap"
                            />
                          </div>
                        ))}
                      </div>

                      {/* Test Cases for this Problem */}
                      <div className="pt-2 border-t border-gray-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-bold text-gray-300 flex items-center gap-1.5">
                            <span>Test Cases (Inputs & Expected Outputs)</span>
                            <span className="text-gray-500 font-mono">
                              ({(prob.testcases || []).length})
                            </span>
                          </label>
                          <button
                            type="button"
                            onClick={() => handleAddProblemTestCase(idx)}
                            className="text-[11px] px-2.5 py-1 rounded-lg bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 transition-all font-semibold flex items-center gap-1"
                          >
                            <PlusCircle className="w-3 h-3" />
                            <span>Add Test Case</span>
                          </button>
                        </div>

                        <div className="space-y-2">
                          {(prob.testcases || []).map((tc, tcIdx) => (
                            <div
                              key={tcIdx}
                              className="p-2.5 rounded-xl bg-gray-900 border border-gray-800 flex flex-col sm:flex-row items-center gap-2"
                            >
                              <span className="text-[10px] font-mono text-gray-400 font-bold shrink-0">
                                Test #{tcIdx + 1}
                              </span>
                              <div className="flex-1 w-full">
                                <textarea
                                  rows={2}
                                  placeholder={"Input (press Enter for a new line)\ne.g.\n5\n1 2 3 4 5"}
                                  value={tc.input || ""}
                                  onChange={(e) =>
                                    handleUpdateProblemTestCase(
                                      idx,
                                      tcIdx,
                                      "input",
                                      e.target.value
                                    )
                                  }
                                  className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2 text-xs text-white font-mono resize-y whitespace-pre"
                                />
                              </div>
                              <div className="flex-1 w-full">
                                <textarea
                                  rows={2}
                                  placeholder="Expected Output (Enter = new line)"
                                  value={tc.output || ""}
                                  onChange={(e) =>
                                    handleUpdateProblemTestCase(
                                      idx,
                                      tcIdx,
                                      "output",
                                      e.target.value
                                    )
                                  }
                                  className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2 text-xs text-emerald-300 font-mono resize-y whitespace-pre"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdateProblemTestCase(idx, tcIdx, "isHidden", !tc.isHidden)
                                }
                                title={tc.isHidden ? "Hidden: students cannot see this test case" : "Visible: shown to students as a sample"}
                                className={`shrink-0 text-[10px] font-bold px-2.5 py-1.5 rounded-lg border transition-all ${
                                  tc.isHidden
                                    ? "bg-purple-600/30 text-purple-200 border-purple-500/60"
                                    : "bg-gray-800 text-gray-400 border-gray-700 hover:text-white"
                                }`}
                              >
                                {tc.isHidden ? "🔒 Hidden" : "👁 Visible"}
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveProblemTestCase(idx, tcIdx)
                                }
                                className="text-gray-500 hover:text-red-400 p-1.5 transition-all"
                                title="Remove test case"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30"
                >
                  Assign & Publish Contest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

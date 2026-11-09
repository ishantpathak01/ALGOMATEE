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
  const [title, setTitle] = useState("AlgoMate Weekly Contest #43");
  const [description, setDescription] = useState(
    "Weekly competitive programming challenge featuring LeetCode patterns, GFG data structures, and custom mentor algorithms."
  );
  const [durationMinutes, setDurationMinutes] = useState(90);
  const [rewardCoins, setRewardCoins] = useState(300);
  const [difficulty, setDifficulty] = useState("Intermediate");

  // Problems to include in contest
  const [problems, setProblems] = useState([
    {
      title: "Valid Parentheses with Wildcards",
      source: "LeetCode",
      externalUrl: "https://leetcode.com/problems/valid-parenthesis-string/",
      difficulty: "Medium",
      points: 100,
      statement:
        "Given a string s containing only '(', ')' and '*', return true if s is valid. '*' can be treated as a single right parenthesis, a single left parenthesis, or an empty string.",
      inputFormat: "A string s of parentheses and asterisks",
      outputFormat: "true or false",
      constraints: "1 <= s.length <= 100",
      testcases: [
        { input: "()", output: "true" },
        { input: "(*)", output: "true" },
        { input: "(*))", output: "true" },
      ],
      mentorHint:
        "Count minimum and maximum possible open brackets as you traverse from left to right.",
    },
    {
      title: "Minimum Spanning Tree (Kruskal's & Prim's)",
      source: "GeeksForGeeks",
      externalUrl:
        "https://www.geeksforgeeks.org/problems/minimum-spanning-tree/1",
      difficulty: "Medium",
      points: 150,
      statement:
        "Given a weighted, undirected and connected graph of V vertices and E edges, find the sum of weights of the edges of the Minimum Spanning Tree.",
      inputFormat: "V and E followed by edge triplets (u, v, weight)",
      outputFormat: "Integer sum of MST edge weights",
      constraints: "1 <= V <= 1000, 1 <= E <= 10^4",
      testcases: [
        { input: "3 3\n0 1 5\n1 2 10\n0 2 1", output: "6" },
        { input: "2 1\n0 1 5", output: "5" },
      ],
      mentorHint:
        "Sort all edges by weight and use Disjoint Set Union (DSU) to avoid cycles.",
    },
    {
      title: "Range Maximum Segment Tree with Lazy Propagation (Mentor Exclusive)",
      source: "AlgoMate",
      externalUrl: "",
      difficulty: "Hard",
      points: 200,
      statement:
        "Implement a segment tree supporting range addition updates and range maximum queries in O(log N) time.",
      inputFormat: "N and Q followed by N array values and Q operations",
      outputFormat: "Maximum value for each query operation",
      constraints: "1 <= N, Q <= 10^5",
      testcases: [
        { input: "5 2\n1 2 3 4 5\n1 0 2 5\n2 0 4", output: "8" },
      ],
      mentorHint:
        "Propagate lazy pending updates before querying child subtrees.",
    },
  ]);

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
    setProblems([
      ...problems,
      {
        title: "New Contest Problem",
        source: "LeetCode",
        externalUrl: "https://leetcode.com",
        difficulty: "Medium",
        points: 100,
        statement: "Enter problem description and instructions here...",
        inputFormat: "",
        outputFormat: "",
        constraints: "",
        testcases: [{ input: "test_input", output: "expected_output" }],
        mentorHint: "",
      },
    ]);
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
    setProblems(updated);
  };

  const handleCreateContest = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a contest title.");
      return;
    }

    const payload = {
      title,
      description,
      mentorName: user?.Name || "Senior Mentor",
      mentorBio: user?.Bio || "AlgoMate Competitive Programming Mentor",
      mentorAvatar: user?.Picture || "",
      durationMinutes: Number(durationMinutes) || 90,
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
            Assign weekly coding contests combining LeetCode problems, GeeksForGeeks
            challenges, and your own custom DSA questions.
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
                          <span className="font-bold text-blue-400 mr-1">
                            {p.source}:
                          </span>
                          {p.title}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-800 flex items-center justify-between text-xs">
                  <div className="text-gray-400 flex items-center space-x-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{c.durationMinutes || 90} mins</span>
                    <span>·</span>
                    <span>{c.leaderboard?.length || 0} contestants</span>
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
                  Combine LeetCode, GeeksForGeeks, and your own custom DSA problems.
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

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-300">
                      Duration (mins)
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

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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

                        <div className="space-y-1">
                          <label className="text-[11px] text-gray-400">
                            Source Platform
                          </label>
                          <select
                            value={prob.source}
                            onChange={(e) =>
                              handleUpdateProblem(idx, "source", e.target.value)
                            }
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-xs text-white"
                          >
                            <option value="LeetCode">LeetCode</option>
                            <option value="GeeksForGeeks">GeeksForGeeks</option>
                            <option value="AlgoMate">Mentor Custom DSA</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-[11px] text-gray-400">
                            Original Problem URL (for LeetCode / GFG)
                          </label>
                          <input
                            type="url"
                            value={prob.externalUrl}
                            onChange={(e) =>
                              handleUpdateProblem(
                                idx,
                                "externalUrl",
                                e.target.value
                              )
                            }
                            placeholder="https://leetcode.com/problems/..."
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-xs text-white"
                          />
                        </div>

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
                              Points
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
                          Problem Statement / Instructions
                        </label>
                        <textarea
                          rows={2}
                          value={prob.statement}
                          onChange={(e) =>
                            handleUpdateProblem(idx, "statement", e.target.value)
                          }
                          className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-xs text-white"
                        />
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

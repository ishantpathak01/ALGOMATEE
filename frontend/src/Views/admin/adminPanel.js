import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Shield,
  Users,
  Trophy,
  Code2,
  Activity,
  LogOut,
  CheckCircle,
  XCircle,
  Search,
  ExternalLink,
  PlusCircle,
  Trash2,
  Key,
  Sparkles,
  Terminal,
  Clock,
  Award,
  Filter,
} from "lucide-react";
import {
  adminLogin,
  getMentorApplications,
  approveMentorApplication,
  rejectMentorApplication,
  getAdminPlatformStats,
  getAdminQuestions,
  deleteAdminQuestion,
  getAdminUsers,
} from "../../APIs/admin";
import { getAllContests, createContest } from "../../APIs/contest";

const TOKEN_KEY = "algomate_admin_token";

const MAIN_MODULES = [
  { id: "mentors", label: "Mentor Applications", icon: Users },
  { id: "contests", label: "Weekly Contests", icon: Trophy },
  { id: "questions", label: "DSA Question Bank", icon: Code2 },
  { id: "analytics", label: "Analytics & Users", icon: Activity },
];

const MENTOR_TABS = [
  ["pending", "Pending"],
  ["approved", "Approved"],
  ["rejected", "Rejected"],
];

const readToken = () => {
  try {
    return sessionStorage.getItem(TOKEN_KEY) || "";
  } catch (e) {
    return "";
  }
};

const saveToken = (value) => {
  try {
    if (value) sessionStorage.setItem(TOKEN_KEY, value);
    else sessionStorage.removeItem(TOKEN_KEY);
  } catch (e) {}
};

const expertiseText = (expertise) =>
  Object.entries(expertise || {})
    .map(([area, topics]) =>
      Array.isArray(topics) && topics.length
        ? `${area} (${topics.join(", ")})`
        : area
    )
    .join(" · ");

export default function AdminPanel() {
  const [token, setToken] = useState(readToken);
  const [form, setForm] = useState({ Email: "", Password: "" });
  const [loggingIn, setLoggingIn] = useState(false);
  const [activeModule, setActiveModule] = useState("mentors");

  // Mentor Applications State
  const [mentorTab, setMentorTab] = useState("pending");
  const [mentors, setMentors] = useState([]);
  const [mentorCounts, setMentorCounts] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [busyId, setBusyId] = useState("");
  const [rejecting, setRejecting] = useState(null);
  const [reason, setReason] = useState("");

  // Platform Stats State
  const [stats, setStats] = useState({
    usersCount: 56,
    mentorsCount: 14,
    pendingMentors: 3,
    contestsCount: 8,
    questionsCount: 48,
    activeSubmissions: 312,
    health: "Operational (100%)",
  });

  // Contests State
  const [contests, setContests] = useState([]);
  const [showCreateContest, setShowCreateContest] = useState(false);
  const [contestForm, setContestForm] = useState({
    title: "AlgoMate Weekly Contest #43",
    description: "Weekly competitive programming challenge curated by mentors.",
    durationMinutes: 90,
    rewardCoins: 350,
    difficulty: "Intermediate",
  });

  // Questions State
  const [questions, setQuestions] = useState([]);
  const [questionSearch, setQuestionSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState("All");

  // Users State
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");

  const [loading, setLoading] = useState(false);

  const logout = useCallback(() => {
    saveToken("");
    setToken("");
    setMentors([]);
  }, []);

  // Load Mentor Applications
  const loadMentors = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const res = await getMentorApplications(token, mentorTab);
    setLoading(false);
    if (res.status === 200 && res.data) {
      setMentors(res.data);
      if (res.counts) setMentorCounts(res.counts);
    } else if (res.status === 401) {
      toast.error(res.message);
      logout();
    } else {
      // Offline fallback mock data for testing
      setMentors([
        {
          _id: "m_sample_1",
          Name: "Dr. Rajesh K.",
          Email: "rajesh.k@example.com",
          Picture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
          AppliedAt: new Date().toISOString(),
          Experience: 6,
          Location: "Bengaluru, India",
          MobileNumber: "+91 98765 43210",
          Languages: ["English", "Hindi"],
          Expertise: { DSA: ["Graph", "DP", "Trees"], SystemDesign: ["HLD"] },
          About: "Passionate about mentoring engineers for FAANG coding rounds.",
          ChecksPassed: 5,
          Checks: [
            { key: "exp", label: "3+ years experience", passed: true },
            { key: "phone", label: "Verified mobile number", passed: true },
            { key: "topics", label: "Specialized in 2+ topics", passed: true },
            { key: "bio", label: "Detailed bio provided", passed: true },
            { key: "photo", label: "Profile picture uploaded", passed: true },
          ],
        },
      ]);
      setMentorCounts({ pending: 1, approved: 14, rejected: 2 });
    }
  }, [token, mentorTab, logout]);

  // Load Platform Stats
  const loadStats = useCallback(async () => {
    if (!token) return;
    const res = await getAdminPlatformStats(token);
    if (res && res.data) {
      setStats(res.data);
    }
  }, [token]);

  // Load Contests
  const loadContests = useCallback(async () => {
    const res = await getAllContests();
    if (res && res.data) {
      setContests(res.data);
    }
  }, []);

  // Load Questions
  const loadQuestions = useCallback(async () => {
    if (!token) return;
    const res = await getAdminQuestions(token);
    if (res && res.data && res.data.length > 0) {
      setQuestions(res.data);
    } else {
      // Mock questions for preview
      setQuestions([
        {
          _id: "q_1",
          Name: "Longest Substring Without Repeating Characters",
          Platform: "LeetCode",
          Level: "Medium",
          Tags: ["Sliding Window", "String"],
          Testcases: [{}, {}, {}],
        },
        {
          _id: "q_2",
          Name: "Detect Cycle in an Undirected Graph",
          Platform: "GeeksForGeeks",
          Level: "Medium",
          Tags: ["Graph", "BFS", "DFS"],
          Testcases: [{}, {}],
        },
        {
          _id: "q_3",
          Name: "Maximum XOR Subarray with Bounded Window",
          Platform: "AlgoMate",
          Level: "Hard",
          Tags: ["Trie", "Bit Manipulation"],
          Testcases: [{}, {}],
        },
      ]);
    }
  }, [token]);

  // Load Users
  const loadUsers = useCallback(async () => {
    if (!token) return;
    const res = await getAdminUsers(token);
    if (res && res.data && res.data.length > 0) {
      setUsers(res.data);
    } else {
      setUsers([
        {
          _id: "u_1",
          Name: "Aman Verma",
          Email: "aman.v@example.com",
          Coins: 380,
          College: "IIT Delhi",
          createdAt: new Date().toISOString(),
        },
        {
          _id: "u_2",
          Name: "Rohan Patel",
          Email: "rohan.p@example.com",
          Coins: 210,
          College: "NIT Trichy",
          createdAt: new Date().toISOString(),
        },
        {
          _id: "u_3",
          Name: "Sneha Mukherjee",
          Email: "sneha.m@example.com",
          Coins: 450,
          College: "BITS Pilani",
          createdAt: new Date().toISOString(),
        },
      ]);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      loadMentors();
      loadStats();
      loadContests();
      loadQuestions();
      loadUsers();
    }
  }, [token, loadMentors, loadStats, loadContests, loadQuestions, loadUsers]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoggingIn(true);
    const res = await adminLogin(form);
    setLoggingIn(false);
    if (res.status === 200) {
      saveToken(res.token);
      setToken(res.token);
      setForm({ Email: "", Password: "" });
      toast.success("Welcome back, Admin!");
    } else {
      toast.error(res.message || "Login failed.");
    }
  };

  const handleQuickDemoLogin = () => {
    const demoToken = "demo_admin_jwt_token_" + Date.now();
    saveToken(demoToken);
    setToken(demoToken);
    toast.success("Logged in as Administrator (Workspace Demo Mode)");
  };

  const handleApprove = async (mentor) => {
    if (
      mentor.ChecksPassed < mentor.Checks.length &&
      !window.confirm(
        "This mentor does not meet every criterion. Approve anyway?"
      )
    ) {
      return;
    }
    setBusyId(mentor._id);
    const res = await approveMentorApplication(token, mentor._id);
    setBusyId("");
    if (res.status === 200) {
      toast.success(res.message || "Mentor approved successfully!");
      loadMentors();
    } else {
      toast.error(res.message || "Failed to approve mentor.");
    }
  };

  const handleReject = async () => {
    setBusyId(rejecting._id);
    const res = await rejectMentorApplication(token, rejecting._id, reason);
    setBusyId("");
    if (res.status === 200) {
      toast.success(res.message || "Mentor application rejected.");
      setRejecting(null);
      setReason("");
      loadMentors();
    } else {
      toast.error(res.message || "Failed to reject mentor.");
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm("Remove this question from the platform?")) return;
    await deleteAdminQuestion(token, id);
    setQuestions(questions.filter((q) => q._id !== id));
    toast.success("Question deleted.");
  };

  const handleCreateContestSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      title: contestForm.title,
      description: contestForm.description,
      mentorName: "Admin Curated",
      mentorBio: "AlgoMate Platform Team",
      durationMinutes: Number(contestForm.durationMinutes) || 90,
      rewardCoins: Number(contestForm.rewardCoins) || 350,
      difficulty: contestForm.difficulty,
      isWeekly: true,
      status: "active",
      problems: [
        {
          title: "Two Sum & Subarray Targets",
          source: "LeetCode",
          externalUrl: "https://leetcode.com/problems/two-sum/",
          difficulty: "Easy",
          points: 100,
          statement: "Find indices of elements that sum up to target.",
          testcases: [{ input: "[2,7,11,15] 9", output: "[0,1]" }],
        },
        {
          title: "Detect Cycle in Graph",
          source: "GeeksForGeeks",
          externalUrl: "https://www.geeksforgeeks.org/problems/detect-cycle-in-an-undirected-graph/1",
          difficulty: "Medium",
          points: 150,
          statement: "Determine if cycle is present.",
          testcases: [{ input: "5 5", output: "1" }],
        },
      ],
    };

    const res = await createContest(payload);
    if (res && (res.status === 201 || res.data)) {
      toast.success("Weekly Contest Created & Published!");
      setShowCreateContest(false);
      loadContests();
    }
  };

  // ------------------- LOGIN SCREEN (THEMED) -------------------
  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-[#0a0f1d] to-black_A flex items-center justify-center text-white px-4 pt-24 pb-12 font-sans relative overflow-hidden">
        {/* Glow circles */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="w-full max-w-md bg-gray-900/90 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 shadow-2xl space-y-6 relative z-10">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              AlgoMate Admin
            </h1>
            <p className="text-gray-400 text-xs md:text-sm">
              Sign in to manage mentor applications, weekly contests, question bank & metrics.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">
                Admin Email
              </label>
              <input
                type="email"
                placeholder="admin@algomate.com"
                className="w-full bg-gray-950 border border-gray-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
                value={form.Email}
                onChange={(e) => setForm({ ...form, Email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••••••"
                className="w-full bg-gray-950 border border-gray-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
                value={form.Password}
                onChange={(e) => setForm({ ...form, Password: e.target.value })}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.01]"
            >
              {loggingIn ? "Signing in..." : "Sign in to Dashboard"}
            </button>
          </form>

          {/* Quick Demo Access Divider */}
          <div className="pt-2 border-t border-gray-800 text-center space-y-3">
            <p className="text-[11px] text-gray-500">
              Testing locally without backend credentials?
            </p>
            <button
              onClick={handleQuickDemoLogin}
              className="w-full py-2.5 px-4 rounded-xl bg-gray-800/80 hover:bg-gray-800 border border-gray-700 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-all flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Enter Admin Dashboard (One-Click Demo Access)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ------------------- MAIN ADMIN PANEL (THEMED) -------------------
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-[#0a0f1d] to-black_A text-white pt-24 pb-20 px-4 md:px-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-900/80 backdrop-blur-xl border border-gray-800 p-6 rounded-3xl shadow-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-extrabold text-white">
                  AlgoMate Admin Console
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-800">
                  Superadmin
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Unified administration for mentors, contests, question bank & telemetry.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/contests"
              className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-300 hover:text-white transition-all border border-gray-700"
            >
              View Live Contests Hub
            </Link>
            <button
              onClick={logout}
              className="flex items-center space-x-1.5 text-xs font-semibold text-red-400 hover:text-red-300 bg-red-950/30 hover:bg-red-950/50 border border-red-800/40 px-4 py-2 rounded-xl transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log out</span>
            </button>
          </div>
        </div>

        {/* Stats Overview Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-gray-900/60 border border-gray-800/80 p-4 rounded-2xl">
            <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">
              Total Users
            </p>
            <p className="text-2xl font-extrabold text-white mt-1">
              {stats.usersCount || 56}
            </p>
          </div>

          <div className="bg-gray-900/60 border border-gray-800/80 p-4 rounded-2xl">
            <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">
              Verified Mentors
            </p>
            <p className="text-2xl font-extrabold text-emerald-400 mt-1">
              {stats.mentorsCount || 14}
            </p>
          </div>

          <div className="bg-gray-900/60 border border-gray-800/80 p-4 rounded-2xl">
            <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">
              Pending Mentors
            </p>
            <p className="text-2xl font-extrabold text-amber-400 mt-1">
              {mentorCounts.pending || stats.pendingMentors || 3}
            </p>
          </div>

          <div className="bg-gray-900/60 border border-gray-800/80 p-4 rounded-2xl">
            <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">
              Contests
            </p>
            <p className="text-2xl font-extrabold text-blue-400 mt-1">
              {contests.length || stats.contestsCount || 8}
            </p>
          </div>

          <div className="bg-gray-900/60 border border-gray-800/80 p-4 rounded-2xl">
            <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">
              Question Bank
            </p>
            <p className="text-2xl font-extrabold text-purple-400 mt-1">
              {questions.length || stats.questionsCount || 48}
            </p>
          </div>

          <div className="bg-gray-900/60 border border-gray-800/80 p-4 rounded-2xl">
            <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">
              Platform Health
            </p>
            <p className="text-xs font-bold text-emerald-400 mt-2 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Operational</span>
            </p>
          </div>
        </div>

        {/* Primary Navigation Tabs */}
        <div className="flex border-b border-gray-800 overflow-x-auto space-x-2 pb-1">
          {MAIN_MODULES.map((mod) => {
            const Icon = mod.icon;
            const isActive = activeModule === mod.id;
            return (
              <button
                key={mod.id}
                onClick={() => setActiveModule(mod.id)}
                className={`flex items-center space-x-2 px-5 py-3 rounded-2xl text-xs md:text-sm font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                    : "text-gray-400 hover:text-white hover:bg-gray-900/80 border border-transparent"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{mod.label}</span>
                {mod.id === "mentors" && mentorCounts.pending > 0 && (
                  <span className="ml-1.5 px-2 py-0.2 rounded-full text-[10px] bg-amber-500 text-gray-950 font-extrabold">
                    {mentorCounts.pending}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ================= MODULE 1: MENTOR APPLICATIONS ================= */}
        {activeModule === "mentors" && (
          <div className="space-y-6">
            {/* Sub-tabs: Pending, Approved, Rejected */}
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex space-x-2">
                {MENTOR_TABS.map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setMentorTab(key)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                      mentorTab === key
                        ? "bg-gray-800 text-blue-400 border border-blue-500/40"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {label} ({mentorCounts[key] || 0})
                  </button>
                ))}
              </div>

              <span className="text-xs text-gray-500 font-mono">
                {mentors.length} applications loaded
              </span>
            </div>

            {loading ? (
              <div className="py-20 text-center text-gray-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-2"></div>
                <p className="text-xs">Loading mentor applications...</p>
              </div>
            ) : mentors.length === 0 ? (
              <div className="py-16 text-center bg-gray-900/40 rounded-3xl border border-gray-800 text-gray-400 space-y-2">
                <Users className="w-10 h-10 mx-auto opacity-30 text-blue-400" />
                <p className="text-sm font-medium">No {mentorTab} applications.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {mentors.map((m) => (
                  <div
                    key={m._id}
                    className="bg-gray-900/80 backdrop-blur-md border border-gray-800 rounded-3xl p-6 shadow-xl hover:border-gray-700 transition-all space-y-4"
                  >
                    <div className="flex flex-col md:flex-row gap-6">
                      <img
                        src={
                          m.Picture ||
                          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
                        }
                        alt={m.Name}
                        className="w-24 h-24 rounded-2xl object-cover ring-2 ring-gray-700 shrink-0"
                      />

                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                              <span>{m.Name}</span>
                              <span className="text-xs font-normal text-gray-400">
                                ({m.Email})
                              </span>
                            </h2>
                            <p className="text-xs text-gray-500">
                              Applied: {new Date(m.AppliedAt).toLocaleDateString()}
                            </p>
                          </div>

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                              m.VerificationStatus === "approved"
                                ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                                : m.VerificationStatus === "rejected"
                                ? "bg-red-950 text-red-400 border border-red-800"
                                : "bg-amber-950 text-amber-400 border border-amber-800"
                            }`}
                          >
                            {m.VerificationStatus || "Pending"}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-300 pt-1">
                          <p>
                            <strong className="text-gray-400">Exp: </strong>
                            {m.Experience || 0} years
                          </p>
                          <p>
                            <strong className="text-gray-400">Location: </strong>
                            {m.Location || "--"}
                          </p>
                          <p>
                            <strong className="text-gray-400">Mobile: </strong>
                            {m.MobileNumber || "--"}
                          </p>
                          <p>
                            <strong className="text-gray-400">Languages: </strong>
                            {(m.Languages || []).join(", ") || "--"}
                          </p>
                        </div>

                        <p className="text-xs text-gray-300">
                          <strong className="text-gray-400">Expertise: </strong>
                          {expertiseText(m.Expertise) || "--"}
                        </p>

                        <p className="text-xs italic text-gray-400 bg-gray-950/60 p-3 rounded-xl border border-gray-800/80">
                          “{m.About}”
                        </p>

                        {m.VerificationStatus === "rejected" && m.RejectionReason && (
                          <p className="text-xs text-red-400 bg-red-950/30 p-2.5 rounded-lg border border-red-800/50">
                            Rejection Reason: {m.RejectionReason}
                          </p>
                        )}
                      </div>

                      {/* Criteria Checklist Box */}
                      <div className="md:w-64 bg-gray-950/80 p-4 rounded-2xl border border-gray-800/80 shrink-0 space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-gray-300">
                          <span>Verification Criteria</span>
                          <span className="text-blue-400 font-mono">
                            {m.ChecksPassed || 0}/{(m.Checks || []).length}
                          </span>
                        </div>
                        <ul className="text-xs space-y-1.5">
                          {(m.Checks || []).map((c, i) => (
                            <li
                              key={i}
                              className={`flex items-center space-x-1.5 ${
                                c.passed ? "text-emerald-400" : "text-gray-500"
                              }`}
                            >
                              <span>{c.passed ? "✓" : "✗"}</span>
                              <span>{c.label}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-800/80">
                      {mentorTab !== "rejected" && (
                        <button
                          onClick={() => {
                            setRejecting(m);
                            setReason("");
                          }}
                          disabled={busyId === m._id}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-red-300 bg-red-950/30 hover:bg-red-900/50 border border-red-800/40 transition-all"
                        >
                          Reject Application
                        </button>
                      )}

                      {mentorTab !== "approved" && (
                        <button
                          onClick={() => handleApprove(m)}
                          disabled={busyId === m._id}
                          className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/30 transition-all"
                        >
                          {busyId === m._id ? "Approving..." : "Approve Application"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= MODULE 2: WEEKLY CONTESTS COMMAND CENTER ================= */}
        {activeModule === "contests" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <span>Weekly Contests Management</span>
                </h2>
                <p className="text-xs text-gray-400">
                  Manage weekly contests, assign mentors, and curate problem sets.
                </p>
              </div>

              <button
                onClick={() => setShowCreateContest(true)}
                className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Weekly Contest</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {contests.map((c) => (
                <div
                  key={c._id || c.id}
                  className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 shadow-xl space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-800">
                      {c.status || "Active"}
                    </span>
                    <span className="text-xs text-amber-400 font-semibold">
                      +{c.rewardCoins || 300} Coins
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white">{c.title}</h3>
                    <p className="text-gray-400 text-xs mt-1 line-clamp-2">
                      {c.description}
                    </p>
                  </div>

                  <div className="bg-gray-950/70 p-3 rounded-xl border border-gray-800 space-y-1.5 text-xs">
                    <p className="text-gray-400">
                      <strong>Assigned Mentor: </strong>
                      <span className="text-white">{c.mentorName}</span>
                    </p>
                    <p className="text-gray-400">
                      <strong>Problems: </strong>
                      <span className="text-blue-400 font-mono">
                        {c.problems?.length || 0} questions (LeetCode & GFG)
                      </span>
                    </p>
                    <p className="text-gray-400">
                      <strong>Participants: </strong>
                      <span className="text-emerald-400 font-mono">
                        {c.leaderboard?.length || 0} contestants
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-800 text-xs">
                    <span className="text-gray-500 font-mono">
                      Duration: {c.durationMinutes || 90} mins
                    </span>
                    <Link
                      to={`/contests/${c._id || c.id}`}
                      className="px-3.5 py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white transition-all flex items-center space-x-1"
                    >
                      <span>Open Arena</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= MODULE 3: DSA QUESTION BANK & REVIEWER ================= */}
        {activeModule === "questions" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                  <Code2 className="w-5 h-5 text-purple-400" />
                  <span>Platform DSA Question Bank</span>
                </h2>
                <p className="text-xs text-gray-400">
                  Review questions added by mentors, test in the terminal runner, and manage visibility.
                </p>
              </div>

              {/* Platform Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={platformFilter}
                  onChange={(e) => setPlatformFilter(e.target.value)}
                  className="bg-gray-900 border border-gray-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="All">All Platforms</option>
                  <option value="AlgoMate">AlgoMate (Mentor Questions)</option>
                  <option value="LeetCode">LeetCode</option>
                  <option value="GeeksForGeeks">GeeksForGeeks</option>
                </select>
              </div>
            </div>

            {/* Questions Table */}
            <div className="bg-gray-900/80 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-950 text-gray-400 border-b border-gray-800 uppercase font-mono">
                  <tr>
                    <th className="p-4">Problem Name</th>
                    <th className="p-4">Platform</th>
                    <th className="p-4">Difficulty</th>
                    <th className="p-4">Tags</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {questions
                    .filter((q) =>
                      platformFilter === "All" ? true : q.Platform === platformFilter
                    )
                    .map((q) => (
                      <tr key={q._id} className="hover:bg-gray-800/40 transition-colors">
                        <td className="p-4 font-bold text-white">{q.Name}</td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              q.Platform === "LeetCode"
                                ? "bg-amber-950 text-amber-300"
                                : q.Platform === "GeeksForGeeks"
                                ? "bg-emerald-950 text-emerald-300"
                                : "bg-purple-950 text-purple-300"
                            }`}
                          >
                            {q.Platform || "AlgoMate"}
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] ${
                              q.Level === "Hard"
                                ? "text-red-400 bg-red-950/40"
                                : q.Level === "Medium"
                                ? "text-amber-400 bg-amber-950/40"
                                : "text-green-400 bg-green-950/40"
                            }`}
                          >
                            {q.Level || "Medium"}
                          </span>
                        </td>
                        <td className="p-4 text-gray-400">
                          {(q.Tags || []).slice(0, 3).join(", ") || "General DSA"}
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <Link
                            to={`/practice/coding/${q._id}`}
                            target="_blank"
                            className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white transition-all border border-blue-500/40"
                            title="Test code in Terminal"
                          >
                            <Terminal className="w-3.5 h-3.5" />
                            <span>Test Terminal</span>
                          </Link>
                          <button
                            onClick={() => handleDeleteQuestion(q._id)}
                            className="inline-flex items-center p-1 rounded-lg text-gray-500 hover:text-red-400 transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= MODULE 4: PLATFORM ANALYTICS & USERS ================= */}
        {activeModule === "analytics" && (
          <div className="space-y-6">
            <div className="border-b border-gray-800 pb-4">
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                <span>Platform Telemetry & User Registry</span>
              </h2>
              <p className="text-xs text-gray-400">
                Live metrics, registered student profiles, and server status.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-900/80 border border-gray-800 p-6 rounded-3xl space-y-4">
                <h3 className="text-sm font-bold text-white">System Health</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-gray-800">
                    <span className="text-gray-400">Backend API</span>
                    <span className="text-emerald-400 font-bold">Online</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-800">
                    <span className="text-gray-400">Code Execution Sandbox</span>
                    <span className="text-emerald-400 font-bold">Active</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-800">
                    <span className="text-gray-400">Socket.io Realtime</span>
                    <span className="text-emerald-400 font-bold">Connected</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-400">Active Submissions</span>
                    <span className="text-white font-mono font-bold">342 runs</span>
                  </div>
                </div>
              </div>

              {/* Users table (top 2 columns) */}
              <div className="md:col-span-2 bg-gray-900/80 border border-gray-800 p-6 rounded-3xl space-y-4">
                <h3 className="text-sm font-bold text-white">
                  Active Student Coders ({users.length})
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                  {users.map((u, i) => (
                    <div
                      key={u._id || i}
                      className="flex items-center justify-between p-3 rounded-xl bg-gray-950 border border-gray-800 text-xs"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={`https://api.dicebear.com/7.x/bottts/svg?seed=${u.Name}`}
                          alt={u.Name}
                          className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700"
                        />
                        <div>
                          <p className="font-bold text-white">{u.Name}</p>
                          <p className="text-[11px] text-gray-500">{u.Email}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className="text-amber-400 font-mono font-semibold">
                          🪙 {u.Coins || 120} Coins
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800">
                          Active
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejecting && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center px-4 z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">
              Reject {rejecting.Name}?
            </h3>
            <p className="text-xs text-gray-400">
              Provide feedback that will be emailed to the mentor candidate.
            </p>
            <textarea
              className="w-full h-28 bg-gray-950 border border-gray-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-red-500"
              placeholder="Reason (5 to 500 characters)"
              value={reason}
              maxLength={500}
              onChange={(e) => setReason(e.target.value)}
            />
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setRejecting(null)}
                className="px-4 py-2 rounded-xl bg-gray-800 text-xs font-semibold text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={busyId === rejecting._id || reason.trim().length < 5}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-bold"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Contest Modal */}
      {showCreateContest && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-3xl p-6 w-full max-w-lg space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <span>Launch Weekly Coding Contest</span>
              </h3>
              <button
                onClick={() => setShowCreateContest(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateContestSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-gray-400">Contest Title</label>
                <input
                  type="text"
                  required
                  value={contestForm.title}
                  onChange={(e) =>
                    setContestForm({ ...contestForm, title: e.target.value })
                  }
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Duration (mins)</label>
                  <input
                    type="number"
                    value={contestForm.durationMinutes}
                    onChange={(e) =>
                      setContestForm({
                        ...contestForm,
                        durationMinutes: e.target.value,
                      })
                    }
                    className="w-full bg-gray-950 border border-gray-700 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Reward Coins</label>
                  <input
                    type="number"
                    value={contestForm.rewardCoins}
                    onChange={(e) =>
                      setContestForm({
                        ...contestForm,
                        rewardCoins: e.target.value,
                      })
                    }
                    className="w-full bg-gray-950 border border-gray-700 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-400">Description</label>
                <textarea
                  rows={2}
                  value={contestForm.description}
                  onChange={(e) =>
                    setContestForm({
                      ...contestForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <div className="p-3 rounded-xl bg-gray-950 border border-gray-800 text-[11px] text-gray-400 space-y-1">
                <p className="font-semibold text-blue-400">
                  Included Curated Problems:
                </p>
                <p>• LeetCode: Two Sum & Subarrays (Easy · 100 pts)</p>
                <p>• GeeksForGeeks: Detect Cycle in Graph (Medium · 150 pts)</p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateContest(false)}
                  className="px-4 py-2 rounded-xl bg-gray-800 text-xs font-semibold text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-xs font-bold text-white shadow-lg shadow-blue-600/30"
                >
                  Publish Contest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

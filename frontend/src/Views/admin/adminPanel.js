import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  adminLogin,
  getMentorApplications,
  approveMentorApplication,
  rejectMentorApplication,
} from "../../APIs/admin";
import {
  adminGetStats,
  adminListContests,
  adminUpdateContestStatus,
  adminListUsers,
} from "../../APIs/contest";

const TOKEN_KEY = "algomate_admin_token";

const MAIN_TABS = [
  { id: "mentors", label: "Mentors" },
  { id: "stats", label: "Dashboard" },
  { id: "contests", label: "Contests" },
  { id: "users", label: "Users" },
];

const MENTOR_SUBTABS = [
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

const statusBadge = (status) => {
  const map = {
    pending: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
    approved: "bg-green-500/20 text-green-300 border-green-500/40",
    rejected: "bg-red-500/20 text-red-300 border-red-500/40",
    live: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    upcoming: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    ended: "bg-slate-500/20 text-slate-300 border-slate-500/40",
    cancelled: "bg-red-500/20 text-red-300 border-red-500/40",
    draft: "bg-gray-500/20 text-gray-300 border-gray-500/40",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        map[status] || map.draft
      }`}
    >
      {status}
    </span>
  );
};

function AdminPanel() {
  const [token, setToken] = useState(readToken);
  const [form, setForm] = useState({ Email: "", Password: "" });
  const [loggingIn, setLoggingIn] = useState(false);
  const [mainTab, setMainTab] = useState("stats");
  const [mentorTab, setMentorTab] = useState("pending");
  const [mentors, setMentors] = useState([]);
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [rejecting, setRejecting] = useState(null);
  const [reason, setReason] = useState("");
  const [stats, setStats] = useState(null);
  const [contests, setContests] = useState([]);
  const [users, setUsers] = useState([]);

  const logout = useCallback(() => {
    saveToken("");
    setToken("");
    setMentors([]);
    setStats(null);
    setContests([]);
    setUsers([]);
  }, []);

  const loadMentors = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const res = await getMentorApplications(token, mentorTab);
    setLoading(false);
    if (res.status === 200) {
      setMentors(res.data);
      setCounts(res.counts);
    } else if (res.status === 401) {
      toast.error(res.message);
      logout();
    } else {
      toast.error(res.message || "Could not load applications.");
    }
  }, [token, mentorTab, logout]);

  const loadStats = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const res = await adminGetStats(token);
    setLoading(false);
    if (res.status === 200) setStats(res.data);
    else if (res.status === 401) logout();
  }, [token, logout]);

  const loadContests = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const res = await adminListContests(token);
    setLoading(false);
    if (res.status === 200) setContests(res.data || []);
    else if (res.status === 401) logout();
  }, [token, logout]);

  const loadUsers = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const res = await adminListUsers(token, 100);
    setLoading(false);
    if (res.status === 200) setUsers(res.data || []);
    else if (res.status === 401) logout();
  }, [token, logout]);

  useEffect(() => {
    if (!token) return;
    if (mainTab === "mentors") loadMentors();
    else if (mainTab === "stats") loadStats();
    else if (mainTab === "contests") loadContests();
    else if (mainTab === "users") loadUsers();
  }, [token, mainTab, mentorTab, loadMentors, loadStats, loadContests, loadUsers]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoggingIn(true);
    const res = await adminLogin(form);
    setLoggingIn(false);
    if (res.status === 200) {
      saveToken(res.token);
      setToken(res.token);
      setForm({ Email: "", Password: "" });
      toast.success("Welcome, Admin");
    } else {
      toast.error(res.message || "Login failed.");
    }
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
      toast.success(res.message);
      loadMentors();
    } else if (res.status === 401) {
      logout();
    } else {
      toast.error(res.message);
    }
  };

  const handleReject = async () => {
    setBusyId(rejecting._id);
    const res = await rejectMentorApplication(token, rejecting._id, reason);
    setBusyId("");
    if (res.status === 200) {
      toast.success(res.message);
      setRejecting(null);
      setReason("");
      loadMentors();
    } else if (res.status === 401) {
      logout();
    } else {
      toast.error(res.message);
    }
  };

  const handleContestStatus = async (id, status) => {
    setBusyId(id);
    const res = await adminUpdateContestStatus(token, id, status);
    setBusyId("");
    if (res.status === 200) {
      toast.success("Contest status updated");
      loadContests();
    } else {
      toast.error(res.message || "Failed");
    }
  };

  const inputClass =
    "w-full bg-slate-800/80 border border-slate-600 rounded-lg px-3 py-2.5 text-white outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50 transition";
  const cardClass =
    "bg-slate-800/40 border border-slate-700/60 rounded-xl p-5 shadow-lg backdrop-blur-sm";
  const btnPrimary =
    "bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg px-4 py-2 transition disabled:opacity-50";
  const btnDanger =
    "border border-red-400/60 text-red-300 hover:bg-red-500/20 rounded-lg px-4 py-2 text-sm transition disabled:opacity-50";
  const btnGhost =
    "border border-slate-500/60 text-slate-300 hover:bg-slate-700/50 rounded-lg px-4 py-2 text-sm transition";

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black text-white px-4">
        <form
          onSubmit={handleLogin}
          className={`${cardClass} w-full max-w-md space-y-5`}
        >
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              AlgoMate Admin
            </h1>
            <p className="text-sm text-slate-400">Sign in to manage the platform</p>
          </div>
          <input
            type="email"
            placeholder="Admin email"
            className={inputClass}
            value={form.Email}
            onChange={(e) => setForm({ ...form, Email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className={inputClass}
            value={form.Password}
            onChange={(e) => setForm({ ...form, Password: e.target.value })}
            required
          />
          <button
            type="submit"
            disabled={loggingIn}
            className={`${btnPrimary} w-full py-2.5`}
          >
            {loggingIn ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-slate-900 to-black text-white pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Admin Panel
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Manage mentors, contests, users & platform health
            </p>
          </div>
          <button onClick={logout} className={btnGhost}>
            Logout
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-700/60 pb-3">
          {MAIN_TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setMainTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                mainTab === t.id
                  ? "bg-blue-600/30 text-blue-300 border border-blue-500/40"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="text-center py-12 text-slate-400 animate-pulse">
            Loading…
          </div>
        )}

        {!loading && mainTab === "stats" && stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: "Total Users", value: stats.users, color: "from-blue-500/20 to-blue-600/10" },
              { label: "Verified Mentors", value: stats.mentors, color: "from-purple-500/20 to-purple-600/10" },
              { label: "Pending Mentors", value: stats.pendingMentors, color: "from-yellow-500/20 to-yellow-600/10" },
              { label: "Coding Problems", value: stats.problems, color: "from-emerald-500/20 to-emerald-600/10" },
              { label: "Total Contests", value: stats.contests, color: "from-cyan-500/20 to-cyan-600/10" },
              { label: "Live Contests", value: stats.liveContests, color: "from-pink-500/20 to-pink-600/10" },
            ].map((s) => (
              <div
                key={s.label}
                className={`${cardClass} bg-gradient-to-br ${s.color}`}
              >
                <p className="text-slate-400 text-sm">{s.label}</p>
                <p className="text-3xl font-bold mt-1">{s.value ?? 0}</p>
              </div>
            ))}
          </div>
        )}

        {!loading && mainTab === "mentors" && (
          <>
            <div className="flex gap-2 mb-5">
              {MENTOR_SUBTABS.map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setMentorTab(id)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition ${
                    mentorTab === id
                      ? "bg-slate-700 text-white"
                      : "text-slate-400 hover:bg-slate-800"
                  }`}
                >
                  {label}
                  {counts[id] !== undefined && (
                    <span className="ml-1.5 text-xs opacity-70">({counts[id]})</span>
                  )}
                </button>
              ))}
            </div>

            {mentors.length === 0 ? (
              <div className={`${cardClass} text-center text-slate-400 py-10`}>
                No {mentorTab} applications.
              </div>
            ) : (
              <div className="space-y-4">
                {mentors.map((m) => (
                  <div key={m._id} className={cardClass}>
                    <div className="flex flex-col md:flex-row gap-5">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <img
                            src={m.Picture}
                            alt=""
                            className="w-12 h-12 rounded-full object-cover border border-slate-600"
                          />
                          <div>
                            <h3 className="font-semibold text-lg">{m.Name}</h3>
                            <p className="text-sm text-slate-400">{m.Email}</p>
                          </div>
                        </div>
                        <div className="text-sm space-y-1 text-slate-300">
                          <p>Experience: {m.Experience || 0} years</p>
                          <p>Location: {m.Location || "--"}</p>
                          <p>Mobile: {m.MobileNumber || "--"}</p>
                          <p>Languages: {(m.Languages || []).join(", ") || "--"}</p>
                          <p>Expertise: {expertiseText(m.Expertise) || "--"}</p>
                        </div>
                        <p className="text-sm italic text-slate-400 mt-3 break-words">
                          “{m.About}”
                        </p>
                        {m.VerificationStatus === "rejected" && m.RejectionReason && (
                          <p className="text-sm text-red-300 mt-3">
                            Rejected: {m.RejectionReason}
                          </p>
                        )}
                      </div>
                      <div className="md:w-64 shrink-0">
                        <p className="text-sm font-semibold mb-2">
                          Criteria ({m.ChecksPassed}/{m.Checks?.length || 0})
                        </p>
                        <ul className="text-sm space-y-1">
                          {(m.Checks || []).map((c) => (
                            <li
                              key={c.key}
                              className={c.passed ? "text-green-400" : "text-red-300"}
                            >
                              {c.passed ? "✓" : "✗"} {c.label}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-slate-700/50">
                      {mentorTab !== "rejected" && (
                        <button
                          onClick={() => {
                            setRejecting(m);
                            setReason("");
                          }}
                          disabled={busyId === m._id}
                          className={btnDanger}
                        >
                          Reject
                        </button>
                      )}
                      {mentorTab !== "approved" && (
                        <button
                          onClick={() => handleApprove(m)}
                          disabled={busyId === m._id}
                          className={btnPrimary}
                        >
                          Approve
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {!loading && mainTab === "contests" && (
          <div className="space-y-4">
            {contests.length === 0 ? (
              <div className={`${cardClass} text-center text-slate-400 py-10`}>
                No contests created yet. Mentors can create weekly contests from their dashboard.
              </div>
            ) : (
              contests.map((c) => (
                <div key={c._id} className={cardClass}>
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-lg">{c.title}</h3>
                        {statusBadge(c.status)}
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                          {c.type}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400 mt-1">
                        by {c.mentorName || c.createdBy?.Name || "Mentor"} ·{" "}
                        {c.problems?.length || 0} problems ·{" "}
                        {c.participants?.length || 0} participants
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(c.startTime).toLocaleString()} →{" "}
                        {new Date(c.endTime).toLocaleString()}
                      </p>
                      {c.description && (
                        <p className="text-sm text-slate-300 mt-2 line-clamp-2">
                          {c.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {c.status !== "cancelled" && (
                        <button
                          onClick={() => handleContestStatus(c._id, "cancelled")}
                          disabled={busyId === c._id}
                          className={btnDanger}
                        >
                          Cancel
                        </button>
                      )}
                      {c.status === "cancelled" && (
                        <button
                          onClick={() => handleContestStatus(c._id, "upcoming")}
                          disabled={busyId === c._id}
                          className={btnPrimary}
                        >
                          Restore
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {!loading && mainTab === "users" && (
          <div className={`${cardClass} overflow-x-auto`}>
            {users.length === 0 ? (
              <p className="text-center text-slate-400 py-8">No users found.</p>
            ) : (
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400">
                    <th className="py-3 pr-4">User</th>
                    <th className="py-3 pr-4">Email</th>
                    <th className="py-3">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr
                      key={u._id}
                      className="border-b border-slate-800/60 hover:bg-slate-800/30"
                    >
                      <td className="py-3 pr-4 flex items-center gap-2">
                        <img
                          src={
                            u.Picture ||
                            "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg"
                          }
                          alt=""
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        {u.Name}
                      </td>
                      <td className="py-3 pr-4 text-slate-300">{u.Email}</td>
                      <td className="py-3 text-slate-400">
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString()
                          : "--"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {rejecting && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center px-4 z-50">
          <div className={`${cardClass} w-full max-w-md`}>
            <h3 className="text-lg font-semibold mb-1">
              Reject {rejecting.Name}?
            </h3>
            <p className="text-sm text-slate-400 mb-3">
              The reason is emailed to the mentor.
            </p>
            <textarea
              className={`${inputClass} h-28 resize-none`}
              placeholder="Reason (5 to 500 characters)"
              value={reason}
              maxLength={500}
              onChange={(e) => setReason(e.target.value)}
            />
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setRejecting(null)} className={btnGhost}>
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={busyId === rejecting._id || reason.trim().length < 5}
                className="bg-red-600 hover:bg-red-500 rounded-lg px-4 py-2 text-sm disabled:opacity-50 transition"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;

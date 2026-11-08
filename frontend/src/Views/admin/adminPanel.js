import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  adminLogin,
  getMentorApplications,
  approveMentorApplication,
  rejectMentorApplication,
} from "../../APIs/admin";

const TOKEN_KEY = "algomate_admin_token";
const TABS = [
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

function AdminPanel() {
  const [token, setToken] = useState(readToken);
  const [form, setForm] = useState({ Email: "", Password: "" });
  const [loggingIn, setLoggingIn] = useState(false);
  const [tab, setTab] = useState("pending");
  const [mentors, setMentors] = useState([]);
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [rejecting, setRejecting] = useState(null);
  const [reason, setReason] = useState("");

  const logout = useCallback(() => {
    saveToken("");
    setToken("");
    setMentors([]);
  }, []);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const res = await getMentorApplications(token, tab);
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
  }, [token, tab, logout]);

  useEffect(() => {
    load();
  }, [load]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoggingIn(true);
    const res = await adminLogin(form);
    setLoggingIn(false);
    if (res.status === 200) {
      saveToken(res.token);
      setToken(res.token);
      setForm({ Email: "", Password: "" });
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
      load();
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
      load();
    } else if (res.status === 401) {
      logout();
    } else {
      toast.error(res.message);
    }
  };

  const inputClass =
    "w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white outline-none focus:border-blue-400";

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white px-4 pt-20">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm bg-slate-700 bg-opacity-30 rounded-lg p-8 shadow-lg space-y-4"
        >
          <h1 className="text-2xl font-bold text-center">Admin login</h1>
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
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded py-2 font-semibold"
          >
            {loggingIn ? "Logging in..." : "Log in"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white px-4 md:px-10 pt-28 pb-16">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Mentor applications</h1>
          <button
            onClick={logout}
            className="text-sm border border-slate-500 rounded px-3 py-1 hover:bg-slate-700"
          >
            Log out
          </button>
        </div>

        <div className="flex border-b border-slate-600 mb-6">
          {TABS.map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-5 py-3 text-sm ${
                tab === key
                  ? "border-b-2 border-blue-400 font-semibold"
                  : "opacity-60 hover:opacity-100"
              }`}
            >
              {label} ({counts[key]})
            </button>
          ))}
        </div>

        {loading ? (
          <p className="opacity-70 text-center mt-16">Loading...</p>
        ) : mentors.length === 0 ? (
          <p className="opacity-70 text-center mt-16">
            No {tab} applications.
          </p>
        ) : (
          mentors.map((m) => (
            <div
              key={m._id}
              className="bg-slate-700 bg-opacity-30 rounded-lg p-5 mb-5 shadow-lg"
            >
              <div className="flex flex-col md:flex-row gap-5">
                <img
                  src={m.Picture}
                  alt={m.Name}
                  className="w-24 h-24 rounded-full border-2 border-white object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold">{m.Name}</h2>
                  <p className="text-sm opacity-80">{m.Email}</p>
                  <p className="text-xs opacity-60 mb-3">
                    Applied {new Date(m.AppliedAt).toLocaleDateString()}
                  </p>
                  <div className="text-sm space-y-1">
                    <p>Experience: {m.Experience || 0} years</p>
                    <p>Location: {m.Location || "--"}</p>
                    <p>Mobile: {m.MobileNumber || "--"}</p>
                    <p>Languages: {(m.Languages || []).join(", ") || "--"}</p>
                    <p>Expertise: {expertiseText(m.Expertise) || "--"}</p>
                  </div>
                  <p className="text-sm italic opacity-80 mt-3 break-words">
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
                    Criteria ({m.ChecksPassed}/{m.Checks.length})
                  </p>
                  <ul className="text-sm space-y-1">
                    {m.Checks.map((c) => (
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
              <div className="flex gap-3 justify-end mt-4">
                {tab !== "rejected" && (
                  <button
                    onClick={() => {
                      setRejecting(m);
                      setReason("");
                    }}
                    disabled={busyId === m._id}
                    className="border border-red-400 text-red-300 hover:bg-red-500 hover:bg-opacity-20 rounded px-4 py-2 text-sm disabled:opacity-50"
                  >
                    Reject
                  </button>
                )}
                {tab !== "approved" && (
                  <button
                    onClick={() => handleApprove(m)}
                    disabled={busyId === m._id}
                    className="bg-green-600 hover:bg-green-700 rounded px-4 py-2 text-sm disabled:opacity-50"
                  >
                    {busyId === m._id ? "Working..." : "Approve"}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {rejecting && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center px-4 z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-1">
              Reject {rejecting.Name}?
            </h3>
            <p className="text-sm opacity-70 mb-3">
              The reason is emailed to the mentor.
            </p>
            <textarea
              className={`${inputClass} h-28`}
              placeholder="Reason (5 to 500 characters)"
              value={reason}
              maxLength={500}
              onChange={(e) => setReason(e.target.value)}
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setRejecting(null)}
                className="border border-slate-500 rounded px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={busyId === rejecting._id || reason.trim().length < 5}
                className="bg-red-600 hover:bg-red-700 rounded px-4 py-2 text-sm disabled:opacity-50"
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

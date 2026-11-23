import axios from "axios";

const SERVER = (process.env.REACT_APP_API_URL || "http://localhost:8000").replace(/\/+$/, "");
const opts = { withCredentials: true, timeout: 30000 };

// Admin-panel token (saved by the admin login screen) is sent along so admin-only routes work.
const adminOpts = (extra = {}) => {
  let t = "";
  try { t = sessionStorage.getItem("algomate_admin_token") || ""; } catch (e) {}
  return { ...opts, ...extra, headers: t ? { Authorization: `Bearer ${t}` } : {} };
};

const fail = (err, extra = {}) => ({
  status: err?.response?.status || 500,
  message: err?.response?.data?.message || err?.message || "Request failed",
  ...extra,
});

// Everything below talks to the real server. No sample / fallback data.
export const getWeeklyContest = async () => {
  try {
    const res = await axios.get(`${SERVER}/contest/weekly`, opts);
    return res.data;
  } catch (err) {
    return fail(err, { data: null });
  }
};

export const getAllContests = async () => {
  try {
    const res = await axios.get(`${SERVER}/contest/all`, opts);
    return res.data;
  } catch (err) {
    return fail(err, { data: [] });
  }
};

export const getContestById = async (id) => {
  try {
    const res = await axios.get(`${SERVER}/contest/${id}`, opts);
    return res.data;
  } catch (err) {
    return fail(err, { data: null });
  }
};

export const createContest = async (data) => {
  try {
    const res = await axios.post(`${SERVER}/contest/create`, data, opts);
    return res.data;
  } catch (err) {
    return fail(err);
  }
};

export const enterContest = async (contestId) => {
  try {
    const res = await axios.post(`${SERVER}/contest/${contestId}/enter`, {}, opts);
    return res.data;
  } catch (err) {
    return fail(err);
  }
};

export const getLeaderboard = async (contestId) => {
  try {
    const res = await axios.get(`${SERVER}/contest/${contestId}/leaderboard`, adminOpts());
    return res.data;
  } catch (err) {
    return fail(err, { data: [] });
  }
};

export const submitContestProblem = async (contestId, data) => {
  try {
    const res = await axios.post(`${SERVER}/contest/${contestId}/submit`, data, { ...opts, timeout: 120000 });
    return res.data;
  } catch (err) {
    return fail(err);
  }
};

export const getAdminResults = async (contestId) => {
  try {
    const res = await axios.get(`${SERVER}/contest/${contestId}/admin/results`, adminOpts());
    return res.data;
  } catch (err) {
    return fail(err, { data: null });
  }
};

export const getAdminSubmissionCode = async (contestId, subId) => {
  try {
    const res = await axios.get(`${SERVER}/contest/${contestId}/admin/submission/${subId}`, adminOpts());
    return res.data;
  } catch (err) {
    return fail(err, { data: null });
  }
};

export const deleteContest = async (contestId) => {
  try {
    const res = await axios.delete(`${SERVER}/contest/${contestId}`, adminOpts());
    return res.data;
  } catch (err) {
    return fail(err);
  }
};

export const setContestWinners = async (contestId, payload) => {
  try {
    const res = await axios.post(`${SERVER}/contest/${contestId}/winners`, payload, adminOpts());
    return res.data;
  } catch (err) {
    return fail(err);
  }
};

export const getPublishedWinners = async (limit = 1) => {
  try {
    const res = await axios.get(`${SERVER}/contest/winners`, { ...opts, params: { limit } });
    return res.data;
  } catch (err) {
    return fail(err, { data: [] });
  }
};

export const getMyResult = async (contestId) => {
  try {
    const res = await axios.get(`${SERVER}/contest/${contestId}/my-result`, opts);
    return res.data;
  } catch (err) {
    return fail(err, { data: null, endTime: err?.response?.data?.endTime });
  }
};

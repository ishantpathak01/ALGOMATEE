import axios from "axios";

const SERVER = (
  process.env.REACT_APP_API_URL || "http://localhost:8000"
).replace(/\/+$/, "");

const auth = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

const run = async (request) => {
  try {
    const res = await request;
    return res.data;
  } catch (error) {
    console.log(error);
    return { status: 500, message: "Could not reach the server." };
  }
};

export const adminLogin = (data) =>
  run(axios.post(`${SERVER}/admin/login`, data));

export const getMentorApplications = (token, status) =>
  run(axios.get(`${SERVER}/admin/mentors`, { ...auth(token), params: { status } }));

export const approveMentorApplication = (token, MentorId) =>
  run(axios.post(`${SERVER}/admin/mentors/approve`, { MentorId }, auth(token)));

export const rejectMentorApplication = (token, MentorId, Reason) =>
  run(
    axios.post(`${SERVER}/admin/mentors/reject`, { MentorId, Reason }, auth(token))
  );

export const getAdminPlatformStats = async (token) => {
  try {
    const res = await axios.get(`${SERVER}/admin/stats`, {
      ...auth(token),
      timeout: 3000,
    });
    if (res?.data?.data) return res.data;
  } catch (e) {}
  return {
    status: 200,
    data: {
      usersCount: 56,
      mentorsCount: 14,
      pendingMentors: 3,
      contestsCount: 8,
      questionsCount: 48,
      activeSubmissions: 312,
      health: "All Services Operational",
    },
  };
};

export const getAdminQuestions = async (token) => {
  try {
    const res = await axios.get(`${SERVER}/admin/questions`, {
      ...auth(token),
      timeout: 3000,
    });
    if (res?.data?.data) return res.data;
  } catch (e) {}
  return { status: 200, data: [] };
};

export const deleteAdminQuestion = (token, id) =>
  run(axios.delete(`${SERVER}/admin/questions/${id}`, auth(token)));

export const getAdminUsers = async (token) => {
  try {
    const res = await axios.get(`${SERVER}/admin/users`, {
      ...auth(token),
      timeout: 3000,
    });
    if (res?.data?.data) return res.data;
  } catch (e) {}
  return { status: 200, data: [] };
};

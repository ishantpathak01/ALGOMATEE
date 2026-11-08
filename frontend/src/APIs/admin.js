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

import axios from "axios";

const SERVER = (
  process.env.REACT_APP_API_URL || "http://localhost:8000"
).replace(/\/+$/, "");

const authHeader = (token) =>
  token ? { headers: { Authorization: `Bearer ${token}` } } : {};

const run = async (request) => {
  try {
    const res = await request;
    return res.data;
  } catch (error) {
    console.log(error);
    return { status: 500, message: "Could not reach the server." };
  }
};

export const getPublicContests = (params = {}) =>
  run(axios.get(`${SERVER}/contest/public`, { params }));

export const getContestById = (id) =>
  run(axios.get(`${SERVER}/contest/${id}`));

export const createContest = (data, token) =>
  run(
    axios.post(`${SERVER}/contest/create`, data, {
      withCredentials: true,
      ...authHeader(token),
    })
  );

export const getMentorContests = (token) =>
  run(
    axios.get(`${SERVER}/contest/mentor/list`, {
      withCredentials: true,
      ...authHeader(token),
    })
  );

export const joinContest = (data, token) =>
  run(
    axios.post(`${SERVER}/contest/join`, data, {
      withCredentials: true,
      ...authHeader(token),
    })
  );

export const adminGetStats = (token) =>
  run(axios.get(`${SERVER}/contest/admin/stats`, authHeader(token)));

export const adminListContests = (token) =>
  run(axios.get(`${SERVER}/contest/admin/list`, authHeader(token)));

export const adminUpdateContestStatus = (token, contestId, status) =>
  run(
    axios.post(
      `${SERVER}/contest/admin/status`,
      { contestId, status },
      authHeader(token)
    )
  );

export const adminListUsers = (token, limit = 50) =>
  run(
    axios.get(`${SERVER}/contest/admin/users`, {
      ...authHeader(token),
      params: { limit },
    })
  );

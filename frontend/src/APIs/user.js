import axios from "axios";

const SERVER = "http://localhost:8000";

export const logIn = async (data) => {
  try {
    let res = await axios.post(`${SERVER}/user/login`, data, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const signUp = async (data) => {
  try {
    let res = await axios.post(`${SERVER}/user/signup`, data, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const logout = async (data) => {
  try {
    let res = await axios.post(`${SERVER}/user/logout`, data, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const verificationCode = async (data) => {
  try {
    let res = await axios.post(`${SERVER}/user/verificationCode`, data, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const resetPassword = async (data) => {
  try {
    let res = await axios.post(`${SERVER}/user/resetPassword`, data, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const getAllJobs = async (data) => {
  try {
    let res = await axios.get(`${SERVER}/user/getAllJobs`, { params: data });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const getAllMentors = async (data) => {
  try {
    let res = await axios.get(`${SERVER}/user/getAllMentors`, {
      params: { ...data },
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const getMentorData = async (data) => {
  try {
    let res = await axios.get(`${SERVER}/user/getMentorData`, {
      params: data,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const getAllCourses = async () => {
  try {
    let res = await axios.get(`${SERVER}/user/getAllCourses`);
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const requestDoubt = async (data) => {
  try {
    let res = await axios.post(`${SERVER}/user/requestDoubt`, data, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const getChat = async (data) => {
  try {
    let res = await axios.get(`${SERVER}/user/getChat`, {
      params: { ...data },
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const refreshRequest = async (Id) => {
  try {
    let res = await axios.get(`${SERVER}/user/refreshRequest`, {
      params: { Id },
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const updateUserProfile = async (data) => {
  try {
    let res = await axios.post(`${SERVER}/user/updateUserProfile`, data, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const getSubmissions = async (data) => {
  try {
    let res = await axios.get(`${SERVER}/user/getSubmissions`, {
      params: { ...data },
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const submitDoubtRating = async (data) => {
  try {
    let res = await axios.post(`${SERVER}/user/submitDoubtRating`, data, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};


export const getRewardTransections = async (data) => {
  try {
    let res = await axios.get(`${SERVER}/user/getRewardTransections`,  {
      params:{...data},
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};


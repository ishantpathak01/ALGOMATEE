import axios from "axios";
const SERVER = "http://localhost:8000";

export const logIn = async (data) => {
  try {
    let res = await axios.post(`${SERVER}/mentor/login`, data, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const signUp = async (data) => {
  try {
    let res = await axios.post(`${SERVER}/mentor/signup`, data, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const logout = async (data) => {
  try {
    let res = await axios.post(`${SERVER}/mentor/logout`, data, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const verificationCode = async (data) => {
  try {
    let res = await axios.post(`${SERVER}/mentor/verificationCode`, data, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const resetPassword = async (data) => {
  try {
    let res = await axios.post(`${SERVER}/mentor/resetPassword`, data, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const myJobs = async (data) => {
  try {
    let res = await axios.post(`${SERVER}/mentor/myJobs`, data, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const postJob = async (data) => {
  try {
    let res = await axios.post(`${SERVER}/mentor/postJob`, data, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const deleteJob = async (data) => {
  try {
    let res = await axios.delete(`${SERVER}/mentor/deleteJob`, {
      params: { ...data },
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const updateMentorProfile = async (data) => {
  try {
    let res = await axios.post(`${SERVER}/mentor/updateMentorProfile`, data, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const createCourse = async (data) => {
  try {
    let res = await axios.post(`${SERVER}/mentor/createCourse`, data, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const postArticle = async (data) => {
  try {
    let res = await axios.post(`${SERVER}/mentor/postArticle`, data, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const deleteArticle = async (data) => {
  try {
    let res = await axios.post(`${SERVER}/mentor/deleteArticle`, data, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const getArticle = async (data) => {
  try {
    let res = await axios.get(`${SERVER}/mentor/getArticle`, {
      params: data,
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const articleUpdate = async (data) => {
  try {
    let res = await axios.post(`${SERVER}/mentor/articleUpdate`, data, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const updateSlots = async (data) => {
  try {
    let res = await axios.post(`${SERVER}/mentor/updateSlots`, data, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const acceptDoubtRequest = async (data) => {
  try {
    let res = await axios.post(`${SERVER}/mentor/acceptDoubtRequest`, data, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const rejectDoubtRequest = async (data) => {
  try {
    let res = await axios.post(`${SERVER}/mentor/rejectDoubtRequest`, data, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const refreshRequest = async (Id) => {
  try {
    let res = await axios.get(`${SERVER}/mentor/refreshRequest`, {
      params: { Id },
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};
export const getChat = async (data) => {
  try {
    let res = await axios.get(`${SERVER}/mentor/getChat`, {
      params: { ...data },
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const getUnverifiedMentors = async (data) => {
  try {
    let res = await axios.get(`${SERVER}/mentor/getUnverifiedMentors`, {
      params: { ...data },
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const approveMentor = async (data) => {
  try {
    let res = await axios.post(`${SERVER}/mentor/approveMentor`, data, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const approveArticle = async (data) => {
  try {
    let res = await axios.post(`${SERVER}/mentor/approveArticle`, data, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const getUnverifiedArticles = async (data) => {
  try {
    let res = await axios.get(`${SERVER}/mentor/getUnverifiedArticles`, {
      params: { ...data },
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const getUnverifiedArticle = async (data) => {
  try {
    let res = await axios.get(`${SERVER}/mentor/getUnverifiedArticle`, {
      params: { ...data },
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

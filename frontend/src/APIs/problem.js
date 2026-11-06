import axios from "axios";
const SERVER = process.env.REACT_APP_API_URL || "http://localhost:8000";

export const addCodingProblem = async (data) => {
  try {
    let res = await axios.post(`${SERVER}/problem/addCodingProblem`, data, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const getCodingProblem = async (data) => {
  try {
    let res = await axios.get(`${SERVER}/problem/getCodingProblem`, {
      params: data,
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const getCodingSheet = async (data) => {
  try {
    let res = await axios.get(`${SERVER}/problem/getCodingSheet`, {
      params: { ...data },
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const deleteCodingProblem = async (data) => {
  try {
    let res = await axios.delete(`${SERVER}/problem/deleteCodingProblem`, {
      params: { ...data },
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const addChoiceBasedProblem = async (data) => {
  try {
    let res = await axios.post(
      `${SERVER}/problem/addChoiceBasedProblem`,
      data,
      { withCredentials: true }
    );
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const getChoiceBasedProblem = async (data) => {
  try {
    let res = await axios.post(
      `${SERVER}/problem/getChoiceBasedProblem`,
      data,
      { withCredentials: true }
    );
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const getChoiceBasedSheet = async (data) => {
  try {
    let res = await axios.post(`${SERVER}/problem/getChoiceBasedSheet`, data, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const deleteChoiceBasedProblem = async (data) => {
  try {
    let res = await axios.delete(`${SERVER}/problem/deleteChoiceBasedProblem`, {
      params: { ...data },
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const submitCode = async (data) => {
  try {
    let res = await axios.post(`${SERVER}/problem/coding/submitCode`, data, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const generateCodingAssessment = async (data) => {
  try {
    let res = await axios.post(
      `${SERVER}/problem/generateCodingAssessment`,
      data,
      { withCredentials: true }
    );
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const generateChoiceBasedAssessment = async (data) => {
  try {
    let res = await axios.post(
      `${SERVER}/problem/generateChoiceBasedAssessment`,
      data,
      { withCredentials: true }
    );
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const checkMCQScore = async (data) => {
  try {
    let res = await axios.post(`${SERVER}/problem/checkMCQScore`, data);
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const assignmentScore = async (data) => {
  try {
    let res = await axios.get(`${SERVER}/problem/assignmentScore`, {
      params: { ...data },
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const getSolvedCodingQuestionsList = async (data) => {
  try {
    let res = await axios.get(
      `${SERVER}/problem/getSolvedCodingQuestionsList`,
      {
        params: { ...data },
        withCredentials: true,
      }
    );
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const addDevQuestion = async (data) => {
  try {
    let res = await axios.post(`${SERVER}/problem/addDevQuestion`, data, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const getDevSheet = async (data) => {
  try {
    let res = await axios.get(`${SERVER}/problem/getDevSheet`, {
      params: { ...data },
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const deleteDevProblem = async (data) => {
  try {
    let res = await axios.delete(`${SERVER}/problem/deleteDevProblem`, {
      params: { ...data },
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const getDevProblem = async (data) => {
  try {
    let res = await axios.get(`${SERVER}/problem/getDevProblem`, {
      params: data,
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const submitDevCode = async (data) => {
  try {
    let res = await axios.post(
      `${SERVER}/problem/development/submitCode`,
      data,
      {
        withCredentials: true,
      }
    );
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const generateDevelopmentAssessment = async (data) => {
  try {
    let res = await axios.post(
      `${SERVER}/problem/generateDevelopmentAssessment`,
      data,
      { withCredentials: true }
    );
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

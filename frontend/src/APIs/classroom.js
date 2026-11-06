import axios from "axios";
const SERVER = process.env.REACT_APP_API_URL || "http://localhost:8000";

export const createSection = async (data) => {
  try {
    let res = await axios.post(`${SERVER}/section/createSection`, data, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const getMySections = async (data) => {
  try {
    let res = await axios.get(`${SERVER}/section/getMySections`, {
      params: { ...data },
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const addStudent = async (data) => {
  try {
    let res = await axios.post(`${SERVER}/section/addStudent`, data, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const saveNotes = async (data) => {
  try {
    let res = await axios.post(`${SERVER}/section/saveNotes`, data, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const getNotes = async (data) => {
  try {
    let res = await axios.post(`${SERVER}/section/getNotes`, data, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const deleteAssignment = async (data) => {
  try {
    let res = await axios.delete(`${SERVER}/section/deleteAssignment`, {
      params: { ...data },
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const addAssignment = async (data) => {
  try {
    let res = await axios.post(`${SERVER}/section/addAssignment`, data, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const updateAssignment = async (data) => {
  try {
    let res = await axios.put(`${SERVER}/section/updateAssignment`, data, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const getAssignments = async (data) => {
  try {
    let res = await axios.get(`${SERVER}/section/getAssignments`, {
      params: { ...data },
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const getSuggestions = async (data) => {
  try {
    let res = await axios.get(`${SERVER}/problem/getSuggestions`, {
      params: { ...data },
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const getAssignmentScore = async (data) => {
  try {
    let res = await axios.get(`${SERVER}/section/getAssignmentScore`, {
      params: { ...data },
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const getNotesCalendar = async (data) => {
  try {
    let res = await axios.get(`${SERVER}/section/getNotesCalendar`, {
      params: { ...data },
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const addNotesInCalendar = async (data) => {
  try {
    let res = await axios.post(`${SERVER}/section/addNotesInCalendar`, data, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const updateCalanderNote = async (data) => {
  try {
    let res = await axios.post(`${SERVER}/section/updateCalanderNote`, data, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

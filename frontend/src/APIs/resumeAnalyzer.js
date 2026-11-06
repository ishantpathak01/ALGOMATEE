import axios from "axios";

const SERVER = process.env.REACT_APP_API_URL || "http://localhost:8000";

/**
 * Upload a PDF file and get AI resume analysis.
 * @param {File} file - The PDF File object from the browser
 * @param {{ company: string, role: string, experience: string, skills: string }} jobDetails
 * @param {function} onProgress - Optional callback (percent: number) => void
 */
export const analyseResume = async (file, jobDetails = {}, onProgress) => {
  try {
    const formData = new FormData();
    formData.append("resume", file);
    if (jobDetails.company)    formData.append("company",    jobDetails.company);
    if (jobDetails.role)       formData.append("role",       jobDetails.role);
    if (jobDetails.experience) formData.append("experience", jobDetails.experience);
    if (jobDetails.skills)     formData.append("skills",     jobDetails.skills);

    const res = await axios.post(`${SERVER}/resume/analyse`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
      onUploadProgress: (event) => {
        if (onProgress && event.total) {
          onProgress(Math.round((event.loaded * 100) / event.total));
        }
      },
    });

    return res.data;
  } catch (error) {
    console.error("analyseResume error:", error);
    return { status: 500, message: "Network error. Please try again." };
  }
};

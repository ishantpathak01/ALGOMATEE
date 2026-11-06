import axios from "axios";

const SERVER = process.env.REACT_APP_API_URL || "http://localhost:8000";

/**
 * Send the full conversation history and get the AI reply.
 * @param {Array<{role: string, content: string}>} messages
 */
export const sendChatMessage = async (messages) => {
  try {
    const res = await axios.post(
      `${SERVER}/chatbot/message`,
      { messages },
      { withCredentials: true }
    );
    return res.data;
  } catch (error) {
    console.error("sendChatMessage error:", error);
    return { status: 500, message: "Network error. Please try again." };
  }
};

import axios from "axios";
import https from "https";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

const groqAgent = new https.Agent({ rejectUnauthorized: false });

const SYSTEM_PROMPT = `You are AlgoBot, an expert AI assistant for AlgoMate — a platform for mastering Data Structures & Algorithms, Full-Stack Development, Competitive Programming, and Technical Interview Preparation.

Your responsibilities:
- Answer only technical questions related to coding, DSA, development, and interviews
- Help with algorithms, time/space complexity, coding patterns
- Assist with React, Node.js, MongoDB, APIs, and backend concepts
- Guide users in interview prep (DSA, system design basics, behavioral tips)
- Review and improve code snippets if provided
- Suggest concise study plans and resources when relevant

STRICT RULES:
- Do NOT answer non-technical or unrelated questions
- If the query is non-technical, respond:
  "I can only help with coding, development, and technical interview topics."
- Keep responses concise (20–50 words on average)
- Avoid long explanations unless explicitly asked
- Prefer bullet points or short paragraphs
- Use code blocks only when necessary

STYLE:
- Clear, direct, and helpful
- Slightly friendly but not verbose
- No unnecessary explanations or filler content`

export const chatMessage = async (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.json({ status: 400, message: "No messages provided." });
    }

    // Sanitise: keep only role + content, cap history at last 20 messages
    const history = messages
      .slice(-20)
      .filter((m) => m.role && m.content)
      .map(({ role, content }) => ({ role, content: String(content).slice(0, 4000) }));

    let aiResponse;
    try {
      aiResponse = await axios.post(
        GROQ_API_URL,
        {
          model: GROQ_MODEL,
          messages: [{ role: "system", content: SYSTEM_PROMPT }, ...history],
          temperature: 0.65,
          max_tokens: 1024,
        },
        {
          headers: {
            Authorization: `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 30000,
          httpsAgent: groqAgent,
        }
      );
    } catch (err) {
      console.error("Chatbot Groq error:", err?.response?.data || err.message);
      return res.json({ status: 502, message: "AI service unavailable. Please try again." });
    }

    const reply = aiResponse.data?.choices?.[0]?.message?.content ?? "";
    return res.json({ status: 200, reply });

  } catch (err) {
    console.error("chatMessage unexpected error:", err);
    return res.json({ status: 500, message: "An unexpected error occurred." });
  }
};

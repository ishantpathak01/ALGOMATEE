import { extractText } from "unpdf";
import axios from "axios";
import https from "https";

// Bypass SSL verification only for the Groq API call (Windows cert-chain issue)
const groqAgent = new https.Agent({ rejectUnauthorized: false });

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

/* ── Build the AI prompt ── */
const buildPrompt = (resumeText, jobDetails = {}) => {
  const { company, role, experience, skills } = jobDetails;
  const hasContext = company || role || experience || skills;

  const jobContext = hasContext ? `
Target Job Information provided by the candidate:
- Target Company: ${company || "Not specified"}
- Target Role/Position: ${role || "Not specified"}
- Experience Level: ${experience || "Not specified"}
- Skills they want to highlight: ${skills || "Not specified"}
` : "";

  return `
You are an expert resume reviewer, ATS specialist, and career coach.
Analyse the resume below${hasContext ? " against the target job information" : ""} and return ONLY a valid JSON object.
${jobContext}
Resume Text:
"""
${resumeText.slice(0, 12000)}
"""

Return exactly this JSON structure:
{
  "score": <integer 0-100 overall resume quality score>,
  "roleMatch": <integer 0-100, how well resume matches the target role — use 50 if no role given>,
  "metrics": [
    { "label": "ATS Compatibility", "value": "<score>/100" },
    { "label": "Keyword Match",     "value": "<score>/100" },
    { "label": "Skills Coverage",   "value": "<score>/100" },
    { "label": "Formatting",        "value": "<score>/100" }
  ],
  "suggestions": [
    { "type": "success", "text": "<specific strength of this resume>" },
    { "type": "warning", "text": "<specific improvement needed>" },
    { "type": "error",   "text": "<critical gap or missing element>" }
  ],
  "missingSkills": [
    { "skill": "<skill or topic name>", "importance": "<high|medium|low>", "estimatedTime": "<e.g. 1-2 weeks>" }
  ],
  "roleSpecificFeedback": "<2-3 sentence paragraph of targeted advice for this specific role/company. If no role given, provide general improvement advice.>"
}

Rules:
- "type" must be exactly one of: "success", "warning", "error"
- Provide at least 2 items of each type in suggestions (6-10 total)
- missingSkills: list 3-6 skills/topics the candidate is missing or should improve for the target role. Be specific.
- estimatedTime must be a realistic human-readable string like "1-2 weeks", "~1 month", "2-3 months"
- importance must be exactly one of: "high", "medium", "low"
- Scores must be realistic integers (vary them)
- Return ONLY the JSON object, nothing else
`;
};

/* ── Controller ── */
export const analyseResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.json({ status: 400, message: "No PDF file uploaded." });
    }

    if (req.file.mimetype !== "application/pdf") {
      return res.json({ status: 400, message: "Only PDF files are accepted." });
    }

    /* 1. Extract text from PDF buffer */
    let resumeText;
    try {
      const { text } = await extractText(new Uint8Array(req.file.buffer), { mergePages: true });
      resumeText = text?.trim();
    } catch (err) {
      console.error("unpdf error:", err.message);
      return res.json({ status: 422, message: "Could not read the PDF. Please make sure it contains selectable text." });
    }

    if (!resumeText || resumeText.length < 50) {
      return res.json({ status: 422, message: "The PDF appears to be empty or image-based. Please upload a text-based resume." });
    }

    /* 2. Send to Groq AI */
    const jobDetails = {
      company:    req.body.company    || "",
      role:       req.body.role       || "",
      experience: req.body.experience || "",
      skills:     req.body.skills     || "",
    };

    let aiResponse;
    try {
      aiResponse = await axios.post(
        GROQ_API_URL,
        {
          model: GROQ_MODEL,
          messages: [
            { role: "system", content: "You are a resume analysis AI and career coach. Always respond with pure JSON only." },
            { role: "user",   content: buildPrompt(resumeText, jobDetails) },
          ],
          temperature: 0.4,
          max_tokens: 2000,
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
      console.error("Groq API error:", err?.response?.data || err.message);
      return res.json({ status: 502, message: "AI service unavailable. Please try again." });
    }

    /* 3. Parse AI JSON response */
    const raw = aiResponse.data?.choices?.[0]?.message?.content ?? "";

    let result;
    try {
      const cleaned = raw.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
      result = JSON.parse(cleaned);
    } catch {
      console.error("AI returned non-JSON:", raw);
      return res.json({ status: 500, message: "AI returned an unexpected response. Please try again." });
    }

    /* 4. Basic validation */
    if (
      typeof result.score !== "number" ||
      !Array.isArray(result.metrics) ||
      !Array.isArray(result.suggestions)
    ) {
      return res.json({ status: 500, message: "Malformed AI response. Please try again." });
    }

    // Ensure optional fields always exist
    result.missingSkills        = Array.isArray(result.missingSkills)  ? result.missingSkills  : [];
    result.roleSpecificFeedback = result.roleSpecificFeedback           || "";
    result.roleMatch            = typeof result.roleMatch === "number"  ? result.roleMatch      : null;

    return res.json({ status: 200, data: result });

  } catch (err) {
    console.error("analyseResume unexpected error:", err);
    return res.json({ status: 500, message: "An unexpected error occurred." });
  }
};
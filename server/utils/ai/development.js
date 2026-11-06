// === CONFIG ===
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama3-70b-8192";
import { JSDOM } from "jsdom";

// === UTILS ===
function extractCodeSections(html) {
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  return {
    html: doc.documentElement.outerHTML,
    css: Array.from(doc.querySelectorAll("style"))
      .map((s) => s.textContent)
      .join("\n"),
    js: Array.from(doc.querySelectorAll("script:not([src])"))
      .map((s) => s.textContent)
      .join("\n"),
  };
}

async function compareImplementations(reference, student, rules) {
  const prompt = `Compare these two HTML implementations strictly:
  
  REFERENCE IMPLEMENTATION:
  ${reference.html}
  
  STUDENT IMPLEMENTATION:
  ${student.html}

  Evaluation Rules:
  ${rules}

  Return JSON with:
  {
    "html": {
      "score": 0-100,
      "feedback": "What's missing/incorrect",
      "structureMatch": boolean,
      "elementsMatch": boolean
    },
    "css": {
      "score": 0-100,
      "feedback": "Layout differences",
      "layoutMatch": boolean,
      "selectorsMatch": boolean
    },
    "js": {
      "score": 0-100,
      "feedback": "Functionality differences",
      "functionalityMatch": boolean,
      "logicMatch": boolean
    },
    "overallScore": 0-100
  }

  STRICTLY FOLLOW THESE RULES:
  1. Return ONLY the JSON object with no additional text
  2. If implementations are identical, score should be 100
  3. If student submitted boilerplate unchanged, score should be 0`;

  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.1,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    // Validate response structure
    if (!data?.choices?.[0]?.message?.content) {
      throw new Error("Invalid API response structure");
    }

    // Extract JSON from response
    const content = data.choices[0].message.content;
    let jsonResponse;

    try {
      // First try to parse directly
      jsonResponse = JSON.parse(content);
    } catch (e) {
      // If that fails, try to extract JSON from text
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No valid JSON found in response");
      }
      jsonResponse = JSON.parse(jsonMatch[0]);
    }

    // Validate the evaluation structure
    if (!jsonResponse.html || !jsonResponse.css || !jsonResponse.js) {
      throw new Error("Incomplete evaluation data");
    }

    return jsonResponse;
  } catch (error) {
    console.error("Comparison error:", error);
    // Return a default failed evaluation
    return {
      html: {
        score: 0,
        feedback: "Evaluation failed",
        structureMatch: false,
        elementsMatch: false,
      },
      css: {
        score: 0,
        feedback: "Evaluation failed",
        layoutMatch: false,
        selectorsMatch: false,
      },
      js: {
        score: 0,
        feedback: "Evaluation failed",
        functionalityMatch: false,
        logicMatch: false,
      },
      overallScore: 0,
      error: true,
    };
  }
}

async function evaluateFile(referenceFile, studentFile) {
  // First check if student submitted boilerplate unchanged
  if (studentFile.content.trim() === referenceFile.boilerplate.trim()) {
    return {
      Score: 0,
      Feedback: "You submitted the boilerplate code without changes",
      isBoilerplate: true,
    };
  }

  const refSections = extractCodeSections(referenceFile.content);
  const studentSections = extractCodeSections(studentFile.content);

  const evaluation = await compareImplementations(
    refSections,
    studentSections,
    referenceFile.testingPoints || "Compare structure and functionality"
  );

  // If comparison failed, return failure
  if (evaluation.error) {
    return {
      Score: 0,
      Feedback: "Evaluation system error. Please try again.",
      error: true,
    };
  }

  // Calculate weighted score
  const weights = { html: 0.5, css: 0.3, js: 0.2 };
  let weightedScore = 0;

  if (evaluation.html) weightedScore += evaluation.html.score * weights.html;
  if (evaluation.css) weightedScore += evaluation.css.score * weights.css;
  if (evaluation.js) weightedScore += evaluation.js.score * weights.js;

  return {
    Score: Math.round(weightedScore),
    Feedback: [
      evaluation.html?.feedback,
      evaluation.css?.feedback,
      evaluation.js?.feedback,
    ]
      .filter(Boolean)
      .join(" "),
    Details: evaluation,
  };
}

// === MAIN FUNCTION ===
const CalculateScore = async ({ ValidFiles, TestingFiles }) => {
  try {
    if (!ValidFiles?.length || !TestingFiles?.length) {
      return {
        Score: 0,
        Feedback: "Missing required files for evaluation",
      };
    }

    // Match files by name
    const studentFilesMap = new Map(
      TestingFiles.map((file) => [file.name, file])
    );
    let totalScore = 0;
    let fileCount = 0;
    let feedback = [];

    for (const refFile of ValidFiles) {
      const studentFile = studentFilesMap.get(refFile.name);
      if (!studentFile) {
        feedback.push(`${refFile.name}: Missing`);
        continue;
      }

      const result = await evaluateFile(refFile, studentFile);
      totalScore += result.Score;
      fileCount++;
      feedback.push(`${refFile.name}: - ${result.Feedback}`);
    }

    const finalScore = fileCount > 0 ? Math.round(totalScore / fileCount) : 0;

    return {
      Score: finalScore,
      Feedback: feedback.join("\n"),
      isComplete: fileCount === ValidFiles.length,
    };
  } catch (error) {
    console.error("Scoring error:", error);
    return {
      Score: 0,
      Feedback: "Evaluation system error. Please try again.",
      error: true,
    };
  }
};

export default CalculateScore;

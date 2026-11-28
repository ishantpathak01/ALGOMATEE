// Code execution for AlgoMate (default = same as before):
//   JavaScript -> Node's vm, Python / C++ / Java / C -> Judge0 CE
//   (free public https://ce.judge0.com, or your own JUDGE0_URL, or RAPIDAPI_KEY).
// Optional: set JUDGE_ENGINE=local on a machine that has bubblewrap + compilers to use the faster
// queued sandbox judge (judge.js) instead. If it can't run there, we fall back to Judge0 automatically.
import axios from "axios";
import vm from "vm";

const USE_LOCAL = process.env.JUDGE_ENGINE === "local";
let localJudge = null; // loaded lazily, only when JUDGE_ENGINE=local
const loadLocal = async () => (localJudge ||= await import("./judge.js"));

export async function getJudgeStats() {
  return USE_LOCAL ? (await loadLocal()).getJudgeStats() : { engine: "judge0" };
}

/** Java "class Solution" style code -> add a Main that reads one token and prints the result. */
export function wrapCode(lang, code) {
  if (lang === "java") {
    // Old starter template nested Main inside Solution (invalid Java) -> unwrap it.
    code = code.replace(/^\s*class\s+Solution\s*\{\s*(public\s+class\s+Main\b[\s\S]*\})\s*\}\s*$/, "$1");
  }
  if (lang === "java" && !code.includes("public static void main")) {
    const m = code.match(/public\s+(?:\w+\s+)*(\w+)\s+([a-zA-Z0-9_]+)\s*\(/);
    const method = m ? m[2] : "solve";
    return `import java.util.*;\n${code}\npublic class Main {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    if (sc.hasNext()) { System.out.print(new Solution().${method}(sc.next())); }\n  }\n}`;
  }
  return code;
}

export function normalizeLang(l) {
  const x = String(l || "javascript").toLowerCase();
  if (x === "js") return "javascript";
  if (x === "py" || x === "python3") return "python";
  if (x === "c++") return "cpp";
  return x;
}


/* ---------------------------------------------------------- fallback engine */
const JUDGE0_LANG = { python: 71, cpp: 54, java: 62, c: 50, javascript: 63 };

function legacyRunJs(code, input) {
  const out = [];
  const fmt = (a) => (typeof a === "object" ? JSON.stringify(a) : String(a));
  const log = (...a) => out.push(a.map(fmt).join(" "));
  const lines = input.split(/\r?\n/);
  let li = 0;
  const sandbox = {
    console: { log, info: log, warn: log, error: log },
    input,
    readInput: () => input,
    readLine: () => lines[li++] ?? "",
    require: (m) => {
      if (m === "fs") return { readFileSync: () => input };
      throw new Error("Module not available: " + m);
    },
    process: { stdout: { write: (s) => out.push(String(s).replace(/\n$/, "")) } },
  };
  try {
    vm.createContext(sandbox);
    vm.runInContext(code, sandbox, { timeout: 2000 });
    return { stdout: out.join("\n"), stderr: "" };
  } catch (err) {
    const msg = err?.code === "ERR_SCRIPT_EXECUTION_TIMEOUT" ? "Time Limit Exceeded" : err.message || String(err);
    return { stdout: out.join("\n"), stderr: msg };
  }
}

async function legacyRunJudge0(lang, code, input) {
  const languageId = JUDGE0_LANG[lang];
  if (!languageId) return { stdout: "", stderr: `Unsupported language: ${lang}` };

  const selfHosted = process.env.JUDGE0_URL;
  const rapidKey = process.env.RAPIDAPI_KEY;
  // Priority: self-hosted > RapidAPI key > free public server (no key).
  const base = selfHosted || (rapidKey ? "https://judge0-ce.p.rapidapi.com" : "https://ce.judge0.com");
  const headers = { "Content-Type": "application/json" };
  if (!selfHosted && rapidKey) {
    headers["x-rapidapi-key"] = rapidKey;
    headers["x-rapidapi-host"] = "judge0-ce.p.rapidapi.com";
  }

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const { data } = await axios.post(
        `${base}/submissions?base64_encoded=false&wait=true`,
        { language_id: languageId, source_code: wrapCode(lang, code), stdin: input, cpu_time_limit: 5 },
        { headers, timeout: 20000 }
      );
      await sleep(400);
      if (data.compile_output) return { stdout: "", stderr: data.compile_output };
      if (data.status?.id === 5) return { stdout: data.stdout || "", stderr: "Time Limit Exceeded" };
      return { stdout: data.stdout || "", stderr: data.stderr || (data.status?.id > 4 ? data.status.description : "") };
    } catch (err) {
      if (err?.response?.status === 429 && attempt < 4) {
        await sleep(1500 * (attempt + 1));
        continue;
      }
      const msg = err?.response?.data?.message || err?.response?.data?.error || err.message;
      return { stdout: "", stderr: err?.response?.status === 429 ? "Judge0 is busy (rate limited). Please try again in a few seconds." : msg };
    }
  }
  return { stdout: "", stderr: "Judge0 is busy. Please try again." };
}

let warnedFallback = false;
async function legacyMany(lang, rawCode, list) {
  if (!warnedFallback) {
    warnedFallback = true;
    console.log("[execute] using Judge0 / vm engine" + (USE_LOCAL ? " (local judge unavailable on this host)" : ""));
  }
  const out = [];
  for (const input of list) {
    out.push(lang === "javascript" ? legacyRunJs(rawCode, input) : await legacyRunJudge0(lang, rawCode, input));
  }
  return out;
}

const MAX_CODE_CHARS = 100000;

/**
 * Compile ONCE, run the program against every input.
 * Resolves to [{ stdout, stderr }, ...] in the same order as `inputs`.
 * Rejects (err.code === "JUDGE_BUSY", err.status === 503) when the judge is overloaded;
 * callers should tell the user to retry and must not count it as a failed attempt.
 * opts.owner: user id, used to stop one person from filling the queue.
 */
export async function executeMany(language, code, inputs, opts = {}) {
  const lang = normalizeLang(language);
  const list = (inputs?.length ? inputs : [""]).map((i) => String(i ?? ""));
  if (!JUDGE0_LANG[lang]) return list.map(() => ({ stdout: "", stderr: `Unsupported language: ${lang}` }));
  if (String(code || "").length > MAX_CODE_CHARS) return list.map(() => ({ stdout: "", stderr: "Code is too long" }));
  if (USE_LOCAL) {
    try {
      const { runJudge } = await loadLocal();
      return await runJudge({ lang, code: wrapCode(lang, String(code)), inputs: list, owner: opts.owner ? String(opts.owner) : undefined });
    } catch (e) {
      if (e.code !== "JUDGE_UNAVAILABLE") throw e; // JUDGE_BUSY: caller asks the student to retry
    }
  }
  return legacyMany(lang, String(code), list);
}

/** Runs one program against one input. Always returns { stdout, stderr } (a busy judge shows up as stderr). */
export async function executeOne(language, code, input = "", opts = {}) {
  try {
    return (await executeMany(language, code, [input], opts))[0];
  } catch (e) {
    return { stdout: "", stderr: e.message };
  }
}

/** Strict compare: ignores only trailing spaces and trailing blank lines. */
export function outputsMatch(actual, expected) {
  const norm = (s) => String(s ?? "").replace(/\r\n/g, "\n").split("\n").map((l) => l.trimEnd()).join("\n").trim();
  return norm(actual) === norm(expected);
}

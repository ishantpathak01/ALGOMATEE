// Real code execution for AlgoMate.
// JavaScript runs inside Node's vm (no external service needed).
// Python / C++ / Java / C run on Judge0 CE (the free public Piston API closed on 15 Feb 2026).
//
// By default Python / C++ / Java / C run on the FREE public Judge0 server
// (https://ce.judge0.com) — no API key, no payment needed. It is community-run
// and rate limited; for heavy use set one of these in server/.env:
//   JUDGE0_URL=http://localhost:2358       -> your own self-hosted Judge0 (no key needed)
//   RAPIDAPI_KEY=...                       -> uses judge0-ce.p.rapidapi.com (paid plans)
import axios from "axios";
import vm from "vm";

const JUDGE0_LANG = { python: 71, cpp: 54, java: 62, c: 50, javascript: 63 };

/** Java "class Solution" style code -> add a Main that reads one token and prints the result. */
export function wrapCode(lang, code) {
  if (lang === "java" && !code.includes("public static void main")) {
    const m = code.match(/public\s+(?:\w+\s+)*(\w+)\s+([a-zA-Z0-9_]+)\s*\(/);
    const method = m ? m[2] : "solve";
    return `import java.util.*;\n${code}\npublic class Main {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    if (sc.hasNext()) { System.out.print(new Solution().${method}(sc.next())); }\n  }\n}`;
  }
  return code;
}

function runJs(code, input) {
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

async function runJudge0(lang, code, input) {
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

export function normalizeLang(l) {
  const x = String(l || "javascript").toLowerCase();
  if (x === "js") return "javascript";
  if (x === "py" || x === "python3") return "python";
  if (x === "c++") return "cpp";
  return x;
}

/** Runs one program against one input. Always returns { stdout, stderr }. */
export async function executeOne(language, code, input = "") {
  const lang = normalizeLang(language);
  if (lang === "javascript") return runJs(code, String(input));
  return runJudge0(lang, code, String(input));
}

/** Strict compare: ignores only trailing spaces and trailing blank lines. */
export function outputsMatch(actual, expected) {
  const norm = (s) => String(s ?? "").replace(/\r\n/g, "\n").split("\n").map((l) => l.trimEnd()).join("\n").trim();
  return norm(actual) === norm(expected);
}

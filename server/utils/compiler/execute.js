// Code execution for AlgoMate: everything goes through the queued, sandboxed judge (see judge.js).
// No external service (Judge0) and no in-process vm: user code always runs in its own sandboxed process.
import { runJudge, getJudgeStats, LANGS } from "./judge.js";

export { getJudgeStats };

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

const MAX_CODE_CHARS = 100000;

/**
 * Compile ONCE, run the program against every input.
 * Resolves to [{ stdout, stderr }, ...] in the same order as `inputs`.
 * Rejects (err.code === "JUDGE_BUSY" | "JUDGE_UNAVAILABLE", err.status === 503) when the judge could not take the job;
 * callers should tell the user to retry and must not count it as a failed attempt.
 * opts.owner: user id, used to stop one person from filling the queue.
 */
export async function executeMany(language, code, inputs, opts = {}) {
  const lang = normalizeLang(language);
  const list = (inputs?.length ? inputs : [""]).map((i) => String(i ?? ""));
  if (!LANGS[lang]) return list.map(() => ({ stdout: "", stderr: `Unsupported language: ${lang}` }));
  if (String(code || "").length > MAX_CODE_CHARS) return list.map(() => ({ stdout: "", stderr: "Code is too long" }));
  return runJudge({ lang, code: wrapCode(lang, String(code)), inputs: list, owner: opts.owner ? String(opts.owner) : undefined });
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

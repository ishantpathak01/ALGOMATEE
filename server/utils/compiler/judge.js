// AlgoMate judge: a bounded job queue in front of a sandboxed (bubblewrap) runner.
//
//   one JOB = one submission  ->  compile ONCE, then run every test input
//   JUDGE_CONCURRENCY jobs run at the same time (default: CPU cores - 1)
//   everything beyond that waits in a queue; if the queue is full we say "busy"
//   instead of letting the machine thrash.
//
// Env knobs (all optional):
//   JUDGE_CONCURRENCY    parallel jobs                         (default cores-1, min 1)
//   JUDGE_MAX_QUEUE      max waiting jobs before "busy"        (default 200)
//   JUDGE_MAX_PER_OWNER  max queued+running jobs per user      (default 2)
//   JUDGE_NPROC          process cap inside the sandbox        (default 1024)
//   JUDGE_ALLOW_UNSAFE=1 run WITHOUT a sandbox (local dev only, never in production)
import { spawn, spawnSync } from "child_process";
import fsp from "fs/promises";
import fs from "fs";
import os from "os";
import path from "path";

const CONCURRENCY = Number(process.env.JUDGE_CONCURRENCY) || Math.max(1, os.cpus().length - 1);
const MAX_QUEUE = Number(process.env.JUDGE_MAX_QUEUE) || 200;
const MAX_PER_OWNER = Number(process.env.JUDGE_MAX_PER_OWNER) || 2;
const NPROC = Number(process.env.JUDGE_NPROC) || 1024;
const MAX_OUT = 1024 * 1024; // 1 MB of stdout/stderr per run
const MAX_ERR_TEXT = 3000;
const MEM_BYTES = 256 * 1024 * 1024;

// Old vm-based JS runner printed objects as JSON and exposed input/readLine/readInput.
// Keep that behaviour, but lazily, so a program that reads stdin itself still works.
const JS_PRELUDE =
  'Object.defineProperty(globalThis,"input",{configurable:true,get(){try{return require("fs").readFileSync(0,"utf8")}catch(e){return ""}}});' +
  'globalThis.readInput=()=>globalThis.input;let __l=null,__i=0;globalThis.readLine=()=>{if(!__l)__l=globalThis.input.split(/\\r?\\n/);return __l[__i++]??""};' +
  "{const f=a=>typeof a==='object'?JSON.stringify(a):String(a);const w=(...a)=>process.stdout.write(a.map(f).join(' ')+'\\n');console.log=w;console.info=w;}";

export const LANGS = {
  python: { file: "main.py", run: ["python3", "-B", "main.py"], timeMs: 5000 },
  javascript: { file: "main.js", run: ["node", "--max-old-space-size=200", "main.js"], timeMs: 3000, noAs: true, prelude: JS_PRELUDE },
  c: { file: "main.c", compile: ["gcc", "-O2", "-std=gnu17", "-o", "main", "main.c", "-lm"], run: ["./main"], timeMs: 2000 },
  cpp: { file: "main.cpp", compile: ["g++", "-O2", "-std=gnu++17", "-o", "main", "main.cpp"], run: ["./main"], timeMs: 2000 },
  java: {
    file: "Main.java",
    compile: ["javac", "-J-Xmx256m", "Main.java"],
    run: ["java", "-Xmx256m", "-Xss16m", "-XX:+UseSerialGC", "Main"],
    timeMs: 4000,
    noAs: true,
  },
};

/* ------------------------------------------------------- tool resolution */
// Node (nvm) and Java (sdkman) live in odd places on Codespaces/dev boxes and are not on the sandbox's PATH.
// So we find every tool on the HOST once, run it by absolute path, and mount its folder if it is outside /usr.
const SYS_DIRS = ["/usr", "/bin", "/sbin", "/lib", "/lib64"];
const underSys = (q) => SYS_DIRS.some((d) => q === d || q.startsWith(d + "/"));
const TOOL_PATH = {};
const TOOL_DIRS = new Set();
const EXTRA_BINDS = new Set();

function resolveTool(name) {
  if (name.startsWith(".") || name.startsWith("/")) return name;
  if (TOOL_PATH[name] !== undefined) return TOOL_PATH[name] || name;
  const r = spawnSync("sh", ["-c", `command -v ${name}`], { encoding: "utf8" });
  const found = (r.stdout || "").trim().split("\n")[0];
  TOOL_PATH[name] = found.startsWith("/") ? found : "";
  const abs = TOOL_PATH[name];
  if (abs) {
    TOOL_DIRS.add(path.dirname(abs));
    let real = abs;
    try { real = fs.realpathSync(abs); } catch {}
    for (const q of new Set([abs, real])) {
      const root = path.dirname(path.dirname(q));
      if (!underSys(q) && root !== "/") EXTRA_BINDS.add(root);
    }
  }
  return abs || name;
}
const toolCmd = (cmd) => [resolveTool(cmd[0]), ...cmd.slice(1)];
const MISSING_TOOLS = [];
for (const [lang, L] of Object.entries(LANGS)) {
  for (const cmd of [L.compile, L.run]) {
    if (cmd && !cmd[0].startsWith(".") && !resolveTool(cmd[0]).startsWith("/")) MISSING_TOOLS.push(`${lang}:${cmd[0]}`);
  }
}

/* ------------------------------------------------------------------ sandbox */

function probeSandbox() {
  const probe = spawnSync(
    "bwrap",
    ["--unshare-all", "--ro-bind", "/usr", "/usr", "--ro-bind-try", "/bin", "/bin", "--ro-bind-try", "/lib", "/lib", "--ro-bind-try", "/lib64", "/lib64", "--proc", "/proc", "--dev", "/dev", "--", "/usr/bin/true"],
    { timeout: 5000 }
  );
  if (probe.status === 0) return "bwrap";
  return process.env.JUDGE_ALLOW_UNSAFE === "1" ? "none" : "unavailable";
}
const SANDBOX = probeSandbox();
console.log(
  `[judge] sandbox=${SANDBOX} concurrency=${CONCURRENCY} maxQueue=${MAX_QUEUE} perUser=${MAX_PER_OWNER}` +
    (SANDBOX === "none" ? "  !! NO SANDBOX - dev only !!" : SANDBOX === "unavailable" ? "  !! bwrap not usable: code runs are refused !!" : "")
);
console.log(`[judge] tools: ${Object.entries(TOOL_PATH).map(([k, v]) => `${k}=${v || "MISSING"}`).join(" ")}`);
if (MISSING_TOOLS.length) console.log(`[judge] WARNING missing on this machine: ${MISSING_TOOLS.join(", ")}`);

const ETC_BINDS = (() => {
  const list = ["/etc/alternatives", "/etc/ld.so.cache", "/etc/ld.so.conf", "/etc/ld.so.conf.d"];
  try {
    for (const f of fs.readdirSync("/etc")) if (f.startsWith("java")) list.push(`/etc/${f}`);
  } catch {}
  return list;
})();

function sandboxed(dir, cmd) {
  const a = [
    "--unshare-all", "--die-with-parent", "--new-session", "--clearenv",
    "--setenv", "PATH", [...TOOL_DIRS, "/usr/local/bin", "/usr/bin", "/bin"].join(":"),
    "--setenv", "HOME", "/work", "--setenv", "LANG", "C.UTF-8",
  ];
  for (const d of ["/usr", "/bin", "/sbin", "/lib", "/lib64"]) a.push("--ro-bind-try", d, d);
  for (const d of ETC_BINDS) a.push("--ro-bind-try", d, d);
  for (const d of EXTRA_BINDS) a.push("--ro-bind-try", d, d);
  a.push("--bind", dir, "/work", "--proc", "/proc", "--dev", "/dev", "--tmpfs", "/tmp", "--chdir", "/work", "--", ...cmd);
  return ["bwrap", a];
}

function limited(cmd, { cpuSec, asBytes, nofile }) {
  const p = ["prlimit", `--cpu=${cpuSec}`, `--fsize=${10 * 1024 * 1024}`, `--nofile=${nofile}`, `--nproc=${NPROC}`];
  if (asBytes) p.push(`--as=${asBytes}`);
  return [...p, ...cmd];
}

/** Runs one command in the sandbox. Never rejects. */
function execSandboxed(dir, cmd, { stdin = "", timeMs, cpuSec, asBytes, nofile = 64 }) {
  return new Promise((resolve) => {
    const full = limited(cmd, { cpuSec, asBytes, nofile });
    let bin, args;
    if (SANDBOX === "bwrap") [bin, args] = sandboxed(dir, full);
    else [bin, args] = [full[0], full.slice(1)];

    const started = Date.now();
    let p;
    try {
      p = spawn(bin, args, { cwd: dir, detached: true, env: SANDBOX === "bwrap" ? {} : { PATH: process.env.PATH, HOME: dir }, stdio: ["pipe", "pipe", "pipe"] });
    } catch (e) {
      return resolve({ code: -1, signal: null, stdout: "", stderr: String(e.message), timedOut: false, outputExceeded: false, ms: 0 });
    }

    let out = [], err = [], outLen = 0, errLen = 0, timedOut = false, outputExceeded = false, done = false;
    const killGroup = () => { try { process.kill(-p.pid, "SIGKILL"); } catch { try { p.kill("SIGKILL"); } catch {} } };
    const timer = setTimeout(() => { timedOut = true; killGroup(); }, timeMs);

    p.stdout.on("data", (d) => { outLen += d.length; if (outLen > MAX_OUT) { outputExceeded = true; killGroup(); } else out.push(d); });
    p.stderr.on("data", (d) => { errLen += d.length; if (errLen <= MAX_OUT) err.push(d); });
    p.stdin.on("error", () => {}); // program exited without reading input: ignore EPIPE
    p.stdin.end(stdin);

    const finish = (code, signal) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      killGroup(); // make sure nothing is left running
      resolve({ code, signal, stdout: Buffer.concat(out).toString("utf8"), stderr: Buffer.concat(err).toString("utf8"), timedOut, outputExceeded, ms: Date.now() - started });
    };
    p.on("error", (e) => { err.push(Buffer.from(String(e.message))); finish(-1, null); });
    p.on("close", finish);
  });
}

/* ------------------------------------------------------------------ one job */

function verdictOf(r) {
  if (r.timedOut || r.signal === "SIGXCPU" || r.code === 152) return { stdout: "", stderr: "Time Limit Exceeded" };
  if (r.outputExceeded) return { stdout: "", stderr: "Output Limit Exceeded" };
  if (r.code !== 0) {
    const text = r.stderr.trim().slice(0, MAX_ERR_TEXT);
    const why = r.code === 137 || r.signal === "SIGKILL" ? "Runtime Error: killed (probably Memory Limit Exceeded)" : `Runtime Error (exit code ${r.code})`;
    return { stdout: r.stdout, stderr: text || why };
  }
  // exit 0: stderr noise (warnings, JVM notes) is not a failure
  return { stdout: r.stdout, stderr: "" };
}

async function processJob({ lang, code, inputs }) {
  const L = LANGS[lang];
  const dir = await fsp.mkdtemp(path.join(process.env.JUDGE_TMP || os.tmpdir(), "judge-"));
  try {
    await fsp.writeFile(path.join(dir, L.file), (L.prelude || "") + code);

    if (L.compile) {
      const c = await execSandboxed(dir, toolCmd(L.compile), { timeMs: 15000, cpuSec: 15, asBytes: L.noAs ? 0 : 1536 * 1024 * 1024, nofile: 256 });
      if (c.code !== 0) {
        const msg = (c.timedOut ? "Compilation timed out" : (c.stderr || c.stdout).trim()).slice(0, MAX_ERR_TEXT) || "Compilation failed";
        return inputs.map(() => ({ stdout: "", stderr: msg }));
      }
    }

    const results = [];
    for (const input of inputs) {
      const r = await execSandboxed(dir, toolCmd(L.run), {
        stdin: input,
        timeMs: L.timeMs,
        cpuSec: Math.ceil(L.timeMs / 1000) + 1,
        asBytes: L.noAs ? 0 : MEM_BYTES,
        nofile: 64,
      });
      results.push(verdictOf(r));
    }
    return results;
  } finally {
    fsp.rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}

/* -------------------------------------------------------------------- queue */

const waiting = [];
const perOwner = new Map();
let running = 0;
const stats = { done: 0, rejected: 0, totalWaitMs: 0, totalRunMs: 0 };

function judgeError(message, code) {
  const e = new Error(message);
  e.code = code;
  e.status = 503;
  return e;
}

function release(owner) {
  if (!owner) return;
  const n = (perOwner.get(owner) || 1) - 1;
  n <= 0 ? perOwner.delete(owner) : perOwner.set(owner, n);
}

function pump() {
  while (running < CONCURRENCY && waiting.length) {
    const job = waiting.shift();
    running++;
    const startedAt = Date.now();
    stats.totalWaitMs += startedAt - job.queuedAt;
    processJob(job)
      .then(job.resolve, (e) => job.resolve(job.inputs.map(() => ({ stdout: "", stderr: `Judge error: ${e.message}` }))))
      .finally(() => {
        running--;
        stats.done++;
        stats.totalRunMs += Date.now() - startedAt;
        release(job.owner);
        pump();
      });
  }
}

/**
 * Judge one submission. Resolves to [{stdout, stderr}] (one per input).
 * REJECTS with err.code = JUDGE_BUSY | JUDGE_UNAVAILABLE when the submission could not be judged at all,
 * so callers must NOT record it as a wrong answer.
 */
export function runJudge({ lang, code, inputs, owner }) {
  if (!LANGS[lang]) return Promise.resolve(inputs.map(() => ({ stdout: "", stderr: `Unsupported language: ${lang}` })));
  if (SANDBOX === "unavailable") {
    return Promise.reject(judgeError("Code runner is not available on this server (bubblewrap missing).", "JUDGE_UNAVAILABLE"));
  }
  const missing = MISSING_TOOLS.filter((m) => m.startsWith(lang + ":")).map((m) => m.split(":")[1]);
  if (missing.length) {
    return Promise.reject(judgeError(`${lang} is not installed on this server (missing: ${missing.join(", ")}).`, "JUDGE_UNAVAILABLE"));
  }
  if (waiting.length >= MAX_QUEUE) {
    stats.rejected++;
    return Promise.reject(judgeError("The judge is very busy right now. Please try again in a few seconds.", "JUDGE_BUSY"));
  }
  if (owner && (perOwner.get(owner) || 0) >= MAX_PER_OWNER) {
    stats.rejected++;
    return Promise.reject(judgeError("You already have submissions being judged. Wait for them to finish.", "JUDGE_BUSY"));
  }
  return new Promise((resolve) => {
    if (owner) perOwner.set(owner, (perOwner.get(owner) || 0) + 1);
    waiting.push({ lang, code, inputs, owner, resolve, queuedAt: Date.now() });
    pump();
  });
}

export function getJudgeStats() {
  return {
    sandbox: SANDBOX,
    concurrency: CONCURRENCY,
    running,
    waiting: waiting.length,
    maxQueue: MAX_QUEUE,
    finished: stats.done,
    rejected: stats.rejected,
    avgWaitMs: stats.done ? Math.round(stats.totalWaitMs / stats.done) : 0,
    avgRunMs: stats.done ? Math.round(stats.totalRunMs / stats.done) : 0,
  };
}

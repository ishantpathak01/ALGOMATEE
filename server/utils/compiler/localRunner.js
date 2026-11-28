// Runs Python / C / C++ / Java on THIS server (free, no Judge0, no daily cap).
//
// Safety: every compile and every run happens inside a "bubblewrap" (bwrap) sandbox:
//   - no network, no access to the server's files / .env / database password (only a private /work folder)
//   - empty environment, own process tree that is killed on timeout, CPU / memory / output limits
// If bwrap is missing or cannot run (e.g. inside some Docker hosts), or the compiler for a language is not
// installed, that language automatically goes to Judge0 instead (see execute.js). Nothing breaks.
//
// .env options:
//   LOCAL_RUNNER=auto            (default)  use local runner when it is safe; "off" = always Judge0
//   LOCAL_RUNNER_UNSAFE=true     allow running WITHOUT the sandbox (only on a private machine you fully trust)
//   LOCAL_MAX_CONCURRENT=3       how many programs may run at the same time (default: CPU cores, 2..4)
import { spawn, spawnSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import crypto from "crypto";

const MODE = (process.env.LOCAL_RUNNER || "auto").toLowerCase();
const UNSAFE = String(process.env.LOCAL_RUNNER_UNSAFE || "").toLowerCase() === "true";
const MAX_PARALLEL = Math.max(1, parseInt(process.env.LOCAL_MAX_CONCURRENT || "", 10) || Math.min(4, Math.max(2, os.cpus().length)));
const OUT_CAP = 1_000_000; // bytes of stdout kept
const ERR_CAP = 2_000; // chars of error text kept

const has = (bin) => spawnSync("sh", ["-c", `command -v ${bin}`], { encoding: "utf8" }).status === 0;
const exists = (p) => {
  try {
    fs.lstatSync(p);
    return true;
  } catch (e) {
    return false;
  }
};

/** Read-only view of the system programs + one writable private folder. Nothing else of the server is visible. */
function bwrapBase(workDir, writable) {
  const a = [
    "--unshare-all", "--die-with-parent", "--new-session", "--clearenv",
    "--setenv", "PATH", "/usr/bin:/bin", "--setenv", "HOME", "/work", "--setenv", "LANG", "C.UTF-8",
    "--ro-bind", "/usr", "/usr",
  ];
  for (const d of ["/lib", "/lib64", "/bin", "/sbin"]) {
    if (!exists(d)) continue;
    const st = fs.lstatSync(d);
    if (st.isSymbolicLink()) a.push("--symlink", fs.readlinkSync(d), d);
    else a.push("--ro-bind", d, d);
  }
  const etc = ["/etc/alternatives", "/etc/ld.so.cache", "/etc/localtime"];
  try {
    fs.readdirSync("/etc").filter((n) => n.startsWith("java-")).forEach((n) => etc.push("/etc/" + n));
  } catch (e) {}
  for (const p of etc) if (exists(p)) a.push("--ro-bind", p, p);
  a.push("--proc", "/proc", "--dev", "/dev", "--tmpfs", "/tmp", writable ? "--bind" : "--ro-bind", workDir, "/work", "--chdir", "/work");
  return a;
}

// ---------- what can this machine do? (checked once) ----------
let caps = null;
export function localCapabilities() {
  if (caps) return caps;
  caps = { sandbox: false, unsafe: UNSAFE, python: false, c: false, cpp: false, java: false, note: "" };
  if (MODE === "off") return Object.assign(caps, { note: "LOCAL_RUNNER=off -> all languages use Judge0" });
  if (process.platform !== "linux") return Object.assign(caps, { note: "not Linux -> Judge0" });
  const tools = {
    python: has("python3"),
    c: has("gcc"),
    cpp: has("g++"),
    java: has("javac") && has("java"),
  };
  if (has("bwrap")) {
    const t = fs.mkdtempSync(path.join(os.tmpdir(), "algo-chk-"));
    const r = spawnSync("bwrap", [...bwrapBase(t, true), "true"], { timeout: 8000 });
    caps.sandbox = r.status === 0;
    fs.rmSync(t, { recursive: true, force: true });
    if (!caps.sandbox) caps.note = "bwrap is installed but cannot start here (host blocks user namespaces)";
  } else {
    caps.note = "bwrap not installed (sudo apt-get install -y bubblewrap)";
  }
  const allowed = caps.sandbox || UNSAFE;
  for (const k of Object.keys(tools)) caps[k] = tools[k] && allowed;
  return caps;
}
export const localUsable = (lang) => !!localCapabilities()[lang];

// ---------- small FIFO limiter ----------
let active = 0;
const waiting = [];
const acquire = () =>
  new Promise((res) => {
    if (active < MAX_PARALLEL) {
      active++;
      res();
    } else waiting.push(res);
  });
const release = () => {
  const n = waiting.shift();
  if (n) n();
  else active--;
};

/** One sandboxed process. Always resolves: { code, signal, stdout, stderr, timedOut } */
function exec(cmd, { workDir, writable, stdin = "", wallMs, cpuSec, asBytes, fsizeMb = 16 }) {
  return new Promise((resolve, reject) => {
    const limits = ["prlimit", `--cpu=${cpuSec}`, "--nproc=512", `--fsize=${fsizeMb * 1048576}`, "--core=0"];
    if (asBytes) limits.push(`--as=${asBytes}`);
    limits.push("--");
    const sandboxed = caps.sandbox;
    const file = sandboxed ? "bwrap" : limits[0];
    const args = sandboxed ? [...bwrapBase(workDir, writable), ...limits, ...cmd] : [...limits.slice(1), ...cmd];
    const child = spawn(file, args, { env: sandboxed ? {} : { PATH: "/usr/bin:/bin", HOME: workDir }, cwd: sandboxed ? os.tmpdir() : workDir, stdio: ["pipe", "pipe", "pipe"], detached: !sandboxed });
    let stdout = "";
    let stderr = "";
    let timedOut = false;
    let outputExceeded = false;
    let done = false;
    const startedAt = Date.now();
    const kill = () => {
      try {
        if (sandboxed) child.kill("SIGKILL");
        else process.kill(-child.pid, "SIGKILL");
      } catch (e) {}
    };
    const timer = setTimeout(() => {
      timedOut = true;
      kill();
    }, wallMs);
    const finish = (r) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      resolve(r);
    };
    child.stdout.on("data", (d) => {
      if (stdout.length < OUT_CAP) stdout += d;
      else {
        outputExceeded = true;
        kill();
      }
    });
    child.stderr.on("data", (d) => {
      if (stderr.length < 20_000) stderr += d;
    });
    child.on("error", (e) => {
      clearTimeout(timer);
      if (!done) {
        done = true;
        reject(e);
      }
    });
    child.on("close", (code, signal) => {
      // The CPU limit kills a busy loop with SIGKILL (exit 137) or SIGXCPU (exit 152): that is a time limit, not a crash.
      const ms = Date.now() - startedAt;
      const cpuKill = (code === 137 || code === 152 || signal === "SIGKILL" || signal === "SIGXCPU") && ms >= cpuSec * 1000 - 400;
      finish({ code, signal, stdout, stderr, outputExceeded, timedOut: timedOut || cpuKill });
    });
    child.stdin.on("error", () => {});
    child.stdin.end(stdin);
  });
}

const clean = (s) => String(s || "").replace(/\/work\//g, "").replace(/\0/g, "").trim().slice(0, ERR_CAP);

// ---------- compile once per submission, run many test cases ----------
const builds = new Map(); // sha1(lang+code) -> { promise, dir, at }

const javaClassName = (code) => (code.match(/public\s+(?:final\s+|abstract\s+)?class\s+([A-Za-z_]\w*)/) || [])[1] || "Main";

async function compile(lang, code, dir) {
  const CPU = { wallMs: 20_000, cpuSec: 15, writable: true, workDir: dir };
  await acquire();
  try {
    if (lang === "python") {
      fs.writeFileSync(path.join(dir, "main.py"), code);
      return { ok: true, run: ["python3", "-I", "-B", "main.py"], wallMs: 5000, cpuSec: 4, asBytes: 768 * 1048576 };
    }
    if (lang === "c" || lang === "cpp") {
      const file = lang === "c" ? "main.c" : "main.cpp";
      fs.writeFileSync(path.join(dir, file), code);
      const cmd = lang === "c" ? ["gcc", "-O2", "-std=gnu11", "-o", "main", file, "-lm"] : ["g++", "-O2", "-std=gnu++17", "-o", "main", file];
      const r = await exec(cmd, CPU);
      if (r.timedOut) return { ok: false, error: "Compilation timed out" };
      if (r.code !== 0) return { ok: false, error: clean(r.stderr) || "Compilation failed" };
      return { ok: true, run: ["./main"], wallMs: 4000, cpuSec: 3, asBytes: 768 * 1048576 };
    }
    // java
    const cls = javaClassName(code);
    fs.writeFileSync(path.join(dir, cls + ".java"), code);
    const r = await exec(["javac", "-J-Xmx256m", "-d", ".", cls + ".java"], CPU);
    if (r.timedOut) return { ok: false, error: "Compilation timed out" };
    if (r.code !== 0) return { ok: false, error: clean(r.stderr) || "Compilation failed" };
    return { ok: true, run: ["java", "-Xmx256m", "-Xss8m", "-XX:+UseSerialGC", "-cp", ".", cls], wallMs: 8000, cpuSec: 7, asBytes: 0 };
  } finally {
    release();
  }
}

function getBuild(lang, code) {
  const key = crypto.createHash("sha1").update(lang + "\0" + code).digest("hex");
  let b = builds.get(key);
  if (b) return b.promise;
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "algo-run-"));
  b = { dir, promise: compile(lang, code, dir) };
  builds.set(key, b);
  const drop = () => {
    builds.delete(key);
    fs.rm(dir, { recursive: true, force: true }, () => {});
  };
  setTimeout(drop, 5 * 60 * 1000).unref(); // a submission's build is only needed for a few seconds
  if (builds.size > 120) {
    const oldest = builds.keys().next().value;
    const ob = builds.get(oldest);
    builds.delete(oldest);
    fs.rm(ob.dir, { recursive: true, force: true }, () => {});
  }
  return b.promise;
}

/** Runs one program on one input. Returns { stdout, stderr } like the Judge0 path. Throws only on infrastructure errors. */
export async function runLocal(lang, code, input = "") {
  const key = crypto.createHash("sha1").update(lang + "\0" + code).digest("hex");
  const build = await getBuild(lang, code);
  if (!build.ok) return { stdout: "", stderr: build.error };
  const dir = builds.get(key)?.dir;
  if (!dir || !fs.existsSync(dir)) return runLocal(lang, code, input); // build was cleaned up: rebuild

  await acquire();
  try {
    const r = await exec(build.run, { workDir: dir, writable: false, stdin: String(input), wallMs: build.wallMs, cpuSec: build.cpuSec, asBytes: build.asBytes });
    if (r.outputExceeded) return { stdout: "", stderr: "Output limit exceeded" };
    if (r.timedOut) return { stdout: "", stderr: "Time Limit Exceeded" };
    if (r.code === 0) return { stdout: r.stdout, stderr: "" };
    const msg = clean(r.stderr);
    return { stdout: r.stdout, stderr: msg || `Runtime Error (${r.signal || "exit code " + r.code})` };
  } finally {
    release();
  }
}

// Load test for the code runner (the same path the contest Submit uses).
//
// Usage (from the server folder):
//   node --env-file=.env scripts/loadtest.js [students] [submitsEach] [language]
//   node --env-file=.env scripts/loadtest.js 20 3 python
//   node --env-file=.env scripts/loadtest.js 50 3 cpp
//
// Each "student" does `submitsEach` submits, every submit = 5 test cases (3 at a time),
// exactly like a contest Submit, through the real runner (local sandbox first, Judge0 as fallback).
// NOTE: languages that fall back to Judge0 use one Judge0 submission per test case (daily cap!).
import { executeOne, mapLimit, outputsMatch } from "../utils/compiler/execute.js";

const students = parseInt(process.argv[2] || "20", 10);
const submitsEach = parseInt(process.argv[3] || "3", 10);
const lang = (process.argv[4] || "python").toLowerCase();
const TESTS = 5;

const CODE = {
  python: "n=int(input())\nprint(n*2)",
  cpp: "#include <iostream>\nint main(){int n;std::cin>>n;std::cout<<n*2;}",
  c: '#include <stdio.h>\nint main(){int n;scanf("%d",&n);printf("%d",n*2);}',
  java: "import java.util.*;\npublic class Main{public static void main(String[] a){Scanner s=new Scanner(System.in);System.out.print(s.nextInt()*2);}}",
  javascript: "console.log(Number(readLine())*2)",
};
if (!CODE[lang]) {
  console.log("Language must be one of:", Object.keys(CODE).join(", "));
  process.exit(1);
}

const tests = Array.from({ length: TESTS }, (_, i) => ({ input: String(i + 1), output: String((i + 1) * 2) }));
const target = process.env.JUDGE0_URL || (process.env.RAPIDAPI_KEY ? "RapidAPI Judge0" : "free public ce.judge0.com") + " (only for languages the local runner cannot do)";
console.log(`Testing ${students} students x ${submitsEach} submits x ${TESTS} tests (${lang}) on: ${target}`);
console.log(`Queue limit JUDGE0_MAX_CONCURRENT=${process.env.JUDGE0_MAX_CONCURRENT || 8}\n`);

const times = [];
const errors = {};
let ok = 0;
let bad = 0;

const submitOnce = async () => {
  const t0 = Date.now();
  const runs = await mapLimit(tests, 3, (t) => executeOne(lang, CODE[lang], t.input));
  let allOk = true;
  runs.forEach((r, i) => {
    if (r.stderr || !outputsMatch(r.stdout, tests[i].output)) {
      allOk = false;
      const key = String(r.stderr || "wrong output").slice(0, 90);
      errors[key] = (errors[key] || 0) + 1;
    }
  });
  times.push((Date.now() - t0) / 1000);
  allOk ? ok++ : bad++;
};

const start = Date.now();
await Promise.all(
  Array.from({ length: students }, async () => {
    for (let i = 0; i < submitsEach; i++) await submitOnce();
  })
);
const total = (Date.now() - start) / 1000;

times.sort((a, b) => a - b);
const pct = (p) => times[Math.min(times.length - 1, Math.floor(times.length * p))] || 0;
console.log("---------------- RESULT ----------------");
console.log(`Submits OK: ${ok}   Failed: ${bad}   (total ${ok + bad})`);
console.log(`Time per submit  -> fastest ${times[0]?.toFixed(1)}s | median ${pct(0.5).toFixed(1)}s | slowest ${times[times.length - 1]?.toFixed(1)}s`);
console.log(`Whole test took ${total.toFixed(1)}s, program runs: ${(ok + bad) * TESTS}`);
if (Object.keys(errors).length) {
  console.log("\nProblems seen:");
  Object.entries(errors).forEach(([k, v]) => console.log(`  ${v}x  ${k}`));
}
const failRate = bad / Math.max(1, ok + bad);
console.log(
  "\nVERDICT:",
  failRate === 0 && pct(0.5) < 10
    ? "GOOD - this setup handled the load."
    : failRate <= 0.05
    ? "OK but slow or a few errors - lower JUDGE0_MAX_CONCURRENT or upgrade before the contest."
    : "NOT READY - too many failures at this load."
);
process.exit(0);

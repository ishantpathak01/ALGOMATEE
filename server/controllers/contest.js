import jwt from "jsonwebtoken";
import Contest from "../models/Contest.js";
import User from "../models/user.js";
import { executeMany, outputsMatch } from "../utils/compiler/execute.js";

export const WRONG_PENALTY_MINUTES = 5;

const round2 = (n) => Math.round(n * 100) / 100;
/** Minutes (with decimals) from the participant's entry to a submission, taken from real timestamps. */
const minsOf = (sub, part) => {
  if (sub?.submittedAt && part?.enteredAt) {
    const ms = new Date(sub.submittedAt) - new Date(part.enteredAt);
    if (!isNaN(ms)) return Math.max(0, round2(ms / 60000));
  }
  return sub?.minutesFromEntry || 0;
};

const isId = (id) => /^[a-f0-9]{24}$/i.test(String(id || ""));

/** Problems as the browser may see them once the contest is open for that person:
 *  hidden test cases are NEVER sent (only how many there are). */
const revealedProblems = (problems = []) =>
  problems.map((p) => {
    const o = p.toObject ? p.toObject() : { ...p };
    const all = o.testcases || [];
    return {
      ...o,
      testcases: all.filter((t) => !t.isHidden),
      hiddenTestcaseCount: all.filter((t) => t.isHidden).length,
    };
  });

/** Before the contest starts nobody sees the questions: only an id, difficulty and points. */
const maskedProblems = (problems = []) =>
  problems.map((p) => ({
    _id: p._id,
    difficulty: p.difficulty,
    points: p.points,
    locked: true,
  }));

/** Admin-panel token (Bearer) can always see everything. */
const isPanelAdminReq = (req) => {
  try {
    const header = req.headers?.authorization || "";
    if (!header.startsWith("Bearer ")) return false;
    const payload = jwt.verify(header.slice(7), `${process.env.SECRET_KEY}:admin`);
    return payload.role === "admin";
  } catch (e) {
    return false;
  }
};

/** Never send other people's code, hidden test cases or (before the contest) the questions. */
const sanitize = (contestDoc, { reveal = false } = {}) => {
  const c = contestDoc.toObject ? contestDoc.toObject() : { ...contestDoc };
  const nowMs = Date.now();
  c.status = nowMs < new Date(c.startTime).getTime() ? "upcoming" : nowMs > new Date(c.endTime).getTime() ? "completed" : "active";
  delete c.submissions;
  if (!c.winnersPublished) delete c.winners; // unpublished winners stay private
  delete c.participants;
  c.problems = reveal ? revealedProblems(c.problems) : maskedProblems(c.problems);
  c.participantCount = (contestDoc.participants || []).length;
  delete c.leaderboard; // ranking is admin-only; old stored rows are never sent
  return c;
};

/**
 * Leaderboard computed ONLY from real stored submissions.
 *  - Points of a problem count once, when its first Accepted submission arrives.
 *  - Time = minutes from the participant's entry to each accepted submission
 *    + 5 minutes for every wrong submission made on that problem before it.
 *  - Rank: more points first; tie -> lower total time first.
 */
export function computeLeaderboard(contest) {
  const problems = contest.problems || [];
  const pointsOf = {};
  problems.forEach((p) => (pointsOf[String(p._id)] = p.points || 0));

  const entered = {};
  (contest.participants || []).forEach((p) => (entered[p.userId] = p));

  const subs = [...(contest.submissions || [])].sort(
    (a, b) => new Date(a.submittedAt) - new Date(b.submittedAt)
  );

  const rows = {};
  const ensure = (userId, userName) => {
    if (!rows[userId]) {
      const part = entered[userId];
      rows[userId] = {
        userId,
        userName: part?.userName || userName || "Coder",
        avatar: part?.avatar || "",
        score: 0,
        problemsSolved: 0,
        finishTimeMinutes: 0,
        wrongSubmissions: 0,
        solvedProblemIds: [],
        _wrong: {},
        _solved: {},
      };
    }
    return rows[userId];
  };

  (contest.participants || []).forEach((p) => ensure(p.userId, p.userName));

  for (const s of subs) {
    const row = ensure(s.userId, s.userName);
    const pid = String(s.problemId);
    if (row._solved[pid]) continue; // already solved: later submissions don't matter
    if (s.isAccepted || s.status === "Accepted") {
      const wrong = row._wrong[pid] || 0;
      row._solved[pid] = true;
      row.score += pointsOf[pid] ?? s.pointsEarned ?? 0;
      row.problemsSolved += 1;
      row.finishTimeMinutes = round2(row.finishTimeMinutes + minsOf(s, entered[s.userId]) + wrong * WRONG_PENALTY_MINUTES);
      row.wrongSubmissions += wrong;
      row.solvedProblemIds.push(pid);
    } else {
      row._wrong[pid] = (row._wrong[pid] || 0) + 1;
    }
  }

  const list = Object.values(rows).map(({ _wrong, _solved, ...r }) => r);
  list.sort((a, b) => b.score - a.score || a.finishTimeMinutes - b.finishTimeMinutes);
  list.forEach((r, i) => (r.rank = i + 1));
  return list;
}

// ---------------------------------------------------------------- ADMIN ----
const ADMIN_VALUES = ["admin", "superadmin", "administrator"];

/** Admin if: email listed in env ADMIN_EMAILS, or a role-like field says admin. Fails closed. */
export const isAdminUser = (userDoc) => {
  if (!userDoc) return false;
  const u = userDoc.toObject ? userDoc.toObject() : userDoc;
  const emails = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  if (u.Email && emails.includes(String(u.Email).toLowerCase())) return true;
  if (u.isAdmin === true || u.IsAdmin === true) return true;
  for (const k of ["UserType", "Usertype", "userType", "Role", "role", "Type", "type"]) {
    if (u[k] && ADMIN_VALUES.includes(String(u[k]).toLowerCase())) return true;
  }
  return false;
};

export const requireAdmin = async (req, res, next) => {
  if (req.isPanelAdmin) return next();
  try {
    const user = await User.findById(req.user.Id);
    if (!isAdminUser(user)) {
      return res.status(403).json({ status: 403, message: "Only admin can view this." });
    }
    next();
  } catch (err) {
    return res.status(500).json({ status: 500, message: err.message });
  }
};

/** Full picture for the admin, from real stored data only. */
export function computeAdminReport(contest) {
  const problems = contest.problems || [];
  const subs = [...(contest.submissions || [])].sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt));

  const rows = (contest.participants || []).map((part) => {
    const mine = subs.filter((s) => s.userId === part.userId);
    let score = 0, solved = 0, totalTime = 0, wrongTotal = 0, lastSolveMin = 0;

    const perProblem = problems.map((p) => {
      const pid = String(p._id);
      const list = mine.filter((s) => String(s.problemId) === pid);
      const firstOk = list.find((s) => s.isAccepted || s.status === "Accepted");
      const before = firstOk ? list.filter((s) => s.submittedAt < firstOk.submittedAt || s === firstOk).length - 1 : list.length;
      const penalty = firstOk ? before * WRONG_PENALTY_MINUTES : 0;
      if (firstOk) {
        score += p.points || 0;
        solved += 1;
        totalTime = round2(totalTime + minsOf(firstOk, part) + penalty);
        wrongTotal += before;
        lastSolveMin = Math.max(lastSolveMin, minsOf(firstOk, part));
      }
      const best = list.reduce((m, s) => Math.max(m, s.passedTests || 0), 0);
      const last = list[list.length - 1];
      return {
        problemId: pid,
        title: p.title,
        points: p.points || 0,
        solved: !!firstOk,
        minutes: firstOk ? minsOf(firstOk, part) : null,
        wrongBeforeSolve: firstOk ? before : 0,
        penaltyMinutes: penalty,
        attempts: list.length,
        bestPassed: best,
        totalTests: (p.testcases || []).length,
        lastVerdict: last ? last.status : "Not attempted",
        submissions: list.map((s) => ({
          id: String(s._id),
          status: s.status,
          passed: s.passedTests,
          total: s.totalTests,
          language: s.language,
          minutesFromEntry: minsOf(s, part),
          submittedAt: s.submittedAt,
        })),
      };
    });

    return {
      userId: part.userId,
      name: part.userName,
      enteredAt: part.enteredAt,
      score,
      solvedCount: solved,
      totalProblems: problems.length,
      allSolved: problems.length > 0 && solved === problems.length,
      totalTimeMinutes: totalTime, // ranking time: minutes + 5 min per wrong try
      timeToSolveAllMinutes: problems.length > 0 && solved === problems.length ? lastSolveMin : null, // real clock time
      wrongSubmissions: wrongTotal,
      totalSubmissions: mine.length,
      perProblem,
    };
  });

  rows.sort((a, b) => b.score - a.score || a.totalTimeMinutes - b.totalTimeMinutes);
  rows.forEach((r, i) => (r.rank = i + 1));
  return rows;
}

export const getAdminResults = async (req, res) => {
  try {
    if (!isId(req.params.contestId)) return res.status(404).json({ status: 404, message: "Contest not found." });
    const contest = await Contest.findById(req.params.contestId);
    if (!contest) return res.status(404).json({ status: 404, message: "Contest not found." });

    const rows = computeAdminReport(contest);

    // attach e-mails from the user collection (best effort)
    try {
      const users = await User.find({ _id: { $in: rows.map((r) => r.userId) } }, { Email: 1 });
      const map = {};
      users.forEach((u) => (map[String(u._id)] = u.Email));
      rows.forEach((r) => (r.email = map[r.userId] || ""));
    } catch (e) {}

    const finishers = rows.filter((r) => r.allSolved);
    return res.status(200).json({
      status: 200,
      data: {
        contest: {
          id: String(contest._id),
          title: contest.title,
          startTime: contest.startTime,
          endTime: contest.endTime,
          durationMinutes: contest.durationMinutes,
          problems: contest.problems.map((p) => ({ id: String(p._id), title: p.title, points: p.points, difficulty: p.difficulty })),
        },
        summary: {
          registered: rows.length,
          solvedAll: finishers.length,
          avgTimeToSolveAll: finishers.length
            ? round2(finishers.reduce((t, r) => t + r.timeToSolveAllMinutes, 0) / finishers.length)
            : null,
        },
        participants: rows,
        winners: contest.winners || [],
        winnersPublished: !!contest.winnersPublished,
      },
    });
  } catch (err) {
    return res.status(500).json({ status: 500, message: err.message });
  }
};

export const getAdminSubmissionCode = async (req, res) => {
  try {
    const { contestId, subId } = req.params;
    if (!isId(contestId)) return res.status(404).json({ status: 404, message: "Contest not found." });
    const contest = await Contest.findById(contestId);
    const sub = contest?.submissions.id(subId);
    if (!sub) return res.status(404).json({ status: 404, message: "Submission not found." });
    return res.status(200).json({ status: 200, data: { code: sub.code, language: sub.language, status: sub.status, userName: sub.userName } });
  } catch (err) {
    return res.status(500).json({ status: 500, message: err.message });
  }
};

/** The contest shown on the home screen = the most recently assigned one that has not ended. */
export const getWeeklyContest = async (req, res) => {
  try {
    const contest = await Contest.findOne({ endTime: { $gt: new Date() } }).sort({ createdAt: -1 });
    if (!contest) return res.status(200).json({ status: 200, data: null, message: "No active contest right now." });
    return res.status(200).json({ status: 200, data: sanitize(contest, { reveal: isPanelAdminReq(req) }) });
  } catch (err) {
    return res.status(500).json({ status: 500, data: null, message: err.message });
  }
};

export const getAllContests = async (req, res) => {
  try {
    const contests = await Contest.find().sort({ createdAt: -1 });
    return res.status(200).json({ status: 200, data: contests.map((c) => sanitize(c, { reveal: isPanelAdminReq(req) })) });
  } catch (err) {
    return res.status(500).json({ status: 500, data: [], message: err.message });
  }
};

export const getContestById = async (req, res) => {
  try {
    if (!isId(req.params.id)) return res.status(404).json({ status: 404, data: null, message: "Contest not found." });
    const contest = await Contest.findById(req.params.id);
    if (!contest) return res.status(404).json({ status: 404, data: null, message: "Contest not found." });
    const uid = String(req.user?.Id || "");
    const entered = (contest.participants || []).some((p) => p.userId === uid);
    const ended = Date.now() > new Date(contest.endTime).getTime();
    // Questions are shown only to someone who pressed Start (or after the contest has ended).
    const reveal = isPanelAdminReq(req) || entered || ended;
    return res.status(200).json({ status: 200, data: sanitize(contest, { reveal }) });
  } catch (err) {
    return res.status(500).json({ status: 500, data: null, message: err.message });
  }
};

export const createContest = async (req, res) => {
  try {
    const { title, description, mentorName, mentorBio, mentorAvatar, durationMinutes, rewardCoins, difficulty, problems, startTime, endTime, isWeekly } = req.body;

    if (!title || !Array.isArray(problems) || problems.length === 0) {
      return res.status(400).json({ status: 400, message: "Contest title and at least one problem are required." });
    }
    for (const p of problems) {
      if (!(Number(p.points) > 0)) {
        return res.status(400).json({ status: 400, message: `Set points (> 0) for "${p.title || "a problem"}".` });
      }
      if (!p.testcases || p.testcases.length === 0 || p.testcases.some((t) => !String(t.output ?? "").trim())) {
        return res.status(400).json({ status: 400, message: `Every test case of "${p.title || "a problem"}" needs an expected output.` });
      }
    }

    for (const p of problems) {
      if (!(p.testcases || []).some((t) => !t.isHidden)) {
        return res.status(400).json({ status: 400, message: `\"${p.title || "A problem"}\" needs at least one visible (sample) test case.` });
      }
    }

    const sMs = new Date(startTime).getTime();
    const eMs = new Date(endTime).getTime();
    if (!startTime || !endTime || isNaN(sMs) || isNaN(eMs) || eMs <= sMs) {
      return res.status(400).json({ status: 400, message: "Set a valid start and end time (end must be after start)." });
    }
    if (!(Number(durationMinutes) > 0)) {
      return res.status(400).json({ status: 400, message: "Set the time per participant (minutes)." });
    }

    const newContest = await Contest.create({
      title,
      description: description || "",
      mentorName: mentorName || "AlgoMate Mentor",
      mentorBio: mentorBio || "",
      mentorAvatar: mentorAvatar || "",
      durationMinutes: Number(durationMinutes),
      rewardCoins: rewardCoins || 0,
      difficulty: difficulty || "Intermediate",
      problems: problems.map((p) => ({ ...p, source: "AlgoMate", externalUrl: "", points: Number(p.points) })),
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      isWeekly: isWeekly !== undefined ? isWeekly : true,
      status: "active",
    });

    return res.status(201).json({ status: 201, message: "Contest created successfully!", data: sanitize(newContest, { reveal: true }) });
  } catch (err) {
    return res.status(500).json({ status: 500, message: err.message || "Failed to create contest." });
  }
};

/** Participant presses "Start": the server stores the entry time ONCE. */
export const enterContest = async (req, res) => {
  try {
    const { contestId } = req.params;
    if (!isId(contestId)) return res.status(404).json({ status: 404, message: "Contest not found." });
    const contest = await Contest.findById(contestId);
    if (!contest) return res.status(404).json({ status: 404, message: "Contest not found." });

    const now = new Date();
    if (now < new Date(contest.startTime)) return res.status(400).json({ status: 400, message: "Contest has not started yet." });
    if (now > new Date(contest.endTime)) return res.status(400).json({ status: 400, message: "Contest has ended." });

    const userId = String(req.user.Id);
    let part = contest.participants.find((p) => p.userId === userId);
    if (!part) {
      const user = await User.findById(userId);
      contest.participants.push({ userId, userName: user?.Name || "Coder", avatar: user?.Picture || "", enteredAt: now });
      await contest.save();
      part = contest.participants.find((p) => p.userId === userId);
    }

    const me = computeLeaderboard(contest).find((r) => r.userId === userId);
    return res.status(200).json({
      status: 200,
      data: {
        enteredAt: part.enteredAt,
        durationMinutes: contest.durationMinutes,
        // your personal deadline: entry + your minutes, but never later than the contest close
        personalEndsAt: new Date(Math.min(new Date(part.enteredAt).getTime() + contest.durationMinutes * 60000, new Date(contest.endTime).getTime())),
        score: me?.score || 0,
        solvedProblemIds: me?.solvedProblemIds || [],
        problems: revealedProblems(contest.problems),
      },
    });
  } catch (err) {
    return res.status(500).json({ status: 500, message: err.message });
  }
};

export const getLeaderboard = async (req, res) => {
  try {
    if (!isId(req.params.contestId)) return res.status(404).json({ status: 404, data: [] });
    const contest = await Contest.findById(req.params.contestId);
    if (!contest) return res.status(404).json({ status: 404, data: [] });
    return res.status(200).json({ status: 200, data: computeLeaderboard(contest) });
  } catch (err) {
    return res.status(500).json({ status: 500, data: [], message: err.message });
  }
};

/** "Run" button: also checks the HIDDEN test cases, but only ever returns how many passed (never their input/output).
 *  Nothing is saved: no submission, no points, no penalty. */
export const runContestHidden = async (req, res) => {
  try {
    const { contestId } = req.params;
    const { problemId, code, language } = req.body;
    const userId = String(req.user.Id);

    if (!isId(contestId)) return res.status(404).json({ status: 404, message: "Contest not found." });
    if (!code || !problemId) return res.status(400).json({ status: 400, message: "Code and problem are required." });

    const contest = await Contest.findById(contestId);
    if (!contest) return res.status(404).json({ status: 404, message: "Contest not found." });

    const problem = contest.problems.find((p) => String(p._id) === String(problemId));
    if (!problem) return res.status(404).json({ status: 404, message: "Problem not found in this contest." });

    const part = contest.participants.find((p) => p.userId === userId);
    if (!part) return res.status(403).json({ status: 403, message: "Press Start to enter the contest first." });

    const now = new Date();
    const personalEnd = new Date(part.enteredAt).getTime() + (contest.durationMinutes || 90) * 60000;
    if (now > new Date(contest.endTime) || now.getTime() > personalEnd) {
      return res.status(400).json({ status: 400, message: "Your contest time is over." });
    }

    const hidden = (problem.testcases || []).filter((t) => t.isHidden);
    if (hidden.length === 0) {
      return res.status(200).json({ status: 200, data: { hiddenTotal: 0, hiddenPassed: 0 } });
    }

    let outputs;
    try {
      outputs = await executeMany(language, code, hidden.map((t) => String(t.input ?? "")), { owner: userId });
    } catch (e) {
      return res.status(503).json({ status: 503, message: e.message || "Judge is busy. Please retry." });
    }

    let hiddenPassed = 0;
    let errorKind = "";
    hidden.forEach((t, i) => {
      const { stdout, stderr } = outputs[i];
      if (stderr) {
        errorKind = errorKind || (/time limit/i.test(stderr) ? "Time Limit Exceeded" : "Runtime Error");
      } else if (outputsMatch(stdout, t.output)) {
        hiddenPassed++;
      }
    });

    return res.status(200).json({
      status: 200,
      data: { hiddenTotal: hidden.length, hiddenPassed, error: errorKind || undefined },
    });
  } catch (err) {
    return res.status(500).json({ status: 500, message: err.message || "Hidden test run failed." });
  }
};

/** Real judging: runs the code against the saved test cases of the problem. */
export const submitContestProblem = async (req, res) => {
  try {
    const { contestId } = req.params;
    const { problemId, code, language } = req.body;
    const userId = String(req.user.Id);

    if (!isId(contestId)) return res.status(404).json({ status: 404, message: "Contest not found." });
    if (!code || !problemId) return res.status(400).json({ status: 400, message: "Code and problem are required." });

    const contest = await Contest.findById(contestId);
    if (!contest) return res.status(404).json({ status: 404, message: "Contest not found." });

    const problem = contest.problems.find((p) => String(p._id) === String(problemId));
    if (!problem) return res.status(404).json({ status: 404, message: "Problem not found in this contest." });

    const part = contest.participants.find((p) => p.userId === userId);
    if (!part) return res.status(403).json({ status: 403, message: "Press Start to enter the contest first." });

    const now = new Date();
    const personalEnd = new Date(part.enteredAt).getTime() + (contest.durationMinutes || 90) * 60000;
    if (now > new Date(contest.endTime) || now.getTime() > personalEnd) {
      return res.status(400).json({ status: 400, message: "Your contest time is over." });
    }

    // Already solved -> don't judge again, don't add points/time.
    const already = contest.submissions.some(
      (s) => s.userId === userId && String(s.problemId) === String(problemId) && s.isAccepted
    );
    if (already) {
      return res.status(200).json({ status: 200, message: "Already solved.", data: { status: "Accepted", alreadySolved: true, passed: 0, failed: 0, total: 0, pointsEarned: 0 } });
    }

    const tests = problem.testcases || [];
    let passed = 0;
    let verdict = "Accepted";
    let errorText = "";
    // Compile ONCE, run every test. If the judge is too busy to take the job we tell the student to retry
    // and do NOT record a failed attempt (so no penalty minutes for our overload).
    let outputs;
    try {
      outputs = await executeMany(language, code, tests.map((t) => String(t.input ?? "")), { owner: userId });
    } catch (e) {
      return res.status(503).json({ status: 503, message: e.message || "Judge is busy. Please retry." });
    }
    tests.forEach((t, i) => {
      const { stdout, stderr } = outputs[i];
      if (stderr) {
        verdict = /time limit/i.test(stderr) ? "Time Limit Exceeded" : "Runtime Error";
        errorText = errorText || stderr;
      } else if (outputsMatch(stdout, t.output)) {
        passed++;
      } else if (verdict === "Accepted") {
        verdict = "Wrong Answer";
      }
    });
    const total = tests.length;
    const accepted = total > 0 && passed === total;
    if (!accepted && verdict === "Accepted") verdict = "Wrong Answer";

    const minutesFromEntry = Math.max(0, round2((now - new Date(part.enteredAt)) / 60000));
    const wrongBefore = contest.submissions.filter(
      (s) => s.userId === userId && String(s.problemId) === String(problemId) && !s.isAccepted
    ).length;

    contest.submissions.push({
      userId,
      userName: part.userName,
      problemId: String(problemId),
      code,
      language: language || "javascript",
      status: accepted ? "Accepted" : verdict,
      isAccepted: accepted,
      minutesFromEntry,
      passedTests: passed,
      totalTests: total,
      pointsEarned: accepted ? problem.points : 0,
      submittedAt: now,
    });
    await contest.save();

    const me = computeLeaderboard(contest).find((r) => r.userId === userId);
    return res.status(200).json({
      status: 200,
      message: accepted ? "Accepted! All test cases passed." : verdict,
      data: {
        status: accepted ? "Accepted" : verdict,
        passed,
        failed: total - passed,
        total,
        pointsEarned: accepted ? problem.points : 0,
        minutes: minutesFromEntry,
        penaltyMinutes: accepted ? wrongBefore * WRONG_PENALTY_MINUTES : 0,
        wrongSoFar: wrongBefore + (accepted ? 0 : 1),
        score: me?.score || 0,
        solvedProblemIds: me?.solvedProblemIds || [],
        error: errorText || undefined,
      },
    });
  } catch (err) {
    return res.status(500).json({ status: 500, message: err.message || "Judging failed." });
  }
};


/** Admin only: permanently remove a contest (problems, participants, submissions go with it). */
export const deleteContest = async (req, res) => {
  try {
    if (!isId(req.params.contestId)) return res.status(404).json({ status: 404, message: "Contest not found." });
    const deleted = await Contest.findByIdAndDelete(req.params.contestId);
    if (!deleted) return res.status(404).json({ status: 404, message: "Contest not found." });
    return res.status(200).json({ status: 200, message: "Contest deleted." });
  } catch (err) {
    return res.status(500).json({ status: 500, message: err.message });
  }
};


/** Admin only: manually choose the top 3 (any participants, any order) and optionally publish them. */
export const setContestWinners = async (req, res) => {
  try {
    const { contestId } = req.params;
    if (!isId(contestId)) return res.status(404).json({ status: 404, message: "Contest not found." });
    const contest = await Contest.findById(contestId);
    if (!contest) return res.status(404).json({ status: 404, message: "Contest not found." });

    const { winners = [], publish = false } = req.body || {};
    if (!Array.isArray(winners) || winners.length > 3) {
      return res.status(400).json({ status: 400, message: "Choose at most 3 winners." });
    }
    if (publish && winners.length === 0) {
      return res.status(400).json({ status: 400, message: "Pick at least one winner before publishing." });
    }

    const report = computeAdminReport(contest);
    const usedRanks = new Set();
    const usedUsers = new Set();
    const out = [];
    for (const w of winners) {
      const rank = Number(w.rank);
      const userId = String(w.userId || "");
      if (![1, 2, 3].includes(rank)) return res.status(400).json({ status: 400, message: "Rank must be 1, 2 or 3." });
      if (usedRanks.has(rank) || usedUsers.has(userId)) {
        return res.status(400).json({ status: 400, message: "Each rank and each participant can be used only once." });
      }
      const part = (contest.participants || []).find((p) => p.userId === userId);
      if (!part) return res.status(400).json({ status: 400, message: "A winner must be a participant of this contest." });
      usedRanks.add(rank);
      usedUsers.add(userId);
      const row = report.find((r) => r.userId === userId) || {};
      out.push({
        rank,
        userId,
        userName: part.userName || "Coder",
        avatar: part.avatar || "",
        score: row.score || 0,
        problemsSolved: row.solvedCount || 0,
        totalProblems: row.totalProblems || (contest.problems || []).length,
        timeMinutes: row.totalTimeMinutes || 0,
      });
    }
    out.sort((a, b) => a.rank - b.rank);

    contest.winners = out;
    contest.winnersPublished = !!publish && out.length > 0;
    await contest.save();
    return res.status(200).json({
      status: 200,
      message: contest.winnersPublished ? "Winners published on the home screen." : "Winners saved (not published).",
      data: { winners: out, winnersPublished: contest.winnersPublished },
    });
  } catch (err) {
    return res.status(500).json({ status: 500, message: err.message });
  }
};

/** Public: latest ended contests whose winners the admin has published. */
export const getPublishedWinners = async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 1, 1), 5);
    const list = await Contest.find({ winnersPublished: true, endTime: { $lte: new Date() } })
      .sort({ endTime: -1 })
      .limit(limit)
      .select("title endTime winners");
    // Use each winner's CURRENT profile photo (the one saved at publish time may be old/broken).
    const ids = [...new Set(list.flatMap((c) => (c.winners || []).map((w) => w.userId)).filter(isId))];
    const pics = {};
    if (ids.length) {
      const users = await User.find({ _id: { $in: ids } }).select("Picture");
      users.forEach((u) => (pics[String(u._id)] = u.Picture || ""));
    }
    return res.status(200).json({
      status: 200,
      data: list
        .filter((c) => (c.winners || []).length > 0)
        .map((c) => ({
          id: String(c._id),
          title: c.title,
          endTime: c.endTime,
          winners: [...c.winners]
            .sort((a, b) => a.rank - b.rank)
            .map((w) => {
              const o = w.toObject ? w.toObject() : { ...w };
              return { ...o, avatar: pics[o.userId] || o.avatar || "" };
            }),
        })),
    });
  } catch (err) {
    return res.status(500).json({ status: 500, data: [], message: err.message });
  }
};

/**
 * Participant: my own result for a finished contest (+ the published top 3).
 * Never exposes anyone else's score, time or code.
 */
export const getMyResult = async (req, res) => {
  try {
    const { contestId } = req.params;
    if (!isId(contestId)) return res.status(404).json({ status: 404, data: null, message: "Contest not found." });
    const contest = await Contest.findById(contestId);
    if (!contest) return res.status(404).json({ status: 404, data: null, message: "Contest not found." });

    const ended = Date.now() > new Date(contest.endTime).getTime();
    if (!ended) {
      return res.status(403).json({ status: 403, data: null, message: "Results are available after the contest ends.", endTime: contest.endTime });
    }

    const userId = String(req.user.Id);
    const report = computeAdminReport(contest);
    const me = report.find((r) => r.userId === userId);
    const published = !!contest.winnersPublished && (contest.winners || []).length > 0;

    const base = {
      contest: { id: String(contest._id), title: contest.title, endTime: contest.endTime, totalProblems: (contest.problems || []).length },
      participated: !!me,
      totalParticipants: report.length,
      winnersPublished: published,
      winners: published ? [...contest.winners].sort((a, b) => a.rank - b.rank) : [],
    };
    if (!me) return res.status(200).json({ status: 200, data: { ...base, me: null } });

    return res.status(200).json({
      status: 200,
      data: {
        ...base,
        me: {
          rank: me.rank,
          score: me.score,
          solvedCount: me.solvedCount,
          totalProblems: me.totalProblems,
          totalTimeMinutes: me.totalTimeMinutes,
          wrongSubmissions: me.wrongSubmissions,
          totalSubmissions: me.totalSubmissions,
          enteredAt: me.enteredAt,
          perProblem: me.perProblem.map((p) => ({
            problemId: p.problemId,
            title: p.title,
            points: p.points,
            solved: p.solved,
            minutes: p.minutes,
            wrongBeforeSolve: p.wrongBeforeSolve,
            penaltyMinutes: p.penaltyMinutes,
            attempts: p.attempts,
            lastVerdict: p.lastVerdict,
          })),
        },
      },
    });
  } catch (err) {
    return res.status(500).json({ status: 500, data: null, message: err.message });
  }
};

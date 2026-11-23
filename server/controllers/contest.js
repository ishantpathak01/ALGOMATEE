import Contest from "../models/Contest.js";
import User from "../models/user.js";
import { executeOne, outputsMatch } from "../utils/compiler/execute.js";

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

/** Never send other people's code or hidden expected outputs to the browser. */
const sanitize = (contestDoc) => {
  const c = contestDoc.toObject ? contestDoc.toObject() : { ...contestDoc };
  const nowMs = Date.now();
  c.status = nowMs < new Date(c.startTime).getTime() ? "upcoming" : nowMs > new Date(c.endTime).getTime() ? "completed" : "active";
  delete c.submissions;
  delete c.participants;
  c.problems = (c.problems || []).map((p) => ({
    ...p,
    testcases: (p.testcases || []).map((t) =>
      t.isHidden ? { ...t, output: "", explanation: "" } : t
    ),
  }));
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
    return res.status(200).json({ status: 200, data: sanitize(contest) });
  } catch (err) {
    return res.status(500).json({ status: 500, data: null, message: err.message });
  }
};

export const getAllContests = async (req, res) => {
  try {
    const contests = await Contest.find().sort({ createdAt: -1 });
    return res.status(200).json({ status: 200, data: contests.map(sanitize) });
  } catch (err) {
    return res.status(500).json({ status: 500, data: [], message: err.message });
  }
};

export const getContestById = async (req, res) => {
  try {
    if (!isId(req.params.id)) return res.status(404).json({ status: 404, data: null, message: "Contest not found." });
    const contest = await Contest.findById(req.params.id);
    if (!contest) return res.status(404).json({ status: 404, data: null, message: "Contest not found." });
    return res.status(200).json({ status: 200, data: sanitize(contest) });
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

    return res.status(201).json({ status: 201, message: "Contest created successfully!", data: sanitize(newContest) });
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
    for (const t of tests) {
      const { stdout, stderr } = await executeOne(language, code, String(t.input ?? ""));
      if (stderr) {
        verdict = /time limit/i.test(stderr) ? "Time Limit Exceeded" : "Runtime Error";
        errorText = errorText || stderr;
      } else if (outputsMatch(stdout, t.output)) {
        passed++;
      } else if (verdict === "Accepted") {
        verdict = "Wrong Answer";
      }
    }
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

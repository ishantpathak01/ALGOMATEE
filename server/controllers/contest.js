import Contest from "../models/Contest.js";
import User from "../models/user.js";
import { executeOne, outputsMatch } from "../utils/compiler/execute.js";

export const WRONG_PENALTY_MINUTES = 5;

const isId = (id) => /^[a-f0-9]{24}$/i.test(String(id || ""));

/** Never send other people's code or hidden expected outputs to the browser. */
const sanitize = (contestDoc) => {
  const c = contestDoc.toObject ? contestDoc.toObject() : { ...contestDoc };
  delete c.submissions;
  delete c.participants;
  c.problems = (c.problems || []).map((p) => ({
    ...p,
    testcases: (p.testcases || []).map((t) =>
      t.isHidden ? { ...t, output: "", explanation: "" } : t
    ),
  }));
  c.leaderboard = computeLeaderboard(contestDoc);
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
      row.finishTimeMinutes += (s.minutesFromEntry || 0) + wrong * WRONG_PENALTY_MINUTES;
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

    const newContest = await Contest.create({
      title,
      description: description || "",
      mentorName: mentorName || "AlgoMate Mentor",
      mentorBio: mentorBio || "",
      mentorAvatar: mentorAvatar || "",
      durationMinutes: durationMinutes || 90,
      rewardCoins: rewardCoins || 0,
      difficulty: difficulty || "Intermediate",
      problems: problems.map((p) => ({ ...p, source: "AlgoMate", externalUrl: "", points: Number(p.points) })),
      startTime: startTime || new Date(),
      endTime: endTime || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
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

    const minutesFromEntry = Math.max(0, Math.floor((now - new Date(part.enteredAt)) / 60000));
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

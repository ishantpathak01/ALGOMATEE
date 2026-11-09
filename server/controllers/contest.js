import Contest from "../models/Contest.js";
import CodingProblem from "../models/Problems/Coding.js";
import Mentor from "../models/mentor.js";
import User from "../models/user.js";
import mongoose from "mongoose";

export const createContest = async (req, res) => {
  try {
    const { title, description, type, startTime, endTime, problems, isPublic } =
      req.body;
    const mentorId = req.user?.Id || req.body.mentorId;

    if (!title || !startTime || !endTime) {
      return res.json({ status: 400, message: "Title, start and end time are required." });
    }
    if (new Date(endTime) <= new Date(startTime)) {
      return res.json({ status: 400, message: "End time must be after start time." });
    }
    if (!problems || !Array.isArray(problems) || problems.length === 0) {
      return res.json({ status: 400, message: "Add at least one problem." });
    }

    const mentor = await Mentor.findById(mentorId).select("Name");
    if (!mentor) {
      return res.json({ status: 404, message: "Mentor not found." });
    }

    const normalized = problems.map((p) => ({
      type: p.type || (p.link ? "external" : "custom"),
      problemId: p.problemId || undefined,
      title: p.title || "Untitled Problem",
      difficulty: p.difficulty || "Medium",
      points: Number(p.points) || 100,
      link: p.link || "",
      platform:
        p.platform ||
        (p.type === "leetcode"
          ? "Leetcode"
          : p.type === "gfg"
          ? "GeeksForGeeks"
          : "AlgoMate"),
    }));

    const contest = await Contest.create({
      title: title.trim(),
      description: description || "",
      type: type || "weekly",
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      problems: normalized,
      createdBy: mentorId,
      mentorName: mentor.Name,
      status: new Date(startTime) > new Date() ? "upcoming" : "live",
      isPublic: isPublic !== false,
    });

    return res.json({
      status: 200,
      message: "Contest created successfully.",
      data: contest,
    });
  } catch (error) {
    console.error("createContest:", error);
    return res.json({ status: 500, message: "Failed to create contest." });
  }
};

export const getMentorContests = async (req, res) => {
  try {
    const mentorId = req.user?.Id || req.query.mentorId;
    const contests = await Contest.find({ createdBy: mentorId })
      .sort({ startTime: -1 })
      .lean();

    const now = new Date();
    for (const c of contests) {
      if (c.status !== "cancelled" && c.status !== "draft") {
        if (now < new Date(c.startTime)) c.status = "upcoming";
        else if (now <= new Date(c.endTime)) c.status = "live";
        else c.status = "ended";
      }
    }

    return res.json({ status: 200, data: contests });
  } catch (error) {
    console.error(error);
    return res.json({ status: 500, message: "Could not fetch contests." });
  }
};

export const getPublicContests = async (req, res) => {
  try {
    const { type, limit = 20 } = req.query;
    const filter = { isPublic: true, status: { $ne: "cancelled" } };
    if (type) filter.type = type;

    let contests = await Contest.find(filter)
      .sort({ startTime: -1 })
      .limit(Number(limit))
      .select("-participants")
      .lean();

    const now = new Date();
    contests = contests.map((c) => {
      if (c.status !== "draft") {
        if (now < new Date(c.startTime)) c.status = "upcoming";
        else if (now <= new Date(c.endTime)) c.status = "live";
        else c.status = "ended";
      }
      return c;
    });

    contests.sort((a, b) => {
      const order = { live: 0, upcoming: 1, ended: 2, draft: 3 };
      return (order[a.status] ?? 4) - (order[b.status] ?? 4);
    });

    return res.json({ status: 200, data: contests });
  } catch (error) {
    console.error(error);
    return res.json({ status: 500, message: "Could not fetch contests." });
  }
};

export const getContestById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.json({ status: 400, message: "Invalid contest id." });
    }
    let contest = await Contest.findById(id)
      .populate("createdBy", "Name Picture")
      .lean();
    if (!contest) return res.json({ status: 404, message: "Contest not found." });

    const now = new Date();
    if (contest.status !== "cancelled" && contest.status !== "draft") {
      if (now < new Date(contest.startTime)) contest.status = "upcoming";
      else if (now <= new Date(contest.endTime)) contest.status = "live";
      else contest.status = "ended";
    }

    return res.json({ status: 200, data: contest });
  } catch (error) {
    console.error(error);
    return res.json({ status: 500, message: "Failed to load contest." });
  }
};

export const joinContest = async (req, res) => {
  try {
    const { contestId, userId } = req.body;
    if (!contestId || !userId) {
      return res.json({ status: 400, message: "contestId and userId required." });
    }

    const contest = await Contest.findById(contestId);
    if (!contest) return res.json({ status: 404, message: "Contest not found." });

    contest.refreshStatus();
    if (contest.status === "ended" || contest.status === "cancelled") {
      return res.json({ status: 400, message: "Contest is not open for joining." });
    }

    const already = contest.participants.some(
      (p) => p.userId.toString() === userId.toString()
    );
    if (already) {
      return res.json({ status: 200, message: "Already joined.", data: contest });
    }

    contest.participants.push({ userId, joinedAt: new Date(), score: 0 });
    await contest.save();

    return res.json({ status: 200, message: "Joined contest!", data: contest });
  } catch (error) {
    console.error(error);
    return res.json({ status: 500, message: "Could not join contest." });
  }
};

export const adminListContests = async (req, res) => {
  try {
    const contests = await Contest.find()
      .sort({ createdAt: -1 })
      .populate("createdBy", "Name Email")
      .lean();

    const now = new Date();
    contests.forEach((c) => {
      if (c.status !== "cancelled" && c.status !== "draft") {
        if (now < new Date(c.startTime)) c.status = "upcoming";
        else if (now <= new Date(c.endTime)) c.status = "live";
        else c.status = "ended";
      }
    });

    return res.json({ status: 200, data: contests });
  } catch (error) {
    console.error(error);
    return res.json({ status: 500, message: "Failed to list contests." });
  }
};

export const adminUpdateContestStatus = async (req, res) => {
  try {
    const { contestId, status } = req.body;
    if (!["cancelled", "upcoming", "live", "ended"].includes(status)) {
      return res.json({ status: 400, message: "Invalid status." });
    }
    const contest = await Contest.findByIdAndUpdate(
      contestId,
      { status },
      { new: true }
    );
    if (!contest) return res.json({ status: 404, message: "Contest not found." });
    return res.json({ status: 200, message: "Status updated.", data: contest });
  } catch (error) {
    console.error(error);
    return res.json({ status: 500, message: "Update failed." });
  }
};

export const adminStats = async (req, res) => {
  try {
    const [users, mentors, problems, contests, liveContests] = await Promise.all([
      User.countDocuments(),
      Mentor.countDocuments({ Verified: true }),
      CodingProblem.countDocuments(),
      Contest.countDocuments(),
      Contest.countDocuments({
        startTime: { $lte: new Date() },
        endTime: { $gte: new Date() },
        status: { $ne: "cancelled" },
      }),
    ]);

    const pendingMentors = await Mentor.countDocuments({
      Verified: false,
      VerificationStatus: { $ne: "rejected" },
    });

    return res.json({
      status: 200,
      data: {
        users,
        mentors,
        pendingMentors,
        problems,
        contests,
        liveContests,
      },
    });
  } catch (error) {
    console.error(error);
    return res.json({ status: 500, message: "Could not load stats." });
  }
};

export const adminListUsers = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const users = await User.find()
      .select("Name Email Picture createdAt")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    return res.json({ status: 200, data: users });
  } catch (error) {
    console.error(error);
    return res.json({ status: 500, message: "Could not list users." });
  }
};

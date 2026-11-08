import jwt from "jsonwebtoken";
import crypto from "crypto";
import mongoose from "mongoose";
import Mentor from "../models/mentor.js";
import { evaluateMentor } from "../utils/mentorCriteria.js";
import {
  sendMentorApproved,
  sendMentorRejected,
} from "../utils/mail/mentorStatus.js";

// Admin tokens use their own signing secret, so a user or mentor token can never pass as admin.
const adminSecret = () => `${process.env.SECRET_KEY}:admin`;

const digest = (value) =>
  crypto.createHash("sha256").update(String(value)).digest();
const safeEqual = (a, b) => crypto.timingSafeEqual(digest(a), digest(b));

// Block repeated wrong passwords: 5 failures per IP every 15 minutes.
const attempts = new Map();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILS = 5;
const isBlocked = (ip) => {
  const entry = attempts.get(ip);
  if (!entry) return false;
  if (Date.now() - entry.first > WINDOW_MS) {
    attempts.delete(ip);
    return false;
  }
  return entry.count >= MAX_FAILS;
};
const recordFail = (ip) => {
  const entry = attempts.get(ip);
  if (!entry || Date.now() - entry.first > WINDOW_MS) {
    attempts.set(ip, { count: 1, first: Date.now() });
  } else {
    entry.count += 1;
  }
};

export const login = (req, res) => {
  const { ADMIN_EMAIL, ADMIN_PASSWORD, SECRET_KEY } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 10 || !SECRET_KEY) {
    return res.json({
      status: 503,
      message: "Admin login is not set up on the server yet.",
    });
  }
  if (isBlocked(req.ip)) {
    return res.json({
      status: 429,
      message: "Too many failed attempts. Try again in 15 minutes.",
    });
  }
  const { Email, Password } = req.body || {};
  if (!Email || !Password) {
    return res.json({ status: 400, message: "Insufficient data" });
  }
  const emailOk = safeEqual(
    String(Email).trim().toLowerCase(),
    ADMIN_EMAIL.trim().toLowerCase()
  );
  const passwordOk = safeEqual(Password, ADMIN_PASSWORD);
  if (!(emailOk && passwordOk)) {
    recordFail(req.ip);
    return res.json({ status: 401, message: "Wrong email or password." });
  }
  attempts.delete(req.ip);
  const token = jwt.sign({ role: "admin" }, adminSecret(), { expiresIn: "8h" });
  return res.json({ status: 200, message: "Logged in.", token });
};

export const verifyAdmin = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return res.json({ status: 401, message: "Access denied." });
  try {
    const payload = jwt.verify(token, adminSecret());
    if (payload.role !== "admin") throw new Error("not admin");
    next();
  } catch (error) {
    return res.json({
      status: 401,
      message: "Session expired. Please log in again.",
    });
  }
};

const STATUS_QUERY = {
  pending: { Verified: false, VerificationStatus: { $ne: "rejected" } },
  approved: { Verified: true },
  rejected: { Verified: false, VerificationStatus: "rejected" },
};

export const listMentors = async (req, res) => {
  try {
    const status = STATUS_QUERY[req.query.status] ? req.query.status : "pending";
    const [mentors, pending, approved, rejected] = await Promise.all([
      Mentor.find(STATUS_QUERY[status])
        .select(
          "Name Email Picture Experience Languages Expertise MobileNumber Location About Verified VerificationStatus RejectionReason ReviewedAt"
        )
        .sort({ _id: -1 })
        .lean(),
      Mentor.countDocuments(STATUS_QUERY.pending),
      Mentor.countDocuments(STATUS_QUERY.approved),
      Mentor.countDocuments(STATUS_QUERY.rejected),
    ]);
    const data = mentors.map((m) => {
      const checks = evaluateMentor(m);
      return {
        ...m,
        AppliedAt: m._id.getTimestamp(),
        Checks: checks,
        ChecksPassed: checks.filter((c) => c.passed).length,
      };
    });
    return res.json({
      status: 200,
      data,
      counts: { pending, approved, rejected },
    });
  } catch (error) {
    console.error(error);
    return res.json({ status: 500, message: "Internal Server Error" });
  }
};

export const approveMentor = async (req, res) => {
  try {
    const { MentorId } = req.body || {};
    if (!mongoose.isValidObjectId(MentorId)) {
      return res.json({ status: 400, message: "Invalid mentor id." });
    }
    const mentor = await Mentor.findById(MentorId).select("Name Email");
    if (!mentor) return res.json({ status: 404, message: "Mentor not found." });

    await Mentor.updateOne(
      { _id: MentorId },
      {
        $set: {
          Verified: true,
          VerificationStatus: "approved",
          RejectionReason: "",
          ReviewedAt: new Date(),
        },
      }
    );
    const emailed = await sendMentorApproved({
      email: mentor.Email,
      name: mentor.Name,
    });
    return res.json({
      status: 200,
      message: emailed
        ? "Mentor approved and notified by email."
        : "Mentor approved. The email could not be sent.",
    });
  } catch (error) {
    console.error(error);
    return res.json({ status: 500, message: "Internal Server Error" });
  }
};

export const rejectMentor = async (req, res) => {
  try {
    const { MentorId } = req.body || {};
    const reason = String((req.body || {}).Reason || "").trim();
    if (!mongoose.isValidObjectId(MentorId)) {
      return res.json({ status: 400, message: "Invalid mentor id." });
    }
    if (reason.length < 5 || reason.length > 500) {
      return res.json({
        status: 400,
        message: "Please give a reason (5 to 500 characters).",
      });
    }
    const mentor = await Mentor.findById(MentorId).select("Name Email");
    if (!mentor) return res.json({ status: 404, message: "Mentor not found." });

    await Mentor.updateOne(
      { _id: MentorId },
      {
        $set: {
          Verified: false,
          VerificationStatus: "rejected",
          RejectionReason: reason,
          ReviewedAt: new Date(),
        },
      }
    );
    const emailed = await sendMentorRejected({
      email: mentor.Email,
      name: mentor.Name,
      reason,
    });
    return res.json({
      status: 200,
      message: emailed
        ? "Mentor rejected and notified by email."
        : "Mentor rejected. The email could not be sent.",
    });
  } catch (error) {
    console.error(error);
    return res.json({ status: 500, message: "Internal Server Error" });
  }
};

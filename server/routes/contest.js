import express from "express";
import jwt from "jsonwebtoken";
import {
  getWeeklyContest,
  getAllContests,
  getContestById,
  createContest,
  submitContestProblem,
  enterContest,
  getLeaderboard,
  requireAdmin,
  getAdminResults,
  getAdminSubmissionCode,
  deleteContest,
  setContestWinners,
  getPublishedWinners,
  getMyResult,
} from "../controllers/contest.js";

const router = express.Router();

// 1. Create the Authentication Middleware
const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  
  if (!token) {
    return res.json({ status: 401, message: "Access Denied. Please log in to access contests." });
  }
  
  try {
    const payload = jwt.verify(token, process.env.SECRET_KEY);
    req.user = payload;
    
    const requestId = req.method === "POST" || req.method === "PUT" ? req.body.Id : req.query.Id;
    if (requestId && req.user.Id !== requestId) {
      return res.json({
        status: 403,
        message: "Forbidden: You cannot access or modify data for another user.",
      });
    }
    
    next();
  } catch (err) {
    return res.json({ status: 403, message: "Invalid or expired token! Please login again." });
  }
};

// Admin-panel login issues its own Bearer token (signed with SECRET_KEY + ":admin").
// Accept that token OR a normal user session that is flagged as admin.
const adminAuth = (req, res, next) => {
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) {
    try {
      const payload = jwt.verify(header.slice(7), `${process.env.SECRET_KEY}:admin`);
      if (payload.role === "admin") {
        req.isPanelAdmin = true;
        return next();
      }
    } catch (e) {
      /* fall through to the cookie-based check */
    }
  }
  return verifyToken(req, res, (err) => (err ? next(err) : requireAdmin(req, res, next)));
};

// 2. Apply the middleware to your routes
// We leave "/all" unprotected so guests can see that contests exist, 
// but we protect the actual contest data and submissions.

router.get("/all", getAllContests);
router.get("/winners", getPublishedWinners); // public: published winners for the home screen
router.get("/weekly", verifyToken, getWeeklyContest);
router.get("/:contestId/leaderboard", adminAuth, getLeaderboard);
router.get("/:contestId/admin/results", adminAuth, getAdminResults);
router.get("/:contestId/admin/submission/:subId", adminAuth, getAdminSubmissionCode);
router.post("/:contestId/enter", verifyToken, enterContest);
router.get("/:contestId/my-result", verifyToken, getMyResult);
router.get("/:id", verifyToken, getContestById);
router.delete("/:contestId", adminAuth, deleteContest);
router.post("/:contestId/winners", adminAuth, setContestWinners);
router.post("/create", verifyToken, createContest);
router.post("/:contestId/submit", verifyToken, submitContestProblem);

export default router;

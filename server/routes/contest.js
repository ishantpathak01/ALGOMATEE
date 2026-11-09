import express from "express";
import jwt from "jsonwebtoken";
import {
  getWeeklyContest,
  getAllContests,
  getContestById,
  createContest,
  submitContestProblem,
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

// 2. Apply the middleware to your routes
// We leave "/all" unprotected so guests can see that contests exist, 
// but we protect the actual contest data and submissions.

router.get("/all", getAllContests);
router.get("/weekly", verifyToken, getWeeklyContest);
router.get("/:id", verifyToken, getContestById);
router.post("/create", verifyToken, createContest);
router.post("/:contestId/submit", verifyToken, submitContestProblem);

export default router;

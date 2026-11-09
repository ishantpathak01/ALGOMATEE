import express from "express";
import jwt from "jsonwebtoken";
import {
  createContest,
  getMentorContests,
  getPublicContests,
  getContestById,
  joinContest,
  adminListContests,
  adminUpdateContestStatus,
  adminStats,
  adminListUsers,
} from "../controllers/contest.js";
import { verifyAdmin } from "../controllers/admin.js";

const route = express.Router();

const verifyToken = (req, res, next) => {
  const token =
    req.cookies?.token ||
    (req.headers.authorization || "").replace("Bearer ", "");
  if (!token) return res.json({ status: 401, message: "Access Denied." });
  try {
    req.user = jwt.verify(token, process.env.SECRET_KEY);
    next();
  } catch (e) {
    return res.json({ status: 401, message: "Session expired." });
  }
};

// Public
route.get("/public", getPublicContests);
route.get("/:id", getContestById);

// Authenticated
route.post("/join", verifyToken, joinContest);
route.post("/create", verifyToken, createContest);
route.get("/mentor/list", verifyToken, getMentorContests);

// Admin
route.get("/admin/stats", verifyAdmin, adminStats);
route.get("/admin/list", verifyAdmin, adminListContests);
route.post("/admin/status", verifyAdmin, adminUpdateContestStatus);
route.get("/admin/users", verifyAdmin, adminListUsers);

export default route;

import express from "express";
import {
  getWeeklyContest,
  getAllContests,
  getContestById,
  createContest,
  submitContestProblem,
} from "../controllers/contest.js";

const router = express.Router();

router.get("/weekly", getWeeklyContest);
router.get("/all", getAllContests);
router.get("/:id", getContestById);
router.post("/create", createContest);
router.post("/:contestId/submit", submitContestProblem);

export default router;

import express from "express";
import {
  login,
  verifyAdmin,
  listMentors,
  approveMentor,
  rejectMentor,
  getPlatformStats,
  getAdminQuestions,
  deleteAdminQuestion,
  getAdminUsers,
} from "../controllers/admin.js";

const route = express.Router();

route.post("/login", login);
route.get("/mentors", verifyAdmin, listMentors);
route.post("/mentors/approve", verifyAdmin, approveMentor);
route.post("/mentors/reject", verifyAdmin, rejectMentor);
route.get("/stats", verifyAdmin, getPlatformStats);
route.get("/questions", verifyAdmin, getAdminQuestions);
route.delete("/questions/:id", verifyAdmin, deleteAdminQuestion);
route.get("/users", verifyAdmin, getAdminUsers);

export default route;

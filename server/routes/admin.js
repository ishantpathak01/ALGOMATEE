import express from "express";
import {
  login,
  verifyAdmin,
  listMentors,
  approveMentor,
  rejectMentor,
} from "../controllers/admin.js";

const route = express.Router();

route.post("/login", login);
route.get("/mentors", verifyAdmin, listMentors);
route.post("/mentors/approve", verifyAdmin, approveMentor);
route.post("/mentors/reject", verifyAdmin, rejectMentor);

export default route;

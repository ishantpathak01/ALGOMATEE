import express from "express";
import {
  getAssignmentScore,
  getNotesCalendar,
  updateCalanderNote,
} from "../controllers/classroom.js";
import {
  createSection,
  getMySections,
  addStudent,
  saveNotes,
  getNotes,
  getAssignments,
  deleteAssignment,
  updateAssignment,
  addAssignment,
  addNotesInCalendar,
} from "../controllers/classroom.js";

import Mentor from "./../models/mentor.js";

import jwt from "jsonwebtoken";

const route = express.Router();

const verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) return res.json({ status: 401, message: "Access Denied." });
  try {
    const Id =
      req.method === "POST" || req.method === "PUT"
        ? req.body.Id
        : req.query.Id;
    req.user = jwt.verify(token, process.env.SECRET_KEY);

    if (req.user.Id !== Id) {
      return res.json({
        status: 403,
        message: "Forbidden: You cannot access or modify this data.",
      });
    }
    next();
  } catch (err) {
    res.json({ status: 403, message: "Invalid Token! Please login again." });
  }
};

const mentorFound = async (req, res, next) => {
  try {
    const Id = req.method === "POST" ? req.body.Id : req.query.Id;
    const mentor = await Mentor.findById(Id);
    if (!mentor) {
      return res.json({
        status: 404,
        message: "Mentor with this email does not exist",
      });
    }
    next();
  } catch (err) {
    res.json({ status: 403, message: "Some error occured." });
  }
};

const mentorVerified = async (req, res, next) => {
  try {
    const Id = req.method === "POST" ? req.body.Id : req.query.Id;
    const mentor = await Mentor.findById(Id);
    if (!mentor.Verified) {
      return res.json({
        status: 404,
        message: "Your request is still pending approval from the manager.",
      });
    }
    next();
  } catch (err) {
    res.json({ status: 403, message: "Some error occured." });
  }
};

route.post(
  "/createSection",
  verifyToken,
  mentorFound,
  mentorVerified,
  createSection
);
route.get(
  "/getMySections",
  verifyToken,
  mentorFound,
  mentorVerified,
  getMySections
);

route.post("/addStudent", verifyToken, mentorFound, mentorVerified, addStudent);

route.post("/saveNotes", verifyToken, mentorFound, mentorVerified, saveNotes);

route.post("/getNotes", getNotes);
route.get("/getAssignments", getAssignments);
route.post("/addAssignment", verifyToken, addAssignment);
route.delete("/deleteAssignment", verifyToken, deleteAssignment);
route.put("/updateAssignment", verifyToken, updateAssignment);
route.get(
  "/getAssignmentScore",
  verifyToken,
  mentorFound,
  mentorVerified,
  getAssignmentScore
);
route.get("/getNotesCalendar", verifyToken, getNotesCalendar);
route.post(
  "/addNotesInCalendar",
  verifyToken,
  mentorFound,
  mentorVerified,
  addNotesInCalendar
);
route.post(
  "/updateCalanderNote",
  verifyToken,
  mentorFound,
  mentorVerified,
  updateCalanderNote
);

export default route;

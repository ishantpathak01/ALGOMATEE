import express from "express";

import {
  addCodingProblem,
  getCodingSheet,
  getCodingProblem,
  deleteCodingProblem,
  addChoiceBasedProblem,
  getChoiceBasedSheet,
  getChoiceBasedProblem,
  deleteChoiceBasedProblem,
  submitCodingCode,
  runCodingCode,
  generateCodingAssessment,
  generateChoiceBasedAssessment,
  getSolvedCodingQuestionsList,
  generateDevelopmentAssessment,
  checkMCQScore,
  assignmentScore,
  getSuggestions,
  addDevQuestion,
  getDevSheet,
  deleteDevProblem,
  getDevProblem,
  submitDevCode,
} from "../controllers/assessment.js";

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

route.post("/addCodingProblem", verifyToken, addCodingProblem);
route.delete("/deleteCodingProblem", verifyToken, deleteCodingProblem);
route.get("/getCodingSheet", getCodingSheet);
route.get("/getCodingProblem", getCodingProblem);
route.post("/getChoiceBasedProblem", getChoiceBasedProblem);
route.post("/addChoiceBasedProblem", verifyToken, addChoiceBasedProblem);
route.delete(
  "/deleteChoiceBasedProblem",
  verifyToken,
  deleteChoiceBasedProblem
);
route.post("/getChoiceBasedSheet", getChoiceBasedSheet);
route.post("/generateCodingAssessment", generateCodingAssessment);
route.post("/generateChoiceBasedAssessment", generateChoiceBasedAssessment);
route.post("/generateDevelopmentAssessment", generateDevelopmentAssessment);
route.get("/getSolvedCodingQuestionsList", getSolvedCodingQuestionsList);
route.post("/coding/submitCode", submitCodingCode);
route.post("/coding/runCode", runCodingCode);
route.post("/checkMCQScore", checkMCQScore);
route.get("/assignmentScore", verifyToken, assignmentScore);
route.get("/getSuggestions", getSuggestions);
route.post("/addDevQuestion", verifyToken, addDevQuestion);
route.get("/getDevSheet", getDevSheet);
route.delete("/deleteDevProblem", verifyToken, deleteDevProblem);
route.get("/getDevProblem", getDevProblem);
route.post("/development/submitCode", submitDevCode);

export default route;

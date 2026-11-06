import express from "express";
import {
  login as mentorLogin,
  signup as mentorSignup,
  resetPassword as resetPasswordMentor,
  myJobs,
  postJob,
  deleteJob,
  createCourse,
  updateMentorProfile,
  postArticle,
  deleteArticle,
  getArticle,
  articleUpdate,
  updateSlots,
  approveMentor,
  approveArticle,
  getUnverifiedArticle,
  acceptDoubtRequest,
  rejectDoubtRequest,
  getUnverifiedMentors,
  getUnverifiedArticles,
  verificationCode,
  refreshRequest,
  getChat,
  logout,
} from "../controllers/mentor.js";

import jwt from "jsonwebtoken";

import Mentor from "../models/mentor.js";

import dotenv from "dotenv";
dotenv.config();

import multer from "multer";
const storage = multer.memoryStorage();
const upload = multer({ storage });

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

route.post("/myJobs", verifyToken, mentorFound, mentorVerified, myJobs);
route.post("/postJob", verifyToken, mentorFound, mentorVerified, postJob);
route.delete("/deleteJob", verifyToken, mentorFound, mentorVerified, deleteJob);
route.post(
  "/updateMentorProfile",
  upload.single("Picture"),
  verifyToken,
  mentorFound,
  updateMentorProfile
);
route.post(
  "/createCourse",
  verifyToken,
  mentorFound,
  mentorVerified,
  createCourse
);
route.post(
  "/postArticle",
  verifyToken,
  mentorFound,
  mentorVerified,
  postArticle
);
route.post(
  "/deleteArticle",
  verifyToken,
  mentorFound,
  mentorVerified,
  deleteArticle
);
route.post(
  "/articleUpdate",
  verifyToken,
  mentorFound,
  mentorVerified,
  articleUpdate
);
route.post(
  "/updateSlots",
  verifyToken,
  mentorFound,
  mentorVerified,
  updateSlots
);
route.post(
  "/rejectDoubtRequest",
  verifyToken,
  mentorFound,
  mentorVerified,
  rejectDoubtRequest
);
route.post(
  "/acceptDoubtRequest",
  verifyToken,
  mentorFound,
  mentorVerified,
  acceptDoubtRequest
);

route.post(
  "/approveMentor",
  verifyToken,
  mentorFound,
  mentorVerified,
  approveMentor
);

route.post(
  "/approveArticle",
  verifyToken,
  mentorFound,
  mentorVerified,
  approveArticle
);

route.get("/refreshRequest", verifyToken, mentorFound, refreshRequest);
route.get("/getChat", verifyToken, getChat);
route.post("/login", mentorLogin);

route.post("/signup", mentorSignup);
route.post("/logout", logout);
route.get("/getArticle", getArticle);
route.post("/verificationCode", verificationCode);
route.post("/resetPassword", resetPasswordMentor);
route.get(
  "/getUnverifiedMentors",
  mentorFound,
  mentorVerified,
  getUnverifiedMentors
);

route.get(
  "/getUnverifiedArticles",
  mentorFound,
  mentorVerified,
  getUnverifiedArticles
);

route.get(
  "/getUnverifiedArticle",
  mentorFound,
  mentorVerified,
  getUnverifiedArticle
);

export default route;

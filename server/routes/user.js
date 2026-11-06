import express from "express";
import {
  login as userLogin,
  signup as userSignup,
  resetPassword as resetPasswordUser,
  getAllJobs,
  getAllMentors,
  getMentorData,
  getAllCourses,
  requestDoubt,
  updateUserProfile,
  verificationCode,
  getChat,
  refreshRequest,
  logout,
  submitDoubtRating,
  getRewardTransections
} from "../controllers/user.js";

import jwt from "jsonwebtoken";

import User from "../models/user.js";

import dotenv from "dotenv";
dotenv.config();

import multer from "multer";
import { getSubmissions } from "../controllers/assessment.js";
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

const userFound = (req, res, next) => {
  try {
    const Id = req.method === "POST" ? req.body.Id : req.query.Id;
    const user = User.findById(Id);
    if (!user) {
      return res.json({
        status: 404,
        message: "User with this email does not exist",
      });
    }
    next();
  } catch (err) {
    res.json({ status: 403, message: "Some error occured." });
  }
};

route.post("/requestDoubt", verifyToken, userFound, requestDoubt);
route.get("/getChat", verifyToken, getChat);
route.get("/refreshRequest", verifyToken, userFound, refreshRequest);
route.post("/login", userLogin);
route.post("/signup", userSignup);
route.post("/logout", logout);
route.get("/getAllJobs", getAllJobs);
route.get("/getAllMentors", getAllMentors);
route.get("/getAllCourses", getAllCourses);
route.get("/getMentorData", getMentorData);
route.post("/verificationCode", verificationCode);
route.post("/resetPassword", resetPasswordUser);
route.post(
  "/updateUserProfile",
  upload.single("Picture"),
  verifyToken,
  userFound,
  updateUserProfile
);
route.get("/getSubmissions", verifyToken, getSubmissions);
route.post("/submitDoubtRating", verifyToken, submitDoubtRating);
route.get("/getRewardTransections", verifyToken, getRewardTransections);

export default route;

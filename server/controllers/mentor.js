import Mentor from "./../models/mentor.js";
import Job from "./../models/job.js";
import Course from "./../models/course.js";
import VerifiedArticle from "./../models/articles/verifiedArticles.js";
import UnverifiedArticle from "./../models/articles/unverifiedArticles.js";
import User from "./../models/user.js";
import Unverified from "./../models/unverified.js";
import Chat from "./../models/chat.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import sendVerificationOTP from "./../utils/mail/verification.js";
import sendRegistered from "./../utils/mail/registered.js";
import sendResetOTP from "./../utils/mail/resetPassword.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import agoraToken from "./../utils/agora/videoCall.js";
// import redis from "redis";
import cloudinary from "../utils/cloudinary/cloudinary.js";
import RewardModel from "../models/coinReward.js";
import crypto from "crypto";

const generateOtp = () => crypto.randomInt(1000, 10000);
dotenv.config();

// const redisClient = redis.createClient();
// redisClient.connect();

export const signup = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { Email, Password, Name, Type, Otp } = req.body;

    if (!Email || !Password || !Name || !Type || !Otp) {
      return res.json({ status: 400, message: "Insufficient data" });
    }

    const existingMentor = await Mentor.findOne({ Email }).session(session);
    if (existingMentor) {
      await session.abortTransaction();
      return res.json({
        status: 409,
        message: "Mentor with this email already exists",
      });
    }

    const unverified = await Unverified.findOneAndDelete({
      Email,
      Type: "Mentor",
    }).session(session);
    if (!unverified) {
      await session.abortTransaction();
      return res.json({ status: 400, message: "OTP expired." });
    }
    
    if (unverified.Otp !== Otp) {
      await session.abortTransaction();
      return res.json({ status: 400, message: "OTP didn't match." });
    }

    const hashedPassword = bcrypt.hashSync(Password, 8);
    const newMentor = new Mentor({
      Email,
      Name,
      Type,
      Password: hashedPassword,
      Verified: false,
    });

    await newMentor.save({ session });

    await sendRegistered({ email: Email });

    await session.commitTransaction();
    session.endSession();

    return res.json({
      status: 201,
      message: "Your account has been created successfully.",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    return res.json({ status: 500, message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  try {
    const { Email, Password } = req.body;

    if (!Password || !Email) {
      return res.json({ status: 400, message: "Insufficient data" });
    }
    const mentor = await Mentor.findOne({ Email });

    if (!mentor) {
      return res.json({
        status: 404,
        message: "Mentor with this email-Id not found",
      });
    }
    
    if (bcrypt.compareSync(Password, mentor?.Password)) {
      const token = jwt.sign({ Id: mentor._id }, process.env.SECRET_KEY, {
        expiresIn: "7d",
      });
      
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      return res.json({
        status: 200,
        message: "Logged in successfully",
        mentor: mentor,
      });
    } else {
      return res.json({ status: 401, message: "Wrong password" });
    }
  } catch (error) {
    return res.json({ status: 500, message: "Internal Server Error" });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict",
    });
    res.json({ status: 200, message: "Logged out successfully" });
  } catch (error) {
    return res.json({ status: 500, message: "Internal Server Error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { Email, Password, Otp, Type } = req.body;

    if (!Password || !Email || !Otp || !Type) {
      return res.json({ status: 400, message: "Insufficient data" });
    }

    const user = await Mentor.findOne({ Email: Email });
    const unverified = await Unverified.findOne({
      Email: Email,
      Type: "Mentor",
    });

    if (!unverified) {
      return res.json({
        status: 400,
        message: "OTP expired.",
      });
    }

    if (unverified.Otp != Otp) {
      return res.json({
        status: 400,
        message: "OTP didn't match.",
      });
    }

    const hashedPassword = bcrypt.hashSync(Password, 8);
    user.Password = hashedPassword;
    await Unverified.deleteOne({ _id: unverified._id });
    await user.save();
    return res.json({
      status: 200,
      message: "Password has been reset successfully.",
    });
  } catch (error) {
    return res.json({ status: 500, message: "Internal Server Error" });
  }
};

export const verificationCode = async (req, res) => {
  try {
    const { Email, Type } = req.body;
    if (Type == "Reset") {
      const user = await Mentor.findOne({ Email: Email });
      if (!user) {
        return res.json({
          status: 409,
          message: "Mentor with this email doesn't exists",
        });
      }
      const found = await Unverified.findOne({ Email: Email, Type: "Mentor" });
      const otp = generateOtp();
      let send = await sendResetOTP({ email: Email, OTP: otp });
      if (send.status != 1)
        return res.json({ status: 500, message: "Internal Server Error" });
      if (!found) {
        const newUser = new Unverified({
          Email: Email,
          Type: "Mentor",
          Otp: otp,
          Date: Date.now(),
        });
        await newUser.save();
      } else {
        found.Otp = otp;
        found.Time = Date.now();
        found.Date = Date.now();

        await found.save();
      }
      return res.json({
        status: 200,
        message: "OTP sent successfully.",
      });
    } else {
      const user = await Mentor.findOne({ Email: Email });
      if (user) {
        return res.json({
          status: 409,
          message: "Mentor with this email already exists",
        });
      }
      const found = await Unverified.findOne({ Email: Email, Type: "Mentor" });
      const otp = generateOtp();
      let send = await sendVerificationOTP({ email: Email, OTP: otp });
      if (send.status != 1)
        return res.json({ status: 500, message: "Internal Server Error" });
      if (!found) {
        const newUser = new Unverified({
          Email: Email,
          Type: "Mentor",
          Otp: otp,
        });
        await newUser.save();
      } else {
        found.Otp = otp;
        found.Time = Date.now();
        await found.save();
      }
      return res.json({
        status: 200,
        message: "OTP sent successfully.",
      });
    }
  } catch (error) {
    return res.json({ status: 500, message: "Internal Server Error" });
  }
};

export const postJob = async (req, res) => {
  try {
    const { Id, JobData } = req.body;
    if (!Id || !JobData) {
      return res.json({ status: 400, message: "Insufficient data" });
    }
    const exist = await Job.findOne({ ApplyLink: JobData.ApplyLink });
    if (exist) {
      return res.json({ status: 400, message: "This job is already posted." });
    }
    const newJob = new Job(JobData);
    let result = await newJob.save();
    // const keys = await redisClient.keys("jobs:*");
    // if (keys.length > 0) {
    //   await redisClient.del(keys);
    // }
    return res.json({
      status: 200,
      message: "Job posted successfully.",
      data: result,
    });
  } catch (error) {
    return res.json({ status: 500, message: "Internal Server Error" });
  }
};

export const myJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ Author: req.body.Id });
    return res.json({ status: 200, jobs: jobs });
  } catch (error) {
    return res.json({ status: 500, message: "Internal Server Error" });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const { JobId, Id } = req.query;

    if (!JobId || !Id) {
      return res.json({ status: 400, message: "Insufficient data" });
    }
    const job = await Job.findById(JobId);
    if (!job) {
      return res.json({
        status: 404,
        message: "This job doesn't exist",
      });
    }

    if (job.Author !== Id) {
      return res.json({
        status: 404,
        message: "You can not delete this job. (not authorized)",
      });
    }

    await Job.deleteOne({ _id: JobId });
    // const keys = await redisClient.keys("jobs:*");
    // if (keys.length > 0) {
    //   await redisClient.del(keys);
    // }
    return res.json({ status: 200, message: "Job deleted successfully." });
  } catch (error) {
    return res.json({ status: 500, message: "Internal Server Error" });
  }
};

export const updateMentorProfile = async (req, res) => {
  try {
    const userData = JSON.parse(req.body.Data);
    const profile = req.file;
    if (!userData) {
      return res.json({ status: 400, message: "Insufficient data" });
    }
    const user = await Mentor.findById(userData._id);
    if (!user) {
      return res.json({ status: 404, message: "User not found" });
    }

    for (const key in userData) {
      if (
        userData[key] !== undefined &&
        userData[key] !== null &&
        key !== "Password" &&
        key !== "Email" &&
        key !== "Verified" &&
        key != "_id"
      ) {
        user[key] = userData[key];
      }
    }

    if (profile != undefined) {
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "Profile_Picture", resource_type: "auto" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
      user.Picture = uploadResult.secure_url;
    }

    await user.save();
    // await redisClient.del("mentors:firstPage");
    return res.json({
      status: 200,
      message: "Data updated successfully.",
    });
  } catch (error) {
    return res.json({ status: 500, message: "Internal Server Error", error });
  }
};

export const createCourse = async (req, res) => {
  try {
    const { Id, CourseData } = req.body;
    if (!Id || !CourseData || !CourseData.newCourse) {
      return res.json({ status: 400, message: "Insufficient data" });
    }
    let course = await Course.findOne({ Name: CourseData.CourseType });
    if (course) {
      if (course.Author != Id) {
        return res.json({ status: 401, message: "You are not authorized" });
      }
      course.Courses.push(CourseData.newCourse);
    } else {
      course = new Course();
      course.Name = CourseData.TypeName;
      course.Description = CourseData.TypeDescription;
      course.Icon = CourseData.TypeIcon;
      course.Image = CourseData.TypeImage;
      course.Author = Id;
      course.Courses.push(CourseData.newCourse);
    }
    await course.save();
    // const updatedCourses = await Course.find();
    // await redisClient.setEx(
    //   "all_courses",
    //   864000,
    //   JSON.stringify(updatedCourses)
    // );
    return res.json({ status: 200, message: "Course added successfully." });
  } catch (error) {
    console.log(error);
    return res.json({ status: 500, message: "Internal Server Error" });
  }
};

const postVerifiedArticle = async (Id, session) => {
  try {
    const new_article = await UnverifiedArticle.findById(Id).session(session);
    if (!new_article) return false;
    const { CourseType, CourseName, Name, Description, ExistingId, Author } =
      new_article;
    const articleData = new_article.toObject();
    delete articleData._id;
    delete articleData.ExistingId;
    delete articleData.Name;
    delete articleData.Description;
    delete articleData.Author;
    let article;
    if (ExistingId) {
      article = await VerifiedArticle.findById(ExistingId).session(session);

      if (!article) return false;
      Object.keys(articleData).forEach((key) => {
        article[key] = articleData[key];
      });
      await article.save({ session });
      return true;
    }
    const course = await Course.findOne({ Name: CourseType }).session(session);
    if (!course) return false;
    article = new VerifiedArticle({
      ...articleData,
      Name,
      Description,
      Author,
    });
    await article.save({ session });
    const courseUpdated = course.Courses.find((c) => c.name === CourseName);
    const user = await Mentor.findById(Author);

    if (courseUpdated) {
      courseUpdated.topics.push({
        id: article._id,
        name: Name,
        description: Description,
        authorName: user?.Name,
        words: article?.Content?.length,
      });
      await course.save({ session });
      // await redisClient.del("all_courses");
    }

    return true;
  } catch (error) {
    return false;
  }
};

export const postArticle = async (req, res) => {
  try {
    const newArticle = new UnverifiedArticle(req.body);
    const requiredFields = [
      "Author",
      "CourseType",
      "CourseName",
      "Name",
      "Description",
      "Content",
      "Problems",
      "ChoiceBasedPool",
      "CodingPool",
    ];
    const missingFields = requiredFields.filter((field) => !req.body[field]);
    if (missingFields.length > 0) {
      return res.json({
        status: 400,
        message: `Insufficient data. Missing fields: ${missingFields.join(
          ", "
        )}`,
      });
    }
    await newArticle.save();
    return res.json({
      status: 201,
      message: "Article posted. Waiting for approval.",
    });
  } catch (error) {
    return res.json({ status: 500, message: "Internal Server Error" });
  }
};

export const deleteArticle = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { articleId, Id } = req.body;
    if (!articleId || !Id) {
      return res.json({ status: 400, message: "Insufficient data" });
    }

    const article = await VerifiedArticle.findById(articleId).session(session);
    if (!article) {
      await session.abortTransaction();
      return res.json({ status: 404, message: "Article not found." });
    }

    if (article.Author != Id) {
      await session.abortTransaction();
      return res.json({ status: 401, message: "You are not authorized." });
    }

    await VerifiedArticle.deleteOne({ _id: articleId }).session(session);

    const course = await Course.findOneAndUpdate(
      { Name: article.CourseType },
      { $pull: { "Courses.$[elem].topics": { id: article._id } } },
      {
        arrayFilters: [{ "elem.name": article.CourseName }],
        new: true,
        session,
      }
    );

    if (!course) {
      await session.abortTransaction();
      return res.json({ status: 404, message: "Course not found." });
    }
    // await redisClient.del("all_courses");
    await session.commitTransaction();
    session.endSession();

    return res.json({ status: 200, message: "Article deleted successfully." });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.json({ status: 500, message: "Internal Server Error" });
  }
};

export const getArticle = async (req, res) => {
  try {
    const { Id } = req.query;
    if (!Id) {
      return res.json({ status: 400, message: "Insufficient data" });
    }
    let article = await VerifiedArticle.findById(Id);
    if (article) {
      return res.json({
        status: 200,
        message: "Article found.",
        data: article,
      });
    } else {
      return res.json({ status: 401, message: "Incorrect Id" });
    }
  } catch (error) {
    return res.json({ status: 500, message: "Internal Server Error" });
  }
};

export const articleUpdate = async (req, res) => {
  try {
    const { ExistingId, Author, Id, ...updateData } = req.body;

    if (!ExistingId || !Id) {
      return res.json({ status: 400, message: "Insufficient data." });
    }

    const article = await VerifiedArticle.findById(ExistingId);
    if (!article) {
      return res.json({ status: 404, message: "Article not found." });
    }

    if (Id !== article.Author.toString()) {
      return res.json({ status: 403, message: "Not authorized." });
    }

    let unverifiedArticle = await UnverifiedArticle.findById(ExistingId);

    if (unverifiedArticle) {
      Object.keys(updateData).forEach((key) => {
        if (!["Name", "Description", "ExistingId", "_id"].includes(key)) {
          unverifiedArticle[key] = updateData[key];
        }
      });
      unverifiedArticle.Moderators = [];
      await unverifiedArticle.save();
    } else {
      const newArticleData = {
        ...article.toObject(),
        ...updateData,
        ExistingId,
        Moderators: [],
      };
      delete newArticleData._id;

      const new_article = new UnverifiedArticle(newArticleData);
      await new_article.save();
    }

    return res.json({
      status: 200,
      message: "Article posted successfully. Waiting for approval.",
    });
  } catch (error) {
    return res.json({ status: 500, message: "Internal Server Error" });
  }
};

export const updateSlots = async (req, res) => {
  try {
    const { Id, Slots } = req.body;
    if (!Id || !Slots) {
      return res.json({ status: 400, message: "Insufficient data" });
    }

    const user = await Mentor.findById(Id);
    user.Availability = Slots;
    await user.save();
    return res.json({ status: 200, message: "Slots updated." });
  } catch (error) {
    return res.json({ status: 500, message: "Internal Server Error" });
  }
};

export const acceptDoubtRequest = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { Id, doubtId } = req.body;
    if (!Id || !doubtId) {
      return res.json({ status: 400, message: "Insufficient data" });
    }

    const mentor = await Mentor.findById(Id).session(session);
    const doubtIndexMentor = mentor.Doubts.findIndex((d) => d.Key === doubtId);
    if (doubtIndexMentor === -1) {
      await session.abortTransaction();
      session.endSession();
      return res.json({ status: 404, message: "Doubt not found" });
    }

    const acceptedDoubt = mentor.Doubts[doubtIndexMentor];

    const user = await User.findById(acceptedDoubt.UserId).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.json({ status: 404, message: "Invalid request" });
    }

    const userDoubt = user.Doubts.find((d) => d.Key === doubtId);
    if (!userDoubt) {
      await session.abortTransaction();
      session.endSession();
      return res.json({
        status: 404,
        message: "Doubt not found in user record",
      });
    }
    userDoubt.Status = "Accepted";
    mentor.AcceptedDoubts = mentor.AcceptedDoubts || [];
    mentor.AcceptedDoubts.push(acceptedDoubt);
    mentor.Doubts = mentor.Doubts.filter((d) => d.Key !== doubtId);
    let chat = await Chat.findOne({
      "members.id": { $all: [user._id, mentor._id] },
    });

    if (!chat) {
      chat = new Chat({
        members: [
          {
            name: mentor.Name,
            id: mentor._id,
            profilePicture: mentor.Picture,
          },
          { name: user.Name, id: user._id, profilePicture: user.Picture },
        ],
      });
      await chat.save({ session });
      if (!mentor.Users.includes(user._id)) mentor.Users.push(user._id);
      mentor.Chats.push({ id: chat._id, userId: user._id, name: user.Name });
    }
    let token = await agoraToken;
    chat.messages.push({
      senderId: mentor._id,
      content: token,
      doubt: acceptedDoubt,
      type: "meeting",
    });

    await chat.save({ session });
    user.Chats.push({ id: chat._id, mentorId: mentor._id, name: mentor.Name });

    await mentor.save({ session });
    await user.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.json({ status: 200, message: "Request accepted.", mentor });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.json({ status: 500, message: "Internal Server Error" });
  }
};

export const rejectDoubtRequest = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { Id, doubtId } = req.body;
    if (!Id || !doubtId) {
      await session.abortTransaction();
      session.endSession();
      return res.json({ status: 400, message: "Insufficient data" });
    }

    const mentor = await Mentor.findById(Id).session(session);
    if (!mentor) {
      await session.abortTransaction();
      session.endSession();
      return res.json({ status: 404, message: "Mentor not found" });
    }

    const doubtIndexMentor = mentor.Doubts.findIndex((d) => d.Key === doubtId);
    if (doubtIndexMentor === -1) {
      await session.abortTransaction();
      session.endSession();
      return res.json({
        status: 404,
        message: "Doubt not found in mentor's list",
      });
    }

    const user = await User.findById(
      mentor.Doubts[doubtIndexMentor].UserId
    ).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.json({ status: 404, message: "Invalid request" });
    }

    const doubtIndexUser = user.Doubts.findIndex((d) => d.Key === doubtId);
    if (doubtIndexUser !== -1) {
      user.Doubts[doubtIndexUser].Status = "Rejected";
    }

    mentor.Doubts = mentor.Doubts.filter((d) => d.Key !== doubtId);
    user.Coins = user.Coins + 25;
    const rewardHistory = await RewardModel.findOne({ Id: user._id });
    rewardHistory.history.push({
      category: "Credit",
      amount: 25,
      details: `Your doubt request was rejected by ${mentor.Name}`,
    });

    await rewardHistory.save({ session });
    await user.save({ session });
    await mentor.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.json({
      status: 200,
      message: "Doubt request rejected successfully.",
      mentor: mentor,
    });
  } catch (error) {
    console.log(error);
    await session.abortTransaction();
    session.endSession();
    return res.json({ status: 500, message: "Internal Server Error" });
  }
};

export const refreshRequest = async (req, res) => {
  try {
    const { Id } = req.query;
    const mentor = await Mentor.findById(Id);
    return res.json({
      status: 200,
      message: "Updated your data.",
      mentor: mentor,
    });
  } catch (error) {
    return res.json({ status: 500, message: "Internal Server Error" });
  }
};

export const getChat = async (req, res) => {
  try {
    const { Id, chatId } = req.query;
    if (!Id || !chatId) {
      return res.json({ status: 400, message: "Insufficient data" });
    }
    let chat = await Chat.findById(chatId);
    if (chat) {
      const isMember = chat.members.some((member) => member.id === Id);
      if (!isMember) {
        return res.json({
          status: 403,
          message: "Unauthorized: User not part of this chat.",
        });
      }
      return res.json({
        status: 200,
        message: "Fetched successfully",
        data: chat,
      });
    } else {
      return res.json({ status: 404, message: "Chat not found." });
    }
  } catch (error) {
    return res.json({ status: 500, message: "Internal Server Error" });
  }
};

export const getUnverifiedMentors = async (req, res) => {
  try {
    let mentors = await Mentor.find({ Verified: false });
    return res.json({
      status: 200,
      message: "Unverified mentors fetched successfully.",
      data: mentors,
    });
  } catch (error) {
    return res.json({ status: 500, message: "Internal Server Error" });
  }
};

export const getUnverifiedArticles = async (req, res) => {
  try {
    let articles = await UnverifiedArticle.find();
    return res.json({
      status: 200,
      message: "Unverified articles fetched successfully.",
      data: articles,
    });
  } catch (error) {
    return res.json({ status: 500, message: "Internal Server Error" });
  }
};

export const approveMentor = async (req, res) => {
  try {
    let mentor = await Mentor.findById(req.body.MentorId);
    mentor.Verified = true;
    await mentor.save();
    // await redisClient.del("mentors:firstPage");
    return res.json({
      status: 200,
      message: "Mentor verified ✅.",
    });
  } catch (error) {
    return res.json({ status: 500, message: "Internal Server Error" });
  }
};

export const approveArticle = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { ArticleId, Id } = req.body;

    const article = await UnverifiedArticle.findById(ArticleId).session(
      session
    );
    const mentor = await Mentor.findById(Id).session(session);

    if (!article) {
      await session.abortTransaction();
      session.endSession();
      return res.json({ status: 404, message: "Article not found." });
    }
    if (!mentor) {
      await session.abortTransaction();
      session.endSession();
      return res.json({ status: 403, message: "You are not authorized." });
    }
    if (String(article.Author) === Id) {
      await session.abortTransaction();
      session.endSession();
      return res.json({
        status: 403,
        deleted: false,
        message: "You cannot approve your own article.",
      });
    }
    if (article.Moderators.includes(Id)) {
      await session.abortTransaction();
      session.endSession();
      return res.json({
        status: 400,
        deleted: false,
        message: "You have already approved this article.",
      });
    }

    await UnverifiedArticle.updateOne(
      { _id: ArticleId },
      { $addToSet: { Moderators: Id } },
      { session }
    );

    if (article.Moderators.length === 0) {
      await session.commitTransaction();
      session.endSession();
      return res.json({
        status: 200,
        deleted: false,
        message: "Your approval recorded ✅.",
      });
    }
    const posted = await postVerifiedArticle(ArticleId, session);

    if (!posted) {
      await session.abortTransaction();
      session.endSession();
      return res.json({
        status: 500,
        deleted: false,
        message: "Failed to approve the article.",
      });
    }

    await UnverifiedArticle.findOneAndDelete({ _id: ArticleId }).session(
      session
    );

    await session.commitTransaction();
    session.endSession();

    return res.json({
      status: 200,
      deleted: true,
      message: "Article fully approved and published 🚀.",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.json({ status: 500, message: "Internal Server Error" });
  }
};

export const getUnverifiedArticle = async (req, res) => {
  try {
    const article = await UnverifiedArticle.findById(req.query.ArticleId);
    if (!article) {
      return res.json({
        status: 400,
        message: "Article not found",
      });
    }
    return res.json({
      status: 200,
      data: article,
    });
  } catch (error) {
    return res.json({ status: 500, message: "Internal Server Error" });
  }
};

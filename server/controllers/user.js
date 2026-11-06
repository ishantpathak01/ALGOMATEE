import Job from "./../models/job.js";
import User from "./../models/user.js";
import Mentor from "./../models/mentor.js";
import Course from "../models/course.js";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import Unverified from "./../models/unverified.js";
import Chat from "./../models/chat.js";
import sendVerificationOTP from "../utils/mail/verification.js";
import jwt from "jsonwebtoken";
import cloudinary from "../utils/cloudinary/cloudinary.js";
import sendResetOTP from "./../utils/mail/resetPassword.js";
// import redis from "redis";
import mongoose from "mongoose";
import RewardModel from "../models/coinReward.js";
import crypto from "crypto";

const generateOtp = () => crypto.randomInt(1000, 10000);

// const redisClient = redis.createClient();
// redisClient.connect();

export const signup = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { Email, Password, Name, Type, Otp } = req.body;

    if (!Password || !Email || !Name || !Type || !Otp) {
      await session.abortTransaction();
      session.endSession();
      return res.json({ status: 400, message: "Insufficient data" });
    }

    const user = await User.findOne({ Email }).session(session);
    if (user) {
      await session.abortTransaction();
      session.endSession();
      return res.json({
        status: 409,
        message: "User with this email already exists.",
      });
    }

    const unverified = await Unverified.findOne({
      Email,
      Type: "User",
    }).session(session);
    console.log()
    if (!unverified) {
      await session.abortTransaction();
      session.endSession();
      return res.json({ status: 400, message: "OTP expired." });
    }

    if (unverified.Otp != Otp) {
      await session.abortTransaction();
      session.endSession();
      return res.json({ status: 400, message: "OTP didn't match." });
    }

    const hashedPassword = bcrypt.hashSync(Password, 8);
    const newUser = new User({ ...req.body, Password: hashedPassword });

    const output = await newUser.save({ session });
    await Unverified.deleteOne({ _id: unverified._id }).session(session);

    const token = jwt.sign({ Id: output._id }, process.env.SECRET_KEY, {
      expiresIn: "2h",
    });

    await RewardModel.create({
      Id: output._id,
      submissionDates: [],
      history: [],
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    await session.commitTransaction();
    session.endSession();

    return res.json({
      status: 201,
      message: "Account created successfully.",
      user: output,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.json({ status: 500, message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  try {
    const { Email, Password } = req.body;
    const hashedPassword = bcrypt.hashSync(Password, 8);
    console.log(hashedPassword);
    if (!Password || !Email) {
      return res.json({ status: 400, message: "Insufficient data" });
    }
    const user = await User.findOne({ Email: Email });
    if (!user) {
      return res.json({
        status: 404,
        message: "User with this email-Id not found",
      });
    }
    if (bcrypt.compareSync(Password, user.Password)) {
      const token = jwt.sign({ Id: user._id }, process.env.SECRET_KEY, {
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
        message: "Logged in successflly",
        user: user,
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
    return res.json({ status: 200, message: "Logged out successfully" });
  } catch (error) {
    return res.json({ status: 500, message: "Internal Server Error" });
  }
};

export const resetPassword = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { Email, Password, Otp, Type } = req.body;

    if (!Password || !Email || !Otp || !Type) {
      await session.abortTransaction();
      session.endSession();
      return res.json({ status: 400, message: "Insufficient data" });
    }

    const user = await User.findOne({ Email }).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.json({
        status: 409,
        message: "User with this email doesn't exist.",
      });
    }

    const unverified = await Unverified.findOne({
      Email,
      Type: "User",
    }).session(session);

    if (!unverified) {
      await session.abortTransaction();
      session.endSession();
      return res.json({
        status: 400,
        message: "OTP expired.",
      });
    }

    if (unverified.Otp != Otp) {
      await session.abortTransaction();
      session.endSession();
      return res.json({
        status: 400,
        message: "OTP didn't match.",
      });
    }

    const hashedPassword = bcrypt.hashSync(Password, 8);
    user.Password = hashedPassword;

    await user.save({ session });
    await Unverified.deleteOne({ _id: unverified._id }).session(session);

    await session.commitTransaction();
    session.endSession();

    return res.json({
      status: 200,
      message: "Password has been reset successfully.",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.json({ status: 500, message: "Internal Server Error" });
  }
};

export const verificationCode = async (req, res) => {
  console.log("verification code called");
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { Email, Type } = req.body;
    if (Type == "Reset") {
      const user = await User.findOne({ Email }).session(session);
      if (!user) {
        await session.abortTransaction();
        session.endSession();
        return res.json({
          status: 409,
          message: "User with this email doesn't exist",
        });
      }

      const found = await Unverified.findOne({ Email, Type: "User" }).session(
        session
      );

      const otp = generateOtp();
      let send = await sendResetOTP({ email: Email, OTP: otp });
      if (send.status != 1) {
        await session.abortTransaction();
        session.endSession();
        return res.json({ status: 500, message: "Could not send OTP email." });
      }
      if (!found) {
        const newUser = new Unverified({
          Email,
          Type: "User",
          Otp: otp,
          Date: Date.now(),
        });
        await newUser.save({ session });
      } else {
        found.Otp = otp;
        found.Time = Date.now();
        found.Date = Date.now();
        await found.save({ session });
      }
      await session.commitTransaction();
      session.endSession();
      return res.json({ status: 200, message: "OTP sent successfully." });
    } else {
      const user = await User.findOne({ Email }).session(session);
      if (user) {
        await session.abortTransaction();
        session.endSession();
        return res.json({
          status: 409,
          message: "Mentor with this email already exists",
        });
      }

      const found = await Unverified.findOne({ Email, Type: "User" }).session(
        session
      );
      const otp = generateOtp();
      let send = await sendVerificationOTP({ email: Email, OTP: otp });
      if (send.status == -1) {
        await session.abortTransaction();
        session.endSession();
        return res.json({ status: 500, message: "Email Id is incorrect." });
      }

      if (!found) {
        const newUser = new Unverified({
          Email,
          Type: "User",
          Otp: otp,
        });
        await newUser.save({ session });
      } else {
        found.Otp = otp;
        found.Time = Date.now();
        await found.save({ session });
      }

      await session.commitTransaction();
      session.endSession();
      return res.json({ status: 200, message: "OTP sent successfully." });
    }
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.json({ status: 500, message: "Internal Server Error" });
  }
};

export const getAllJobs = async (req, res) => {
  try {
    let {
      Page = 1,
      Limit = 10,
      Location = ".*",
      Type = ".*",
      Experience = ".*",
    } = req.query;

    Page = parseInt(Page, 10);
    Limit = parseInt(Limit, 10);
    const cacheKey = `jobs:Page_${Page}_Limit_${Limit}_Location_${
      Location || "all"
    }_Type_${Type || "all"}_Experience_${Experience || "all"}`;

    // const cachedData = await redisClient.get(cacheKey);
    // if (cachedData) {
    //   return res.json(JSON.parse(cachedData));
    // }

    const jobs = await Job.aggregate([
      {
        $match: {
          Location: { $regex: Location, $options: "i" },
          Type: { $regex: Type, $options: "i" },
          Experience: { $regex: Experience, $options: "i" },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [{ $skip: (Page - 1) * Limit }, { $limit: Limit }],
        },
      },
    ]);
    // await redisClient.setEx(
    //   cacheKey,
    //   60 * 60 * 24,
    //   JSON.stringify({
    //     status: 200,
    //     total: jobs[0].metadata[0]?.total || 0,
    //     data: jobs[0].data,
    //   })
    // );
    return res.json({
      status: 200,
      total: jobs[0].metadata[0]?.total || 0,
      data: jobs[0].data,
    });
  } catch (error) {
    return res.json({ status: 500, message: "Internal Server Error" });
  }
};

export const getAllMentors = async (req, res) => {
  try {
    let {
      Page = 1,
      Limit = 10,
      Name = "",
      Date = "",
      Time = "",
      Topic = "",
      Expertise = "",
    } = req.query;

    Page = parseInt(Page, 10);
    Limit = parseInt(Limit, 10);

    const isFirstPage = Page === 1;
    const isFiltersEmpty = !Name && !Date && !Time && !Topic && !Expertise;

    // if (isFirstPage && isFiltersEmpty) {
    //   const cachedData = await redisClient.get("mentors:firstPage");
    //   if (cachedData) {
    //     return res.json(JSON.parse(cachedData));
    //   }
    // }

    let matchQuery = {};
    if (Name) matchQuery.Name = { $regex: Name, $options: "i" };
    if (Expertise) {
      matchQuery[`Expertise.${Expertise}`] = { $exists: true };
      if (Topic) matchQuery[`Expertise.${Expertise}`] = { $in: [Topic] };
    }
    if (Date && Time) matchQuery[`Availability.${Date}`] = Time;
    else if (Date) matchQuery[`Availability.${Date}`] = { $exists: true };

    const mentors = await Mentor.aggregate([
      { $match: matchQuery },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [{ $skip: (Page - 1) * Limit }, { $limit: Limit }],
        },
      },
    ]);
    const response = {
      status: 200,
      total: mentors[0].metadata[0]?.total || 0,
      data: mentors[0].data,
    };
    // if (isFirstPage && isFiltersEmpty) {
    //   await redisClient.set("mentors:firstPage", JSON.stringify(response), {
    //     EX: 24 * 60 * 60,
    //   });
    // }

    return res.json(response);
  } catch (error) {
    return res.json({ status: 500, message: "Internal Server Error" });
  }
};

export const getMentorData = async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.query.Id)
      .where("Verified")
      .equals(true);
    if (mentor) {
      return res.json({ status: 200, data: mentor });
    } else {
      return res.json({ status: 404, message: "User doesn't exist." });
    }
  } catch (error) {
    return res.json({ status: 500, message: "Internal Server Error" });
  }
};

export const getAllCourses = async (req, res) => {
  try {
    // const cachedCourses = await redisClient.get("all_courses");
    // if (cachedCourses) {
    //   return res.json({
    //     status: 200,
    //     source: "cache",
    //     data: JSON.parse(cachedCourses),
    //   });
    // }
    const courses = await Course.find();
    if (courses.length > 0) {
      // await redisClient.setEx("all_courses", 864000, JSON.stringify(courses));
      return res.json({ status: 200, source: "database", data: courses });
    } else {
      return res.json({ status: 400, message: "No courses found." });
    }
  } catch (error) {
    return res.json({ status: 500, message: "Internal Server Error" });
  }
};

export const requestDoubt = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { UserId, MentorId, Message, Date, Slot, Name } = req.body;
    if (!UserId || !MentorId || !Message || !Date || !Slot || !Name) {
      return res.json({ status: 400, message: "Insufficient data" });
    }

    const user = await User.findById(UserId).session(session);
    const mentor = await Mentor.findById(MentorId).session(session);

    if (user.Coins < 25) {
      return res.json({
        status: 403,
        message: "Not enough coins! Solve problems to earn more.",
      });
    }

    if (!mentor) {
      await session.abortTransaction();
      return res.json({
        status: 404,
        message: "This mentor account doesn't exist.",
      });
    }

    const newDoubt = {
      Message,
      Date,
      Slot,
      MentorId,
      Name: mentor.Name,
      Key: nanoid(),
    };
    const rewards = await RewardModel.findOne({ Id: UserId });
    if (rewards) {
      rewards.history.push({
        category: "Debit",
        amount: 25,
        details: `A doubt request was raised to mentor ${mentor.Name} on date ${Date}`,
      });
      user.Coins = user.Coins - 25;
      await rewards.save({ session });
    }

    user.Doubts.push(newDoubt);
    await user.save({ session });

    newDoubt.Name = user.Name;
    newDoubt.UserId = UserId;
    mentor.Doubts.push(newDoubt);
    await mentor.save({ session });
    await session.commitTransaction();
    session.endSession();

    return res.json({ status: 200, message: "Request sent successfully." });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.json({
      status: 500,
      message: "Internal Server Error",
    });
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

export const refreshRequest = async (req, res) => {
  try {
    const { Id } = req.query;
    if (!Id) {
      return res.json({ status: 400, message: "Insufficient data" });
    }
    const user = await User.findById(Id);
    return res.json({
      status: 200,
      message: "Slots updated.",
      user: user,
    });
  } catch (error) {
    return res.json({ status: 500, message: "Internal Server Error" });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const userData = JSON.parse(req.body.Data);
    const profile = req.file;
    if (!userData) {
      return res.json({ status: 400, message: "Insufficient data" });
    }
    const user = await User.findById(userData._id);
    if (!user) {
      return res.json({ status: 404, message: "User not found" });
    }

    for (const key in userData) {
      if (key == "Bio" || key == "Name" || key == "ProfileLinks") {
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
    return res.json({
      status: 200,
      message: "Data updated successfully.",
    });
  } catch (error) {
    return res.json({ status: 500, message: "Internal Server Error", error });
  }
};

export const submitDoubtRating = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { Id, DoubtId, Rating } = req.body;

    if (
      !Id ||
      !DoubtId ||
      !Number.isFinite(Rating) ||
      Rating < 0.5 ||
      Rating > 5
    ) {
      await session.abortTransaction();
      session.endSession();
      return res.json({ status: 403, message: "Invalid input data." });
    }

    const user = await User.findById(Id).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.json({ status: 403, message: "User not found." });
    }

    const doubtIndex = user.Doubts.findIndex(
      (d) => d._id.toString() === DoubtId
    );
    if (doubtIndex === -1) {
      await session.abortTransaction();
      session.endSession();
      return res.json({ status: 403, message: "Incorrect doubt ID." });
    }

    if (user.Doubts[doubtIndex].Rating != null) {
      await session.abortTransaction();
      session.endSession();
      return res.json({ status: 403, message: "Feedback already submitted." });
    }

    const mentor = await Mentor.findById(
      user.Doubts[doubtIndex].MentorId
    ).session(session);
    if (!mentor) {
      await session.abortTransaction();
      session.endSession();
      return res.json({ status: 403, message: "Mentor not found." });
    }

    const mentorDoubt = mentor.AcceptedDoubts.find(
      (d) => d.Key === user.Doubts[doubtIndex].Key
    );
    if (!mentorDoubt) {
      await session.abortTransaction();
      session.endSession();
      return res.json({
        status: 403,
        message: "Doubt not found in mentor's records.",
      });
    }
    mentorDoubt.Rating = Rating;
    user.Doubts[doubtIndex].Rating = Rating;
    mentor.Rating.Count += 1;
    mentor.Rating.Score += Rating;
    await Promise.all([user.save({ session }), mentor.save({ session })]);
    // await redisClient.del("mentors:firstPage");

    await session.commitTransaction();
    session.endSession();

    return res.json({
      status: 200,
      message: "Feedback submitted successfully.",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.json({ status: 500, message: "Internal Server Error" });
  }
};

export const getRewardTransections = async (req, res) => {
  try {
    let data = await RewardModel.findOne({ Id: req.query.Id });
    if (data) {
      return res.json({
        status: 200,
        data: data.history,
      });
    } else {
      return res.json({
        status: 404,
        message: "User data not found.",
      });
    }
  } catch (error) {
    return res.json({ status: 500, message: "Internal Server Error" });
  }
};

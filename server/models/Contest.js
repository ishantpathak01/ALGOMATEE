import mongoose from "mongoose";

const problemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  source: {
    type: String,
    enum: ["AlgoMate", "LeetCode", "GeeksForGeeks", "Custom"],
    default: "AlgoMate",
  },
  externalUrl: { type: String, default: "" },
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    default: "Medium",
  },
  points: { type: Number, default: 100 },
  statement: { type: String, required: true },
  inputFormat: { type: String, default: "" },
  outputFormat: { type: String, default: "" },
  constraints: { type: String, default: "" },
  tags: { type: [String], default: [] },
  testcases: [
    {
      input: { type: String, default: "" },
      output: { type: String, default: "" },
      isHidden: { type: Boolean, default: false },
      explanation: { type: String, default: "" },
    },
  ],
  mentorHint: { type: String, default: "" },
});

const submissionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  problemId: { type: String, required: true },
  code: { type: String, default: "" },
  language: { type: String, default: "javascript" },
  status: {
    type: String,
    enum: ["Accepted", "Wrong Answer", "Time Limit Exceeded", "Runtime Error"],
    default: "Accepted",
  },
  passedTests: { type: Number, default: 0 },
  totalTests: { type: Number, default: 0 },
  pointsEarned: { type: Number, default: 0 },
  submittedAt: { type: Date, default: Date.now },
});

const contestSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    contestNumber: { type: Number, default: 1 },
    isWeekly: { type: Boolean, default: true },
    description: { type: String, default: "" },
    mentorId: { type: String, default: "" },
    mentorName: { type: String, default: "AlgoMate Lead Mentor" },
    mentorAvatar: { type: String, default: "" },
    mentorBio: { type: String, default: "" },
    startTime: { type: Date, default: Date.now },
    endTime: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    durationMinutes: { type: Number, default: 90 },
    rewardCoins: { type: Number, default: 200 },
    status: {
      type: String,
      enum: ["upcoming", "active", "completed"],
      default: "active",
    },
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Intermediate",
    },
    problems: [problemSchema],
    registeredUsers: { type: [String], default: [] },
    submissions: [submissionSchema],
    leaderboard: [
      {
        userId: { type: String },
        userName: { type: String },
        avatar: { type: String },
        score: { type: Number, default: 0 },
        problemsSolved: { type: Number, default: 0 },
        finishTimeMinutes: { type: Number, default: 0 },
        rank: { type: Number, default: 1 },
      },
    ],
  },
  { timestamps: true }
);

const Contest = mongoose.model("Contest", contestSchema);
export default Contest;

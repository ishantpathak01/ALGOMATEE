import mongoose from "mongoose";

const contestProblemSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["custom", "leetcode", "gfg", "external"],
    default: "custom",
  },
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CodingProblem",
  },
  title: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    default: "Medium",
  },
  points: {
    type: Number,
    default: 100,
  },
  link: {
    type: String,
    default: "",
  },
  platform: {
    type: String,
    default: "AlgoMate",
  },
});

const contestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      enum: ["weekly", "special", "practice"],
      default: "weekly",
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    problems: {
      type: [contestProblemSchema],
      default: [],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mentor",
      required: true,
    },
    mentorName: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["draft", "upcoming", "live", "ended", "cancelled"],
      default: "upcoming",
    },
    participants: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        joinedAt: { type: Date, default: Date.now },
        score: { type: Number, default: 0 },
      },
    ],
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

contestSchema.methods.refreshStatus = function () {
  const now = new Date();
  if (this.status === "cancelled" || this.status === "draft") return this.status;
  if (now < this.startTime) this.status = "upcoming";
  else if (now >= this.startTime && now <= this.endTime) this.status = "live";
  else this.status = "ended";
  return this.status;
};

const Contest = mongoose.model("Contest", contestSchema);
export default Contest;

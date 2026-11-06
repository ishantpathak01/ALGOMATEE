import mongoose from "mongoose";

const problem = new mongoose.Schema({
  Name: {
    type: String,
    required: true,
  },
  Id: {
    type: String,
    required: true,
  },
  Statement: {
    type: String,
    required: true,
  },
  Testcases: {
    type: [
      {
        input: {
          type: String,
        },
        output: {
          type: String,
        },
      },
    ],
    default: [],
  },
  TLE: {
    type: String,
  },
  MLE: {
    type: String,
  },
  Link: {
    type: String,
  },
  Platform: {
    type: String,
  },
  Tags: {
    type: [String],
    default: [],
  },
  Companies: {
    type: [String],
    default: [],
  },
  Content: {
    type: Boolean,
    default: true,
  },
  Level: {
    type: String,
    default: "Easy",
  },
});

const model = mongoose.model("CodingProblem", problem);
export default model;

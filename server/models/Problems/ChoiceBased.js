import mongoose from "mongoose";

const problem = new mongoose.Schema({
  Id: {
    type: String,
    required: true,
  },
  Statement: {
    type: String,
    required: true,
  },
  Options: {
    type: [
      {
        Name: String,
        IsValid: Boolean,
      },
    ],
    required: true,
  },
  Type: {
    type: Boolean,
    required: true,
  },
  Tags: {
    type: [String],
    default: [],
  },
});

const model = mongoose.model("ChoicebasedProblem", problem);
export default model;

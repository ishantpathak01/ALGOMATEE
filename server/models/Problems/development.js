import mongoose from "mongoose";

const devQuestionSchema = new mongoose.Schema(
  {
    Id: {
      type: String,
      required: true,
    },
    Name: {
      type: String,
      required: true,
    },
    Statement: {
      type: String,
      required: true,
    },
    Files: {
      type: [Object],
      required: true,
    },
  },
  { timestamps: true }
);

const DevQuestion = mongoose.model("DevQuestion", devQuestionSchema);

export default DevQuestion;

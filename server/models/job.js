import mongoose from "mongoose";

const jobSchema = mongoose.Schema(
  {
    Company: {
      type: String,
      required: true,
    },
    Position: {
      type: String,
      required: true,
    },
    Experience: {
      type: String,
      required: true,
    },
    ApplyLink: {
      type: String,
      required: true,
    },
    Location: {
      type: String,
      required: true,
    },
    Type: {
      type: String,
      required: true,
    },
    Salary: {
      type: String,
      required: true,
    },
    Author: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 864000,
    },
  },
  { timestamps: true }
);

const Job = mongoose.model("job", jobSchema);
export default Job;

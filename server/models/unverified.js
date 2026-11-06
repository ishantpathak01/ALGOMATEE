import mongoose from "mongoose";

const UnverifiedUsers = mongoose.Schema({
  Email: {
    type: String,
    required: true,
  },
  Type: {
    type: String,
    required: true,
  },
  Otp: {
    type: String,
    required: true,
  },
  Time: {
    type: Date,
    default: Date.now,
    expires: "2m",
  },
});

const model = mongoose.model("unverifiedUsers", UnverifiedUsers);
export default model;

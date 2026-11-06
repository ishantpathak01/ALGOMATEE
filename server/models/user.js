import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  Name: {
    type: String,
    required: true,
  },
  Email: {
    type: String,
    required: true,
    unique: true,
  },
  Password: {
    type: String,
    required: true,
  },
  Doubts: {
    type: [
      {
        MentorId: { type: String, required: true },
        Name: { type: String, required: true },
        Message: { type: String, required: true },
        Date: { type: String, required: true },
        Slot: { type: String, required: true },
        Key: { type: String, required: true },
        Status: { type: String, default: "Pending" },
        Rating: { type: Number, default: null },
      },
    ],
    default: [],
  },
  Bio: {
    type: String,
  },
  ProfileLinks: {
    LeetCode: {
      type: String,
    },
    GitHub: {
      type: String,
    },
    LinkedIn: {
      type: String,
    },
    Portfolio: {
      type: String,
    },
  },
  Picture: {
    type: String,
    required: true,
    default:
      "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?t=st=1737463526~exp=1737467126~hmac=69f016f48e070b13e6bc7c3434ec3518aca7cefc49b5ca969af5aa3efcc53be9&w=740",
  },
  Type: {
    type: String,
    required: true,
    default: "User",
  },
  Chats: {
    type: [
      {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
        mentorId: String,
        name: String,
      },
    ],
  },
  Classrooms: {
    type: [{ Name: String, Id: String, Mentor: String }],
    default: [],
  },
  Verified: {
    type: Boolean,
    default: false,
  },
  Coins:{
    type:Number,
    default:100
  }
});

const model = mongoose.model("user", userSchema);
export default model;

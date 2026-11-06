import mongoose from "mongoose";

const mentorSchema = mongoose.Schema({
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
  Picture: {
    type: String,
    required: true,
    default:
      "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?t=st=1737463526~exp=1737467126~hmac=69f016f48e070b13e6bc7c3434ec3518aca7cefc49b5ca969af5aa3efcc53be9&w=740",
  },
  Experience: {
    type: Number,
    default: 0,
  },
  Rating: {
    type: {
      Count: {
        type: Number,
        default: 0,
      },
      Score: {
        type: Number,
        default: 0,
      },
    },
    default: {},
  },
  Languages: {
    type: [String],
    default: ["English"],
  },
  Expertise: {
    type: Object,
    default: {},
  },
  Availability: {
    type: Object,
    default: {},
  },
  Doubts: {
    type: [
      {
        Name: { type: String, required: true },
        UserId: { type: String, required: true },
        Message: { type: String, required: true },
        Date: { type: String, required: true },
        Slot: { type: String, required: true },
        Key: { type: String, required: true },
      },
    ],
    default: [],
  },
  AcceptedDoubts: {
    type: [
      {
        Name: { type: String, required: true },
        UserId: { type: String, required: true },
        Message: { type: String, required: true },
        Date: { type: String, required: true },
        Slot: { type: String, required: true },
        Key: { type: String, required: true },
        Rating: { type: Number, default: null },
      },
    ],
    default: [],
  },
  MobileNumber: {
    type: Number,
  },
  Location: {
    type: String,
    default: "--",
  },
  About: {
    type: String,
    default: "I am a mentor",
  },
  Type: {
    type: String,
    default: "Mentor",
  },
  Chats: {
    type: [
      {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
        userId: String,
        name: String,
      },
    ],
  },
  Users: {
    type: [String],
    default: [],
  },
  Verified: { type: Boolean, default: false },
});

mentorSchema.pre("save", function (next) {
  const today = new Date().toISOString().split("T")[0];
  if (this.Availability) {
    Object.keys(this.Availability).forEach((date) => {
      if (date < today) delete this.Availability[date];
    });
  }
  next();
});

const model = mongoose.model("mentor", mentorSchema);
export default model;

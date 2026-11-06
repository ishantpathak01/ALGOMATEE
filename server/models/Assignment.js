import mongoose from "mongoose";
const schema = mongoose.Schema({
  Name: {
    type: String,
    required: true,
  },
  ClassroomId: {
    type: String,
    required: true,
  },
  Id: {
    type: String,
    required: true,
  },
  ExpiryDate: {
    type: String,
    required: true,
  },
  Questions: {
    type: [{ Name: String, Id: String }],
    required: true,
  },
  Attendies: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "assignmentAttendees",
      },
    ],
    default: [],
  },
});

const model = mongoose.model("assignment", schema);
export default model;

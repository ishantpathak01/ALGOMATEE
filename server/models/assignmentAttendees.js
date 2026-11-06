import mongoose from "mongoose";

const attendeeSchema = new mongoose.Schema(
  {
    Name: { type: String, required: true },
    Email: { type: String, required: true },
    Id: { type: String, required: true, index: true },
    Assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "assignment",
      required: true,
      index: true,
    },
    Questions: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

const Attendee = mongoose.model("assignmentAttendees", attendeeSchema);
export default Attendee;

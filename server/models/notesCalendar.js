import mongoose from "mongoose";

const notesCalendarSchema = new mongoose.Schema({
  ClassroomId: {
    type: String,
    required: true,
  },
  Id: {
    type: String,
    required: true,
  },
  Data: {
    type: Map,
    of: String,
    default: {},
  },
});

const calendar = mongoose.model("notesCalendar", notesCalendarSchema);
export default calendar;

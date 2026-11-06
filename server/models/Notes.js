import mongoose from "mongoose";

const notesSchema = mongoose.Schema({
  Data: {
    type: String,
    required: true,
  },
  Id: {
    type: String,
    required: true,
  },
  ClassroomId: {
    type: String,
    required: true,
  },
  Date: {
    type: String,
    required: true,
  },
});

const Notes = mongoose.model("notes", notesSchema);
export default Notes;

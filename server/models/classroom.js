import mongoose from "mongoose";

const sectionSchema = mongoose.Schema({
  Name: {
    type: String,
    required: true,
  },
  Remark: {
    type: String,
    required: true,
  },
  Id: {
    type: String,
    required: true,
  },
  Students: {
    type: [
      {
        Name: String,
        Email: String,
        Status: Boolean,
      },
    ],
    default: [],
  },
  Assignments: {
    type: [String],
    default: [],
  },
  Notes: {
    type: [String],
    default: [],
  },
});

const model = mongoose.model("classroom", sectionSchema);
export default model;

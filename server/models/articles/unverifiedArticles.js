import mongoose from "mongoose";

const articleSchema = mongoose.Schema({
  Name: {
    type: String,
    required: true,
  },
  CourseType: {
    type: String,
    required: true,
  },
  SheetType: {
    type: String,
    required: true,
    default: "Coding",
  },
  CourseName: {
    type: String,
    required: true,
  },
  ExistingId: {
    type: String,
    default: null,
  },
  Description: {
    type: String,
    required: true,
  },
  Content: {
    type: String,
    required: true,
  },
  Author: {
    type: String,
    required: true,
  },
  Problems: {
    Easy: {
      type: [{ Name: String, Id: String }],
    },
    Medium: { type: [{ Name: String, Id: String }] },
    Hard: { type: [{ Name: String, Id: String }] },
  },
  CodingPool: {
    type: [String],
    default: [],
  },
  ChoiceBasedPool: {
    type: [String],
    default: [],
  },
  Moderators: { type: [String], default: [] },
});

const Article = mongoose.model("unverified_article", articleSchema);
export default Article;

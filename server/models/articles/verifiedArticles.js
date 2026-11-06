import mongoose from "mongoose";

const articleSchema = mongoose.Schema({
  Name: {
    type: String,
    required: true,
  },
  SheetType: {
    type: String,
    required: true,
    default: "Coding",
  },
  CourseType: {
    type: String,
    required: true,
  },
  CourseName: {
    type: String,
    required: true,
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

const Article = mongoose.model("verified_article", articleSchema);
export default Article;

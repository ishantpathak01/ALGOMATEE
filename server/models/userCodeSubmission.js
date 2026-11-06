import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
  QuestionId: { type: String, required: true },
  Title: { type: String, required: true },
  Code: { type: String, required: true },
  Language: { type: String, required: true },
  Timestamp: { type: Date, default: Date.now },
});

const schema = new mongoose.Schema(
  {
    Id: { type: String, required: true, index: true },
    Submissions: { type: Map, of: Number, default: {} },
    RecentSubmissions: { type: [submissionSchema], default: [], maxlength: 10 },
    SolvedQuestions: { type: [String], default: []},
  },
  { timestamps: true }
);

const Submissions = mongoose.model("Submissions", schema);
export default Submissions;

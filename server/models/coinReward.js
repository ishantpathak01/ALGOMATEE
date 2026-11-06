import mongoose from "mongoose";

const rewardSchema = new mongoose.Schema({
  Id: {
    type: String,
    required: true,
  },
  submissionDates: {
    type: [String],
    default: [],
  },
  history: {
    type: [
      {
        category: String,
        details: String,
        amount: Number,
      },
    ],
    default: [],
  },
});

const RewardModel = mongoose.model("coins", rewardSchema);
export default RewardModel;

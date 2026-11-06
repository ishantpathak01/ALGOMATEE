import mongoose from "mongoose";

const topicSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
});

const Topic = mongoose.model("Topic", topicSchema);

const courseSchema = new mongoose.Schema({
  Name: {
    type: String,
    required: true,
  },
  Image: {
    type: String,
  },
  Icon: {
    type: String,
  },
  Description: {
    type: [String],
  },
  Courses: [
    {
      name: { type: String, required: true },
      topics: [
        {
          id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Topic",
          },
          name: {
            type: String,
          },
          description: {
            type: String,
          },
          authorName: {
            type: String,
          },
          words: {
            type: Number,
          },
        },
      ],
      image: { type: String },
      info: { type: [String] },
      key: { type: String, unique: true },
    },
  ],
  Author: {
    type: String,
    required: true,
  },
});

const Course = mongoose.model("Course", courseSchema);
export default Course;
export { Topic };

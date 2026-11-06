import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    members: [
      {
        name: { type: String, required: true },
        id: { type: String, required: true },
        profilePicture: { type: String, required: true },
      },
    ],

    messages: {
      type: [
        {
          senderId: {
            type: String,
            required: true,
          },
          content: { type: String, required: true },
          type: {
            type: String,
            default: "text",
          },
          doubt: {
            type: Object,
          },
          timestamp: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },
  },
  { timestamps: true }
);

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;

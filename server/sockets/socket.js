import { Server } from "socket.io";
import Chat from "../models/chat.js";

const users = {};

const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    socket.on("register", (userId) => {
      users[userId] = socket.id;
    });

    socket.on("sendMessage", async (data) => {
      const chat = await Chat.findById(data.chatId);
      delete data.chatId;
      chat.messages.push(data);
      await chat.save();
      const receiverSocketId = users[data.recieverId];
      const senderSocketId = users[data.senderId];

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", data);
      }
      if (senderSocketId) {
        io.to(senderSocketId).emit("newMessage", data);
      }
    });

    socket.on("disconnect", () => {
      for (const userId in users) {
        if (users[userId] === socket.id) {
          delete users[userId];
          console.log(`User ${userId} disconnected`);
          break;
        }
      }
    });
  });

  return io;
};

export default setupSocket;

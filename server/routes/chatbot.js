import express from "express";
import { chatMessage } from "../controllers/chatbot.js";

const route = express.Router();

route.post("/message", chatMessage);

export default route;

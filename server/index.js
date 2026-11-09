import dotenv from "dotenv";
dotenv.config();

import express from "express";
import http from "http";
import database from "./database.js";
import assessmentRoutes from "./routes/assessment.js";
import userRoutes from "./routes/user.js";
import mentorRoutes from "./routes/mentor.js";
import classroomRoutes from "./routes/classroom.js";
import resumeAnalyzerRoutes from "./routes/resumeAnalyzer.js";
import chatbotRoutes from "./routes/chatbot.js";
import adminRoutes from "./routes/admin.js";
import contestRoutes from "./routes/contest.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import setupSocket from "./sockets/socket.js";

const app = express();

// Trust proxy (important for deployment)
app.set("trust proxy", 1);

// Create HTTP server
const server = http.createServer(app);

// Rate limiter
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false
});

// Middlewares
const allowedOrigins = [
  "http://localhost:3000",
  ...(process.env.FRONTEND_URL || "")
    .split(",")
    .map((u) => u.trim().replace(/\/$/, ""))
    .filter(Boolean),
];
app.use(cors({
  origin: (origin, callback) =>
    !origin || allowedOrigins.includes(origin)
      ? callback(null, true)
      : callback(new Error("Not allowed by CORS")),
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Apply limiter only on API routes
app.use("/api", limiter);

// Health check
app.get("/", (req, res) => {
  res.status(200).json({
    status: "OK",
    service: "AlgoMate Backend",
    uptime: process.uptime()
  });
});

// Routes
app.use("/user", userRoutes);
app.use("/mentor", mentorRoutes);
app.use("/problem", assessmentRoutes);
app.use("/section", classroomRoutes);
app.use("/resume", resumeAnalyzerRoutes);
app.use("/chatbot", chatbotRoutes);
app.use("/admin", adminRoutes);
app.use("/contest", contestRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  try {
    await database();
    console.log("✅ Database connected");

    // 🔥 Initialize WebSocket
    const io = setupSocket(server);

    // Optional: make io accessible in routes
    app.set("io", io);

    // Start server
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Start everything
startServer();

export default app;
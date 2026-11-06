import express from "express";
import multer from "multer";
import { analyseResume } from "../controllers/resumeAnalyzer.js";

const route = express.Router();

// Store uploaded file in memory (no disk I/O needed)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed."));
    }
  },
});

route.post("/analyse", upload.single("resume"), analyseResume);

export default route;

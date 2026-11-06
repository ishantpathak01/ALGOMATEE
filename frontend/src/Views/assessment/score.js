import React, { useState } from "react";
import { motion } from "framer-motion";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import Confetti from "react-confetti";
import { useLocation, useWindowSize } from "react-use";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CodeIcon from "@mui/icons-material/Code";
import ListAltIcon from "@mui/icons-material/ListAlt";
import ReplayIcon from "@mui/icons-material/Replay";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import Aurora from "./../../animations/squares";
import { useNavigate } from "react-router-dom";

function ScoreScreen({
  mcqScore,
  mcqTotal,
  codingScore,
  codingTotal,
  setFullScreen,
  setFinished,
  setTimeLeft,
  assessmentType,
}) {
  const finalScore = mcqScore + codingScore;
  const finalTotal = mcqTotal + codingTotal;
  const finalPercentage = ((finalScore / finalTotal) * 100).toFixed(2);
  const mcqPercentage = ((mcqScore / mcqTotal) * 100).toFixed(2);
  const codingPercentage = ((codingScore / codingTotal) * 100).toFixed(2);
  const { width, height } = useWindowSize();
  const [isPassed, setIsPassed] = useState(finalPercentage >= 70);
  const quotes = [
    "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "The only way to do great work is to love what you do.",
    "Believe you can and you’re halfway there.",
    "Challenges are what make life interesting; overcoming them is what makes life meaningful.",
  ];
  const randomQuote =
    finalPercentage > 80
      ? quotes[0]
      : finalPercentage > 60
      ? quotes[1]
      : finalPercentage > 40
      ? quotes[2]
      : quotes[3];
  const getFeedback = (percentage, type) => {
    if (percentage >= 90) {
      return type === "final"
        ? "🔥 Outstanding performance! You've aced both MCQ and coding parts. Keep up the amazing work!"
        : type === "mcq"
        ? "📚 You've demonstrated a strong command of theoretical concepts. Well done!"
        : "💻 Your coding skills are top-notch! You've nailed it with efficiency and accuracy.";
    } else if (percentage >= 75) {
      return type === "final"
        ? "🎉 Great job! You've done well overall, and with a little more effort, you'll reach the top!"
        : type === "mcq"
        ? "✅ You have a good grasp of theoretical concepts. A bit more focus on details will improve your score."
        : "⚡ Your coding skills are solid. A little more refinement and you’ll be coding like a pro!";
    } else if (percentage >= 50) {
      return type === "final"
        ? "👍 Nice effort! With some additional practice, you're definitely on the right path!"
        : type === "mcq"
        ? "📖 You’ve got the basics down. A bit more review of key topics will help improve your score."
        : "👨‍💻 Your coding is coming along. Keep working on solving problems and refining your techniques.";
    } else {
      return type === "final"
        ? "💡 Keep going! You've got this! Learning from mistakes is a powerful way to grow."
        : type === "mcq"
        ? "📌 Focus on the core concepts and keep practicing. You'll improve with time."
        : "🔧 Don’t get discouraged. More practice and debugging will help you level up your coding skills!";
    }
  };

  const fullScreen = () => {
    const element = document.documentElement;
    if (!document.fullscreenElement) {
      if (element.requestFullscreen) {
        element.requestFullscreen().catch((err) => {
          console.error("Error attempting to enable fullscreen:", err);
        });
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
      }
    }
    setFullScreen(true);
  };

  setTimeout(() => {
    setIsPassed(false);
  }, 5000);

  const { state } = useLocation();
  const navigate = useNavigate();

  return (
    <div className="h-screen w-full flex flex-row justify-center items-center bg-gray-900 text-white p-6 overflow-hidden">
      <Aurora />
      {isPassed && <Confetti width={width - 10} height={height - 10} />}

      {/* Left Side: Feedback & Actions */}
      <div className="w-1/2 flex flex-col items-center gap-6 p-6">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3 bg-gray-800 px-8 py-4 rounded-xl shadow-lg"
        >
          {isPassed ? (
            <CheckCircleIcon className="text-green-500 text-4xl" />
          ) : (
            <WarningAmberIcon className="text-yellow-500 text-4xl" />
          )}
          <h1 className="text-3xl font-bold">
            {isPassed ? "Congratulations! 🎉" : "Keep Trying! ⚡"}
          </h1>
        </motion.div>

        <p className="text-lg p-4 text-gray-300 font-sans text-center max-w-lg">
          {getFeedback(finalPercentage, "final")}
        </p>
        <p className="text-md mb-[-20px] w-2/3 text-gray-400 text-center">
          {getFeedback(mcqPercentage, "mcq")}
        </p>
        <p className="text-md mb-4 w-2/3 text-gray-400 text-center">
          {getFeedback(codingPercentage, "coding")}
        </p>

        <p className="text-lg font-serif italic tracking-wide bg-slate-800 p-4 text-gray-300 text-center max-w-lg">
          {randomQuote}
        </p>

        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setFullScreen();
              setFinished();
              setTimeLeft();
              fullScreen();
            }}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
          >
            <ReplayIcon fontSize="small" /> Try Again
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              navigate(`/course/${state.usr.course}`);
            }}
            className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg flex items-center gap-2 hover:bg-red-700 transition"
          >
            <ExitToAppIcon fontSize="small" /> Exit
          </motion.button>
        </div>
      </div>

      {/* Right Side: Score Progress */}
      <div className="w-1/2 flex flex-col items-center gap-8">
        <div className="flex gap-8">
          {/* MCQ Score */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="w-60 h-60 bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col items-center"
          >
            <ListAltIcon className="text-blue-400 text-6xl mb-3" />
            <CircularProgressbar
              value={mcqPercentage}
              text={`${mcqPercentage}%`}
              styles={buildStyles({
                textColor: "#fff",
                pathColor: "#3b82f6",
                trailColor: "#374151",
                textSize: "18px",
              })}
            />
            <p className="mt-3 text-lg font-semibold text-gray-300">
              MCQ: {mcqScore}/{mcqTotal}
            </p>
          </motion.div>

          {/* Coding Score */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="w-60 h-60 bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col items-center"
          >
            <CodeIcon className="text-green-400 text-6xl mb-3" />
            <CircularProgressbar
              value={codingPercentage}
              text={`${codingPercentage}%`}
              styles={buildStyles({
                textColor: "#fff",
                pathColor: "#22c55e",
                trailColor: "#374151",
                textSize: "18px",
              })}
            />
            <p className="mt-3 text-lg font-semibold text-gray-300">
              {assessmentType}: {codingScore}/{codingTotal}
            </p>
          </motion.div>
        </div>

        {/* Final Score */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="w-72 h-72 bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col items-center"
        >
          <CircularProgressbar
            value={finalPercentage}
            text={`${finalPercentage}%`}
            styles={buildStyles({
              textColor: "#fff",
              pathColor: isPassed ? "#22c55e" : "#ef4444",
              trailColor: "#374151",
              textSize: "20px",
            })}
          />
          <p className="mt-4 text-xl font-semibold text-gray-300">
            Final Score: {finalScore}/{finalTotal}
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default ScoreScreen;

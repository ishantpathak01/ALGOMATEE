import React from "react";
import { motion } from "framer-motion";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import EXAM_SVG from "./../../assets/Illustrations/OnlineTest.svg";
import Squares from "./../../animations/squares";
import { useLocation, useNavigate } from "react-router-dom";

function MiniScreen({ setFullScreen, handleMiniScreen }) {
  const { state } = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex flex-row justify-around items-center h-screen bg-gray-900 text-white">
      <Squares />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="max-w-md p-6 bg-gray-800 shadow-xl rounded-3xl text-center border border-gray-700 backdrop-blur-lg bg-opacity-90"
      >
        <h2 className="text-2xl font-bold text-white mb-4">Mini Screen Mode</h2>
        <p className="text-gray-300 mb-4">
          You have switched to mini-screen mode. Your assessment progress is
          saved.
        </p>

        <div className="bg-gray-700 bg-opacity-40 p-4 rounded-lg text-sm text-gray-300 space-y-2">
          <p>
            ⚠️{" "}
            <span className="text-gray-400">
              5 minutes will be deducted for this activity.
            </span>
          </p>
          <p>
            🔄{" "}
            <span className="text-gray-400">
              Reloading the page will result in loss of progress.
            </span>
          </p>
          <p>
            🚫{" "}
            <span className="text-gray-400">Copy-pasting is not allowed.</span>
          </p>
        </div>

        <div className="flex gap-4 justify-between mt-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              navigate(`/course/${state.course}`);
            }}
            className="w-1/3 px-4 py-2 border border-gray-600 rounded-lg flex items-center justify-center gap-2 text-gray-300 hover:bg-gray-700 transition duration-300"
          >
            <ExitToAppIcon fontSize="small" /> Exit
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              handleMiniScreen(); // Reduces the timer by 5 minutes
              setFullScreen(true); // Switch to full screen mode
            }}
            className="w-1/3 px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition duration-300"
          >
            <PlayArrowIcon fontSize="small" /> Continue
          </motion.button>
        </div>
      </motion.div>

      <div>
        <img src={EXAM_SVG} className="h-120 w-120" alt="Exam Illustration" />
      </div>
    </div>
  );
}

export default MiniScreen;

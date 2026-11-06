import React from "react";
import { Assessment } from "@mui/icons-material";

function Statistics({ sheetSize, solvedQuestions, progress }) {
  return (
    <div className="relative bg-slate-900 rounded-xl p-6 overflow-hidden">
      {/* Neon Gradient Background */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400 to-purple-500 opacity-30 blur-lg"></div>

      {/* Title with Icon */}
      <h2 className="text-2xl font-bold text-white opacity-85 tracking-wide flex items-center gap-3 relative z-10">
        <Assessment /> Question Stats
      </h2>

      {/* Progress Bar */}
      <div className="mt-3 relative z-10 flex justify-center items-center">
        <div className="w-11/12 bg-slate-800 h-4 rounded-full mt-1 overflow-hidden">
          <div
            className="bg-blue-600 h-full rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mt-5 grid grid-cols-3 gap-4 text-center relative z-10">
        {/* Total Questions */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-md hover:scale-105 transition-all">
          <h3 className="text-gray-400 text-sm">Total</h3>
          <p className="text-white text-2xl font-bold">{sheetSize}</p>
        </div>

        {/* Solved Questions */}
        <div className="bg-green-900/20 p-4 rounded-lg shadow-md hover:scale-105 transition-all">
          <h3 className="text-green-400 text-sm flex items-center justify-center gap-1">
            Solved
          </h3>
          <p className="text-green-300 text-2xl font-bold">
            {solvedQuestions.length}
          </p>
        </div>

        {/* Unsolved Questions */}
        <div className="bg-red-900/20 p-4 rounded-lg shadow-md hover:scale-105 transition-all">
          <h3 className="text-red-400 text-sm flex items-center justify-center gap-1">
            Unsolved
          </h3>
          <p className="text-red-300 text-2xl font-bold">
            {sheetSize - solvedQuestions.length}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Statistics;

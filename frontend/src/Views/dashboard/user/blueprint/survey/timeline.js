import React from "react";
import { motion } from "framer-motion";
import { Schedule, Bolt, Timer } from "@mui/icons-material";

const Part5 = ({ formData, handleSelect }) => {
  const timelineOptions = [
    { value: "1 month", label: "1 Month", icon: "⚡" },
    { value: "3 months", label: "3 Months", icon: "⏳" },
    { value: "6 months", label: "6 Months", icon: "📅" },
    { value: "Flexible", label: "Flexible", icon: "🔄" },
  ];

  const commitmentOptions = [
    {
      value: "<5 hours",
      label: "Casual",
      sublabel: "<5 hrs/week",
      icon: <Timer className="text-blue-300" />,
    },
    {
      value: "5-10 hours",
      label: "Regular",
      sublabel: "5-10 hrs/week",
      icon: <Schedule className="text-green-300" />,
    },
    {
      value: "10+ hours",
      label: "Intensive",
      sublabel: "10+ hrs/week",
      icon: <Bolt className="text-yellow-300" />,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
          <span className="p-2 bg-green-500/20 rounded-full">
            <Schedule className="text-green-400 text-3xl" />
          </span>
          <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
            Study Plan
          </span>
        </h2>
        <p className="text-gray-300 text-lg">
          Customize your preparation timeline and commitment level
        </p>
      </motion.div>

      {/* Timeline Selection */}
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <span className="text-blue-300">⏳</span>
          Preparation Timeline
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {timelineOptions.map((option) => (
            <motion.button
              key={option.value}
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex flex-col items-center p-4 rounded-xl border transition-all ${
                formData.timeline === option.value
                  ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10"
                  : "border-gray-700 bg-gray-800 hover:border-gray-600"
              }`}
              onClick={() => handleSelect("timeline", option.value)}
              type="button"
            >
              <span className="text-2xl mb-1">{option.icon}</span>
              <span className="font-medium">{option.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Commitment Level */}
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <span className="text-purple-300">⚡</span>
          Weekly Commitment
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {commitmentOptions.map((option) => (
            <motion.button
              key={option.value}
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex flex-col items-center p-4 rounded-xl border transition-all ${
                formData.commitment === option.value
                  ? "border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/10"
                  : "border-gray-700 bg-gray-800 hover:border-gray-600"
              }`}
              onClick={() => handleSelect("commitment", option.value)}
              type="button"
            >
              <span className="text-2xl mb-1">{option.icon}</span>
              <span className="font-medium">{option.label}</span>
              <span className="text-xs text-gray-400 mt-1">
                {option.sublabel}
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Summary Card */}
      <motion.div
        className="mt-6 p-4 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl border border-gray-700"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h4 className="text-lg font-medium text-white mb-2">Your Study Plan</h4>
        <div className="flex justify-between">
          <div>
            <p className="text-gray-400 text-sm">Timeline</p>
            <p className="text-white">{formData.timeline}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Weekly Hours</p>
            <p className="text-white">{formData.commitment}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Part5;

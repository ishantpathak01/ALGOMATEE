import React from "react";
import { motion } from "framer-motion";
import TrendingIcon from "@mui/icons-material/TrendingUp";

const Part2 = ({ formData, handleSelect }) => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
      <TrendingIcon className="text-yellow-400" />
      Your DSA Level
    </h2>
    <p className="text-gray-300">How would you rate your current DSA skills?</p>

    <div className="space-y-3">
      {[
        {
          level: "beginner",
          label: "👶 Beginner",
          desc: "Just starting with DSA",
        },
        {
          level: "intermediate",
          label: "🚀 Intermediate",
          desc: "Solved 50+ problems",
        },
        {
          level: "advanced",
          label: "🔥 Advanced",
          desc: "300+ problems solved",
        },
      ].map((item) => (
        <motion.button
          key={item.level}
          whileHover={{ x: 5 }}
          className={`w-full text-left p-4 rounded-lg border ${
            formData.level === item.level
              ? "border-blue-500 bg-blue-500/10"
              : "border-gray-700 hover:border-gray-600"
          }`}
          onClick={() => handleSelect("level", item.level)}
          type="button"
        >
          <div className="font-medium text-white">{item.label}</div>
          <div className="text-sm text-gray-400">{item.desc}</div>
        </motion.button>
      ))}
    </div>
  </div>
);

export default Part2;

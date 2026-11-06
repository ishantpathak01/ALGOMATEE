import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Code as CodeIcon,
  ChevronRight as ChevronRightIcon,
  Bolt as BoltIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Part1 from "./survey/company";
import Part2 from "./survey/level";
import Part3 from "./survey/coveredTopics";
import Part4 from "./survey/targetTopics";
import Part5 from "./survey/timeline";

const DSA_BLUE_PRINT = () => {
  const navigate = useNavigate();
  const [currentPart, setCurrentPart] = useState(1);
  const [formData, setFormData] = useState({
    company: "",
    level: "beginner",
    timeline: "3 months",
    commitment: "5-10 hours",
    knownTopics: [],
    focusTopics: [],
  });

  const handleSelect = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleTopic = (topic, listType) => {
    setFormData((prev) => {
      const currentList = [...prev[listType]];
      const index = currentList.findIndex((t) => t.name === topic.name);

      if (index === -1) {
        currentList.push(topic);
      } else {
        currentList.splice(index, 1);
      }

      return { ...prev, [listType]: currentList };
    });
  };

  const submitBlueprint = () => {
    toast.promise(
      new Promise((resolve) => {
        setTimeout(() => {
          resolve();
          navigate("/dsa-roadmap");
        }, 1500);
      }),
      {
        loading: "Creating your optimized DSA roadmap...",
        success: <b>Roadmap generated successfully!</b>,
        error: <b>Failed to create roadmap</b>,
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 border border-slate-700 rounded-2xl text-white p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <motion.div
            whileHover={{ rotate: 5, scale: 1.05 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mb-6 shadow-lg"
          >
            <CodeIcon className="text-4xl" />
          </motion.div>
          <h1 className="text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            DSA Roadmap Builder
          </h1>
          <p className="text-gray-300 text-lg max-w-lg mx-auto">
            Get a personalized study plan tailored for your dream company and
            skill level
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex justify-between items-center mb-10 relative px-4">
          <div className="absolute top-1/2 h-1.5 bg-gray-700 w-full -z-10 rounded-full"></div>
          <div
            className="absolute top-1/2 h-1.5 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 -z-10 rounded-full"
            style={{ width: `${(currentPart - 1) * 20}%` }}
          ></div>
          {[1, 2, 3, 4, 5].map((step) => (
            <div key={step} className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  currentPart >= step
                    ? "bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg"
                    : "bg-gray-700"
                } ${
                  currentPart === step ? "ring-2 ring-blue-400 scale-110" : ""
                }`}
              >
                {step}
              </div>
              <span
                className={`text-xs mt-2 font-medium ${
                  currentPart >= step ? "text-blue-300" : "text-gray-500"
                }`}
              >
                {["Company", "Level", "Known", "Focus", "Plan"][step - 1]}
              </span>
            </div>
          ))}
        </div>

        {/* Form Content */}
        <motion.div
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 md:p-8 mb-8 min-h-[450px] border border-gray-700 shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <AnimatePresence mode="wait">
            {currentPart === 1 && (
              <motion.div
                key="part1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Part1 formData={formData} handleSelect={handleSelect} />
              </motion.div>
            )}
            {currentPart === 2 && (
              <motion.div
                key="part2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Part2 formData={formData} handleSelect={handleSelect} />
              </motion.div>
            )}
            {currentPart === 3 && (
              <motion.div
                key="part3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Part3 formData={formData} setFormData={setFormData} />
              </motion.div>
            )}
            {currentPart === 4 && (
              <motion.div
                key="part4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Part4 formData={formData} setFormData={setFormData} />
              </motion.div>
            )}
            {currentPart === 5 && (
              <motion.div
                key="part5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Part5 formData={formData} handleSelect={handleSelect} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          {currentPart > 1 && (
            <motion.button
              whileHover={{ x: -2 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 rounded-lg flex items-center text-gray-300 hover:text-white transition-colors"
              onClick={() => setCurrentPart((p) => p - 1)}
              type="button"
            >
              <ArrowBackIcon className="mr-2" />
              Back
            </motion.button>
          )}

          {currentPart < 5 ? (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`ml-auto px-8 py-3 rounded-lg flex items-center ${
                (currentPart === 1 && !formData.company) ||
                (currentPart === 3 && formData.knownTopics.length === 0)
                  ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-lg"
              }`}
              disabled={
                (currentPart === 1 && !formData.company) ||
                (currentPart === 3 && formData.knownTopics.length === 0)
              }
              onClick={() => setCurrentPart((p) => p + 1)}
              type="button"
            >
              Continue <ChevronRightIcon className="ml-2" />
            </motion.button>
          ) : (
            <motion.button
              whileHover={{
                scale: 1.03,
                boxShadow: "0 0 15px rgba(99, 102, 241, 0.5)",
              }}
              whileTap={{ scale: 0.97 }}
              className="ml-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center shadow-lg hover:shadow-blue-500/20 transition-all"
              onClick={submitBlueprint}
              type="button"
            >
              Generate Roadmap <BoltIcon className="ml-2 animate-pulse" />
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DSA_BLUE_PRINT;

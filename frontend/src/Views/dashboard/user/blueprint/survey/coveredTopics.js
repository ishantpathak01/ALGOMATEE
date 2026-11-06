import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Search as SearchIcon, Close } from "@mui/icons-material";
import { codingProblemTags } from "./../../../../../ConstantData/problems";

const TopicSelector = ({ formData, setFormData }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("all"); // 'all' or 'selected'

  // Filter topics based on search
  const filteredTopics = codingProblemTags.filter((topic) =>
    topic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get selected topics from formData
  const selectedTopics = formData.knownTopics;
  const unselectedTopics = filteredTopics.filter(
    (topic) => !selectedTopics.includes(topic)
  );

  // Toggle topic selection
  const toggleTopic = (topic) => {
    setFormData((prev) => {
      const newTopics = prev.knownTopics.includes(topic)
        ? prev.knownTopics.filter((t) => t !== topic)
        : [...prev.knownTopics, topic];

      return {
        ...prev,
        knownTopics: newTopics,
      };
    });
  };

  // Display topics based on current view mode
  const displayTopics =
    viewMode === "selected"
      ? selectedTopics
      : viewMode === "unselected"
      ? unselectedTopics
      : filteredTopics;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="p-2 bg-green-500/20 rounded-full">
            <Check className="text-green-400" />
          </span>
          <span>Known Topics</span>
        </h2>
        <p className="text-gray-300">
          Select all DSA concepts you're familiar with (multiple selection)
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search topics..."
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <SearchIcon className="absolute left-3 top-3.5 text-gray-400" />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("all")}
            className={`px-4 py-2 rounded-lg ${
              viewMode === "all"
                ? "bg-blue-600"
                : "bg-gray-800 hover:bg-gray-700"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setViewMode("selected")}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              viewMode === "selected"
                ? "bg-green-600"
                : "bg-gray-800 hover:bg-gray-700"
            }`}
          >
            Selected{" "}
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
              {selectedTopics.length}
            </span>
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-400">
          <span>Selected: {selectedTopics.length}</span>
          <span>Total: {codingProblemTags.length}</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${
                (selectedTopics.length / codingProblemTags.length) * 100
              }%`,
            }}
          />
        </div>
      </div>

      {/* Topics Grid */}
      <div className="flex flex-row flex-wrap justify-center items-start max-h-96 overflow-y-auto custom-scrollbar">
        <AnimatePresence>
          {displayTopics.length > 0 ? (
            displayTopics.map((topic) => (
              <motion.button
                key={topic}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center justify-between rounded-xl border transition-all h-16 w-64 p-4 m-2 ${
                  selectedTopics.includes(topic)
                    ? "border-green-500 bg-green-500/10 text-white"
                    : "border-gray-700 bg-gray-800 hover:border-gray-600 text-gray-300"
                }`}
                onClick={() => toggleTopic(topic)}
                type="button"
              >
                <span className="font-medium">{topic}</span>
                {selectedTopics.includes(topic) ? (
                  <span className="p-1 bg-green-500/20 rounded-full">
                    <Check className="text-green-400 text-lg" />
                  </span>
                ) : (
                  <span className="p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Check className="text-gray-400 text-lg" />
                  </span>
                )}
              </motion.button>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-2 text-center py-8 text-gray-500"
            >
              {viewMode === "selected"
                ? "You haven't selected any topics yet"
                : "No topics found matching your search"}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Selected Tags Preview (always visible when there are selections) */}
      {selectedTopics.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6"
        >
          <h3 className="text-lg font-medium text-gray-300 mb-2">
            Your Selected Topics:
          </h3>
          <div className="flex flex-wrap gap-2">
            {selectedTopics.map((topic) => (
              <motion.div
                key={topic}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/30 rounded-full text-green-400"
              >
                <span className="text-sm">{topic}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTopic(topic);
                  }}
                  className="text-green-300 hover:text-white"
                >
                  <Close className="text-sm" />
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default TopicSelector;

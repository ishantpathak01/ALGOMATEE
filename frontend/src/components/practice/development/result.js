import React from "react";
import { motion } from "framer-motion";
import {
  EmojiEvents as TrophyIcon,
  Celebration as FireworksIcon,
  Star as StarIcon,
  Mood as HappyIcon,
  SentimentSatisfied as GoodIcon,
  SentimentNeutral as OkayIcon,
  MoodBad as PoorIcon,
} from "@mui/icons-material";

const Result = ({ score, feedback }) => {
  const getCategory = () => {
    if (score >= 90) return "legendary";
    if (score >= 80) return "excellent";
    if (score >= 70) return "good";
    if (score >= 50) return "average";
    return "poor";
  };

  const category = getCategory();

  const categories = {
    legendary: {
      bg: "bg-gradient-to-br from-purple-900 to-slate-800",
      text: "text-purple-200",
      icon: <TrophyIcon className="!text-7xl text-purple-400" />,
      label: "Legendary Performance",
      accent: "purple-500",
    },
    excellent: {
      bg: "bg-gradient-to-br from-slate-800 to-slate-700",
      text: "text-purple-100",
      icon: <FireworksIcon className="!text-7xl text-purple-400" />,
      label: "Excellent Work",
      accent: "purple-400",
    },
    good: {
      bg: "bg-gradient-to-br from-slate-700 to-slate-600",
      text: "text-gray-100",
      icon: <HappyIcon className="!text-7xl text-purple-300" />,
      label: "Good Job",
      accent: "purple-300",
    },
    average: {
      bg: "bg-gradient-to-br from-slate-600 to-slate-500",
      text: "text-gray-200",
      icon: <OkayIcon className="!text-7xl text-purple-200" />,
      label: "Solid Effort",
      accent: "purple-200",
    },
    poor: {
      bg: "bg-gradient-to-br from-slate-500 to-slate-400",
      text: "text-gray-300",
      icon: <PoorIcon className="!text-7xl text-purple-100" />,
      label: "Needs Improvement",
      accent: "purple-100",
    },
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  // Floating elements animation
  const floatingElements = Array.from({ length: 15 }).map((_, i) => (
    <motion.div
      key={i}
      initial={{
        opacity: 0,
        x: Math.random() * 100 - 50,
        y: Math.random() * 100 - 50,
        rotate: Math.random() * 360,
      }}
      animate={{
        opacity: [0, 0.8, 0],
        y: [0, -100],
        transition: {
          duration: 4 + Math.random() * 3,
          repeat: Infinity,
          delay: Math.random() * 2,
        },
      }}
      className={`absolute text-${categories[category].accent}`}
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        fontSize: `${Math.random() * 12 + 8}px`,
      }}
    >
      <StarIcon />
    </motion.div>
  ));
  const isLoading = score === null || score === undefined; // <<< This line
  if (isLoading) {
    return (
      <div className="bg-slate-300 h-screen">
        <motion.div
          className="flex flex-col pt-20 items-center justify-center h-120 bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-3xl shadow-2xl p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-20 h-20 rounded-full border-8 border-t-purple-500 border-b-purple-300 border-l-transparent border-r-transparent animate-spin"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          />
          <motion.h2
            className="mt-6 text-purple-300 text-2xl font-extrabold tracking-wider"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Cooking your Result...
          </motion.h2>
          <motion.p
            className="text-purple-400 mt-2 text-sm tracking-wide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            🔥 Stay tuned, greatness is loading 🔥
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-20">
      <div
        className={`min-h-screen w-full ${categories[category].bg} ${categories[category].text} p-8 flex items-center justify-center`}
      >
        {/* Floating elements */}
        {category === "legendary" && (
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            {floatingElements}
          </div>
        )}

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="w-full max-w-6xl"
        >
          {/* Main Result Card */}
          <motion.div
            variants={item}
            className="w-full p-12 rounded-3xl bg-black/20 backdrop-blur-lg border border-slate-500/30 shadow-xl mb-12 text-center relative overflow-hidden"
          >
            {/* Animated border */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-3xl border-t-2 border-b-2 border-slate-400/10 pointer-events-none"
            />

            {/* Score Display */}
            <motion.div variants={item} className="mb-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className={`mx-auto w-64 h-64 rounded-full flex items-center justify-center bg-slate-700/50 border-4 border-${categories[category].accent}/30 shadow-lg`}
              >
                <div className="relative z-10">
                  <div className="text-7xl font-bold">{score}</div>
                  <div className="text-xl mt-2 text-slate-300">out of 100</div>
                </div>
              </motion.div>
            </motion.div>

            {/* Category Display */}
            <motion.div variants={item} className="mb-8">
              <div className="flex justify-center">
                {categories[category].icon}
              </div>
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-4xl font-bold mt-6"
              >
                {categories[category].label}
              </motion.h1>
            </motion.div>

            {/* Progress Bar */}
            <motion.div variants={item} className="mt-8 mb-2">
              <div className="w-full bg-slate-700/50 rounded-full h-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  transition={{ duration: 1.5, delay: 0.7 }}
                  className={`h-3 rounded-full bg-${categories[category].accent}`}
                />
              </div>
              <div className="text-right text-sm text-slate-300 mt-1">
                {score}% completed
              </div>
            </motion.div>
          </motion.div>

          {/* Feedback Section */}
          <motion.div
            variants={item}
            className="w-full p-8 rounded-2xl bg-slate-800/70 backdrop-blur-md border border-slate-500/20 shadow-lg"
          >
            <h2 className="text-2xl font-bold mb-6 text-slate-100">
              Detailed Feedback
            </h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="text-lg leading-relaxed text-slate-200"
            >
              {feedback
                ? feedback.split("\n").map((line, i) => <p key={i}>{line}</p>)
                : "No feedback provided."}
            </motion.p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Result;

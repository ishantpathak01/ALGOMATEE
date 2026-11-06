import React, { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  EmojiEvents as EmojiEventsIcon,
  Equalizer as EqualizerIcon,
  CalendarToday as CalendarIcon,
  Info as InfoIcon,
  Bolt as BoltIcon,
  AutoAwesome as AutoAwesomeIcon,
} from "@mui/icons-material";
import plans from "./../../../../ConstantData/studyPlans";
import BG_IMG_ACTIVE from "./../../../../assets/Illustrations/activeStudyPlan.svg";
import BG_IMG_DEACTIVE from "./../../../../assets/Illustrations/deactiveStudyPlan.svg";
import BG_IMG_CREATE from "./../../../../assets/Illustrations/card01.svg";
import { useNavigate } from "react-router-dom";

const BlueprintsList = () => {
  // Default active plan ID (can be changed as needed)
  const DEFAULT_ACTIVE_ID = 1;

  // Initialize plans with the default active plan
  const initialPlans = plans.map((plan) => ({
    ...plan,
    active: plan.id === DEFAULT_ACTIVE_ID,
  }));

  const [allPlans, setAllPlans] = useState(initialPlans);
  const activePlan = allPlans.find((plan) => plan.active);
  const navigate = useNavigate();
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  const handleCreateNew = () => {
    toast.promise(
      new Promise((resolve) => {
        setTimeout(() => {
          resolve("success");
          navigate("./create");
        }, 1000);
      }),
      {
        loading: "Launching AI Blueprint Generator...",
        success: <b>AI is creating your personalized blueprint!</b>,
        error: <b>Could not launch generator.</b>,
      }
    );
  };

  const handleActivatePlan = (planToActivate) => {
    // Update all plans: set the selected plan as active and others as inactive
    const updatedPlans = allPlans.map((plan) => ({
      ...plan,
      active: plan.id === planToActivate.id,
    }));

    setAllPlans(updatedPlans);
    toast.success(`"${planToActivate.title}" is now your active plan!`);
  };

  const handleContinuePlan = ({ planTitle, planId }) => {
    toast(`Resuming "${planTitle}"`, {
      icon: "📚",
      style: {
        background: "#3B82F6",
        color: "#fff",
      },
    });
    navigate(`./${planId}`);
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial="hidden"
        animate="show"
        variants={containerVariants}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-12">
          <h1 className="text-3xl font-bold text-white sm:text-3xl border-b-2 border-slate-700 pb-2">
            <span className="text-white">Practice BlueprintsList</span>
          </h1>
          <p className="mt-3 max-w-xl mx-auto text-lg text-gray-300 sm:mt-4">
            AI-powered roadmaps to crack your dream tech company
          </p>
        </motion.div>

        {/* Current Active Plan Highlight */}
        {plans.length != 0 ? (
          <div
            className="mb-12 rounded-xl shadow-lg overflow-hidden text-white border border-slate-400"
            style={{
              backgroundImage: `url(${BG_IMG_ACTIVE})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                  <div className="flex items-center">
                    <span className="bg-white text-blue-600 text-xs font-semibold px-2.5 py-0.5 rounded-full mr-3">
                      ACTIVE
                    </span>
                    <span className="text-sm font-medium">
                      {activePlan.targetCompany} Preparation
                    </span>
                  </div>
                  <h2 className="mt-2 text-2xl font-bold">
                    {activePlan.title}
                  </h2>
                  <div className="mt-4 flex flex-wrap gap-4">
                    <div className="flex items-center">
                      <ScheduleIcon fontSize="small" className="mr-1.5" />
                      <span>{activePlan.duration}</span>
                    </div>
                    <div className="flex items-center">
                      <EmojiEventsIcon fontSize="small" className="mr-1.5" />
                      <span>Target: {activePlan.package}</span>
                    </div>
                    <div className="flex items-center">
                      <CalendarIcon fontSize="small" className="mr-1.5" />
                      <span>{activePlan.dailyCommitment}/day</span>
                    </div>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="mt-4 sm:mt-0 bg-white text-blue-600 hover:bg-blue-50 font-medium rounded-lg px-6 py-2.5 transition-colors flex items-center"
                  onClick={() =>
                    handleContinuePlan({
                      planTitle: activePlan.title,
                      planId: activePlan.id,
                    })
                  }
                >
                  <BoltIcon className="mr-2" fontSize="small" />
                  Continue Plan
                </motion.button>
              </div>

              {/* Progress bar */}
              <div className="mt-6">
                <div className="flex justify-between text-sm font-medium mb-1">
                  <span>Progress</span>
                  <span>{activePlan.progress}%</span>
                </div>
                <div className="w-full bg-blue-400 rounded-full h-2.5">
                  <div
                    className="bg-white h-2.5 rounded-full"
                    style={{ width: `${activePlan.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Completed track */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Completed Topics</span>
                  <span className="text-xs">
                    {activePlan.completedTopics.length}/
                    {activePlan.completedTopics.length +
                      activePlan.remainingTopics.length}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {activePlan.completedTopics.map((topic, index) => (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white bg-opacity-20 text-xs px-2 py-1 rounded-full flex items-center"
                    >
                      <CheckCircleIcon fontSize="inherit" className="mr-1" />
                      {topic}
                    </motion.span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Show this when there's no active plan
          <div
            className="mb-12 rounded-xl shadow-2xl border border-slate-600 overflow-hidden text-white p-8 text-center "
            style={{
              backgroundImage: `url(${BG_IMG_CREATE})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="flex flex-col items-center">
              <div className="bg-white bg-opacity-20 rounded-full p-3 mb-4">
                <AutoAwesomeIcon className="text-4xl text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-1">
                No Active Blueprint Found
              </h2>
              <p className="text-sm text-slate-100 mb-6 max-w-md">
                Create your personalized, AI-powered blueprint to begin your
                structured preparation journey and unlock your dream career
                path.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-blue-600 hover:bg-blue-50 font-semibold rounded-lg px-6 py-3 transition-all inline-flex items-center"
                onClick={handleCreateNew}
              >
                <AddIcon className="mr-2" />
                Generate AI Blueprint
              </motion.button>
            </div>
          </div>
        )}

        {plans.length != 0 && (
          <div className="justify-end flex mb-6 mr-2">
            <button
              className="flex flex-row items-center justify-center top-4 space-x-2 border focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 border-slate-500 text-slate-500 hover:text-white hover:bg-slate-800 focus:ring-slate-500"
              onClick={handleCreateNew}
            >
              <AddIcon className="mr-2" />
              <h2>Create New Blueprint</h2>
            </button>
          </div>
        )}

        {/* All Plans Grid */}
        <motion.div
          variants={containerVariants}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {allPlans.map((plan) => (
            <motion.div
              key={plan.id}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className={`rounded-lg shadow-lg overflow-hidden border ${
                plan.active
                  ? "border-slate-700 border-2 shadow-slate-900"
                  : "border-gray-700"
              } bg-gray-800 transition-all duration-200`}
              style={{
                backgroundImage: `url(${BG_IMG_DEACTIVE})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {plan.title}
                    </h3>
                    <p className="text-sm text-gray-300 mt-1">
                      {plan.targetCompany} • {plan.duration}
                    </p>
                  </div>
                  {plan.progress === 100 && (
                    <span className="bg-green-900/80 text-green-200 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
                      <CheckCircleIcon fontSize="small" className="mr-1" />{" "}
                      Completed
                    </span>
                  )}
                </div>

                <div className="mt-4 flex items-center text-gray-300">
                  <EmojiEventsIcon fontSize="small" className="mr-1.5" />
                  <span className="text-sm font-medium">
                    Target: {plan.package}
                  </span>
                </div>

                <div className="mt-4 flex items-center text-gray-300">
                  <ScheduleIcon fontSize="small" className="mr-1.5" />
                  <span className="text-sm font-medium">
                    {plan.dailyCommitment}/day
                  </span>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>{plan.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${
                        plan.progress === 100 ? "bg-green-500" : "bg-blue-400"
                      }`}
                      style={{ width: `${plan.progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="mt-6 flex justify-between items-center">
                  <button className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors">
                    View Details
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`text-sm font-medium px-4 py-2 rounded-md transition-colors flex items-center ${
                      plan.active
                        ? "bg-blue-900 text-blue-100 hover:bg-blue-800"
                        : "bg-gray-700 text-gray-200 hover:bg-gray-600"
                    }`}
                    onClick={() =>
                      plan.active
                        ? handleContinuePlan({
                            planTitle: plan.title,
                            planId: plan.id,
                          })
                        : handleActivatePlan(plan)
                    }
                  >
                    {plan.active ? (
                      <>
                        <BoltIcon fontSize="small" className="mr-1" />
                        Continue
                      </>
                    ) : (
                      "Activate"
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Information Section - Only shown when no active blueprint */}
        {plans.length === 0 && (
          <div className="mt-6 bg-gray-800 border border-gray-700 shadow-xl rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <InfoIcon className="mr-2 text-blue-400" />
              Unlock Your AI Blueprint
            </h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 mb-4">
                🚀 Ditch the generic prep. AlgoMate builds a custom AI roadmap
                that’s all about *you* — your goals, your grind, your dream
                offer. No fluff, just precision.
              </p>

              <ul className="mt-2 space-y-4 text-gray-300 mb-6">
                <li className="flex items-start">
                  <span className="ml-8 text-blue-400 rounded-full  mr-3">
                    <AutoAwesomeIcon fontSize="[10px]" />
                  </span>
                  <span>
                    <strong>Company-specific prep</strong> — Google? Amazon?
                    Microsoft? We’ve cracked the pattern.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="ml-8 text-blue-400 rounded-full  mr-3">
                    <AutoAwesomeIcon fontSize="[10px]" />
                  </span>
                  <span>
                    <strong>Custom timeline</strong> — You pick the pace: 30,
                    60, 90, or 180 days. The grind, optimized.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="ml-8 text-blue-400 rounded-full  mr-3">
                    <AutoAwesomeIcon fontSize="[10px]" />
                  </span>
                  <span>
                    <strong>Target package</strong> — 10–20 LPA? 50+ LPA? We
                    scale difficulty to match the money you're chasing.
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="ml-8 text-blue-400 rounded-full  mr-3">
                    <AutoAwesomeIcon fontSize="[10px]" />
                  </span>
                  <span>
                    <strong>Skill-based path</strong> — Whether you’re a
                    beginner or beast, we adapt in real-time.
                  </span>
                </li>
              </ul>

              <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
                <p className="font-medium text-blue-400 flex items-center">
                  <BoltIcon className="mr-2" fontSize="small" />
                  Your Blueprint Evolves With You ⚡
                </p>
                <p className="mt-2 text-gray-300 text-sm">
                  As you progress, the AI reshuffles priorities, boosts
                  difficulty, and plugs in high-ROI content to keep you sharp
                  and job-ready.
                </p>
              </div>

              <div className="mt-6 text-center">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg px-6 py-3 transition-all shadow-lg inline-flex items-center"
                  onClick={handleCreateNew}
                >
                  <AutoAwesomeIcon className="mr-2" />
                  Build My AI Blueprint
                </motion.button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default BlueprintsList;

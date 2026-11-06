import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAppContext } from "../../context/userContext";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CodeIcon from "@mui/icons-material/Code";
import QuizIcon from "@mui/icons-material/Quiz";
import { motion } from "framer-motion";
import ConstructionIcon from "@mui/icons-material/Construction";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";

function SkillTest() {
  const { user } = useAppContext();
  const { state } = useLocation();
  const { id, topic } = useParams();
  const navigate = useNavigate();

  console.log(state);
  const startAssessment = async () => {
    if (!user) {
      navigate(`/auth/user`);
      return;
    }
    goFullScreen();
    navigate(`/user/assessment/${topic}`, {
      state: {
        article: topic,
        course: id,
        SheetType: state?.data?.SheetType,
      },
    });
  };

  function goFullScreen() {
    let elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }
  }

  if (state?.data?.SheetType === "Default") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-black_A to-black_B text-white px-6 py-12 relative mt-[-12px]">
        {/* Background Effects */}
        <div className="absolute inset-0 flex justify-center items-center">
          <div className="absolute top-20 left-20 w-96 h-96 bg-yellow-500 rounded-full blur-3xl opacity-20"></div>
          <div className="absolute w-72 h-72 bg-orange-500 rounded-full blur-3xl opacity-20 right-10 bottom-20"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl"
        >
          <motion.div
            animate={{
              rotate: [0, 10, -10, 0],
              y: [0, -10, 0],
            }}
            transition={{
              repeat: Infinity,
              repeatType: "reverse",
              duration: 2,
            }}
            className="mb-8"
          >
            <ConstructionIcon
              style={{ fontSize: 80 }}
              className="text-yellow-400"
            />
          </motion.div>

          <h1 className="text-4xl font-bold mb-4">Assessment Coming Soon!</h1>

          <p className="text-xl text-gray-300 mb-8">
            We're working hard to create an amazing assessment experience for
            this topic. Check back soon!
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-black_A to-black_B text-white px-6 py-12 relative mt-[-12px]">
      {/* Background Effects */}
      <div className="absolute inset-0 flex justify-center items-center">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute w-72 h-72 bg-blue-500 rounded-full blur-3xl opacity-20 right-10 bottom-20"></div>
      </div>

      {/* Title */}
      <h1 className="text-5xl font-bold mb-6 text-center">
        Test Your Skills -{" "}
        <span className="text-purple-400">{state.data.Name}</span>
      </h1>

      {/* Glassmorphism Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white bg-opacity-10 backdrop-blur-lg p-8 rounded-2xl shadow-lg border border-white/20 w-full max-w-lg"
      >
        {/* Assessment Type */}
        <h2 className="text-xl font-semibold text-center mb-4">
          Assessment 🚀
        </h2>

        <div className="flex justify-center gap-6 mb-6">
          <button className="px-6 py-2 rounded-lg font-medium transition-all duration-300 bg-gray-700 text-gray-300 hover:bg-gray-600">
            {state.data.SheetType} test + MCQ Quiz
          </button>
        </div>

        {/* Question & Time Details */}
        <div className="flex flex-row justify-around items-center text-center mb-6">
          {state?.data.SheetType == "Coding" ? (
            <div className="flex w-24 h-24 flex-col items-center bg-blue-500 bg-opacity-20 p-4 pt-3 rounded-lg shadow-md">
              <CodeIcon fontSize="medium" className="text-blue-400" />
              <p className="text-xl font-semibold mt-1">4</p>
              <p className="text-sm text-gray-300">Coding</p>
            </div>
          ) : (
            <div className="flex w-24 h-24 flex-col items-center bg-blue-500 bg-opacity-20 p-4 pt-3 rounded-lg shadow-md">
              <CodeIcon fontSize="medium" className="text-blue-400" />
              <p className="text-xl font-semibold mt-1">1</p>
              <p className="text-sm text-gray-300">Task</p>
            </div>
          )}

          {/* MCQ Questions */}
          <div className="flex w-24 h-24 flex-col items-center bg-purple-500 bg-opacity-20 p-4 pt-3 rounded-lg shadow-md">
            <QuizIcon fontSize="medium" className="text-purple-400" />
            <p className="text-xl font-semibold mt-1">20</p>
            <p className="text-sm text-gray-300">MCQs</p>
          </div>

          {/* Timer */}
          <div className="flex w-24 h-24 flex-col items-center bg-gray-800 p-4 pt-3 rounded-lg text-lg font-medium shadow-md">
            <AccessTimeIcon className="text-yellow-400" />
            <p className="text-xl font-semibold mt-1">30</p>
            <p className="text-sm text-gray-300">Minutes</p>
          </div>
        </div>

        {/* Start Button */}
        <div className="mt-6 flex items-center justify-center">
          <motion.button
            onClick={startAssessment}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-br from-blue-600 to-purple-600 text-white px-12 py-3 font-semibold rounded-lg transition-all duration-300 shadow-lg hover:from-purple-500 hover:to-blue-600"
          >
            Start Test
          </motion.button>
        </div>
      </motion.div>

      {/* Footer Text */}
      <div className="text-center text-gray-400 mt-8">
        <p className="text-lg font-medium">
          Improve your skills and track your progress.
        </p>
        <p className="text-sm">Every question takes you closer to mastery!</p>
      </div>
    </div>
  );
}

export default SkillTest;

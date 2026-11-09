import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Courses from "./../components/courses";
import FAQSection from "../components/general/FAQs";
import GetInTouch from "../components/general/getInTouch";
import { CheckCircle, Code, Users, Terminal, Rocket } from "lucide-react";
import { SmartToyOutlined, KeyboardArrowUp } from "@mui/icons-material";
import ChatbotModal from "../components/general/chattingAgent";
import CompanySlider from "../components/general/slider";

import Snowfall from './../animations/snow.js'


import "./homepage.css";
function Homepage() {
  const [showScroll, setShowScroll] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    const checkScrollTop = () => {
      setShowScroll(window.scrollY > 200);
    };
    window.addEventListener("scroll", checkScrollTop);
    return () => window.removeEventListener("scroll", checkScrollTop);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className=" relative bg-gradient-to-b from-gray-900 to-black_A min-h-screen text-white p-20 overflow-hidden">
      {/* Hero Section */}
      <Snowfall></Snowfall>
      <div className="container absolute overflow-hidden top-28"></div>
      <div className=" max-w-5xl mx-auto text-center px-6 p-36 pb-20 z-10">
        <motion.h1
          className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Code. Build. Conquer.
        </motion.h1>
        <motion.p
          className="text-xl leading-relaxed mt-6 text-gray-300 font-sans max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          Welcome to <span className="text-blue-400 font-bold">AlgoMate</span>,
          your hub for mastering technical skills! Explore{" "}
          <span className="text-blue-300 font-medium">
            DSA, full-stack development,
          </span>{" "}
          and{" "}
          <span className="text-blue-300 font-medium">
            technical interview prep
          </span>{" "}
          with engaging content and expert guidance.
        </motion.p>
      </div>

      {/* Features Section */}
      <div className="max-w-5xl mx-auto px-6 mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg  transition-all border border-transparent hover:border-blue-400">
          <Code className="text-blue-400 text-5xl mx-auto" />
          <h3 className="text-2xl font-bold mt-4">Learn & Practice</h3>
          <p className="text-gray-300 mt-2">
            Master DSA, Web Dev, CP, and Core CS subjects with free articles,
            coding sheets, and assessments.
          </p>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg  transition-all border border-transparent hover:border-green-400">
          <CheckCircle className="text-green-400 text-5xl mx-auto" />
          <h3 className="text-2xl font-bold mt-4">Mentor Support</h3>
          <p className="text-gray-300 mt-2">
            Get expert mentorship via chat and doubt-solving sessions to clarify
            concepts.
          </p>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg  transition-all border border-transparent hover:border-purple-400">
          <Users className="text-purple-400 text-5xl mx-auto" />
          <h3 className="text-2xl font-bold mt-4">Job Assistance</h3>
          <p className="text-gray-300 mt-2">
            Access trending job postings, prepare with assessments, and boost
            your hiring chances.
          </p>
        </div>
      </div>

      {/* Additional Section */}
      <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 text-center m-20 mt-8">
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg  transition-all border border-transparent hover:border-yellow-400">
          <Terminal className="text-yellow-400 text-5xl mx-auto" />
          <h3 className="text-2xl font-bold mt-4">Live Coding & Assessments</h3>
          <p className="text-gray-300 mt-2">
            Join live coding contests, solve real-world coding problems, and
            take assessments to track your progress.
          </p>
        </div>
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg  transition-all border border-transparent hover:border-red-400">
          <Rocket className="text-red-400 text-5xl mx-auto" />
          <h3 className="text-2xl font-bold mt-4">Job & Internship Portal</h3>
          <p className="text-gray-300 mt-2">
            Explore trending tech jobs & internships, connect with recruiters,
            and land your dream job with AlgoMate.
          </p>
        </div>
      </div>

      <div className="fixed bottom-5 right-5 flex flex-col justify-center items-center space-y-3">
        {showScroll && (
          <button
            onClick={scrollToTop}
            className="w-10 h-10 flex items-center opacity-50 justify-center bg-gray-700 text-white rounded-md shadow-lg transition-all duration-300 hover:bg-gray-800 hover:scale-105"
          >
            <KeyboardArrowUp className="w-7 h-7" />
          </button>
        )}

        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`w-14 h-14 flex opacity-85 items-center justify-center bg-slate-700 text-white ${
            isChatOpen ? "rounded-md" : "rounded-full"
          } shadow-lg transition-all duration-300 hover:bg-slate-800 hover:scale-90`}
        >
          <SmartToyOutlined className="w-7 h-7" />
        </button>
      </div>
      <ChatbotModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      <Courses />
      <CompanySlider />
      <FAQSection />
      <GetInTouch />
    </div>
  );
}
export default Homepage;

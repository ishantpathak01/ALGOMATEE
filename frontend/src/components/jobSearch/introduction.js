import React from "react";
import { motion } from "framer-motion";

function Introduction() {
  return (
    <div className="m-28 text-center relative">
      {/* Background Glow Effect */}
      <div className="absolute inset-0 flex justify-center items-center -z-10">
        <div className="w-80 h-80 bg-blue-500 opacity-20 blur-3xl rounded-full"></div>
      </div>

      {/* Main Heading */}
      <motion.h1
        className="text-5xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 text-transparent bg-clip-text"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        Explore Your Next Opportunity
      </motion.h1>

      {/* Subheading */}
      <motion.h3
        className="text-lg font-medium text-gray-300 mt-3 max-w-2xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        Find jobs that align with your skills, passion, and career goals. Your
        dream job is just a step away!
      </motion.h3>
    </div>
  );
}

export default Introduction;

import React from "react";
import { motion } from "framer-motion";
function Introduction() {
  return (
    <div className="text-center m-20 relative">
      <motion.h1
        className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 glow-text"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        Coding Sheet
      </motion.h1>

      <motion.p
        className="text-gray-400 mt-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
      >
        Practice curated coding questions and level up your DSA skills 🚀
      </motion.p>
    </div>
  );
}

export default Introduction;

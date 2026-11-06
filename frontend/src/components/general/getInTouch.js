import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const GetInTouch = () => {
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });

  useEffect(() => {
    const updateCursor = (e) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", updateCursor);
    return () => window.removeEventListener("mousemove", updateCursor);
  }, []);

  return (
    <motion.div
      className="relative bg-gray-900 text-white p-10 m-20 bg-opacity-20 rounded-2xl shadow-lg max-w-5xl mx-auto text-center border border-gray-700 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      {/* Cursor Blur Effect */}
      <motion.div
        className="absolute w-32 h-32 bg-blue-500 opacity-30 rounded-full blur-3xl pointer-events-none"
        style={{
          top: cursorPos.y - 340,
          left: cursorPos.x - 240,
          transform: "translate(-50%, -50%)",
        }}
        transition={{ type: "tween", ease: "linear", duration: 0.1 }}
      />

      {/* Floating Profile Images */}
      <div className="flex justify-center -space-x-3 mb-4">
        {["men/45", "women/46", "women/47"].map((img, i) => (
          <motion.img
            key={i}
            src={`https://randomuser.me/api/portraits/${img}.jpg`}
            alt={`user${i}`}
            className="w-10 h-10 rounded-full border-2 border-gray-600"
            initial={{ y: -5 }}
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      <h2 className="text-xl font-semibold">Still have questions?</h2>
      <p className="text-gray-400 mt-2">
        Can’t find the answer you’re looking for? Please chat with our friendly
        team.
      </p>

      {/* Animated Button */}
      <Link to="/contactUs">
        <motion.button
          className="mt-5 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-500 transition-all relative"
          whileHover={{ scale: 1.05 }}
        >
          Get in Touch
        </motion.button>
      </Link>
    </motion.div>
  );
};

export default GetInTouch;

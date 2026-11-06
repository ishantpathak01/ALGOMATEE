import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import BG_IMG from "./../../assets/Illustrations/banner03.svg";
// Animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  hover: { scale: 1.03, boxShadow: "0px 4px 20px rgba(147, 51, 234, 0.1)" },
};

const buttonVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.95 },
};

function Card({ image, topic, info, id }) {
  const navigate = useNavigate();
  const handleClick = () => navigate(`/course/${id}`);

  return (
    <motion.div
      className="relative w-72 h-[440px] bg-gray-900 bg-opacity-80 backdrop-blur-md rounded-xl overflow-hidden shadow-lg border border-gray-800/100 flex flex-col justify-between transform-gpu transition-all duration-300 hover:shadow-purple-500/40 hover:border-purple-500/40"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
    >
      {/* Image Section with shimmer effect */}
      <div
        className="w-full h-40 flex items-center justify-center overflow-hidden relative"
        style={{
          background: `url(${BG_IMG}) no-repeat center center`,
          backgroundSize: "cover",
          position: "relative",
        }}
      >
        {image ? (
          <motion.img
            src={image}
            alt={topic}
            className="w-20 h-20 object-cover transition-transform duration-300 hover:scale-105 rounded-lg"
            initial={{ opacity: 0.3 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-white text-2xl font-semibold">
            {topic[0]}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900 opacity-50" />
      </div>

      {/* Content Section */}
      <div className="p-4 flex flex-col flex-grow">
        <h2 className="text-xl font-semibold text-white text-center border-b border-gray-600/40 pb-2 mb-3 tracking-tight">
          {topic}
        </h2>
        <div className="text-gray-300 text-sm leading-relaxed line-clamp-5">
          {Array.isArray(info) ? (
            info.slice(0, 2).map((item, index) => (
              <p key={index} className="mb-2 text-sm">
                {item}
              </p>
            ))
          ) : (
            <p>{info}</p>
          )}
        </div>
      </div>

      {/* Button Section with glowing effect */}
      <div className="px-5 pb-5">
        <motion.button
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg shadow-md transition-all duration-200"
          onClick={handleClick}
          variants={buttonVariants}
          initial="rest"
          whileHover="hover"
          whileTap="tap"
        >
          View Details
        </motion.button>
      </div>
    </motion.div>
  );
}

export default Card;

import React from "react";
import HEADER_BG_SVG from "./../../assets/Illustrations/header2.svg";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

function Header({
  setSearchText,
  selectedTag,
  setSelectedTag,
  solvedFilter,
  setSolvedFilter,
}) {
  return (
    <div>
      <div
        className="w-full h-[75px] bg-gray-800 p-4 rounded-xl shadow-[#0c1624] shadow-lg flex justify-between items-center"
        style={{
          backgroundImage: `url(${HEADER_BG_SVG})`,
          backgroundSize: "auto",
          backgroundPosition: "center",
        }}
      >
        <div className="flex items-center gap-3">
          <div className="relative w-80 h-16 flex justify-center items-center">
            <input
              type="text"
              placeholder="Search questions..."
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full p-2 rounded-md bg-gray-700 text-white outline-none pl-10 focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <Search className="absolute left-3 top-6 text-gray-400" size={16} />
          </div>

          <div className="relative flex justify-center ml-40 w-56 p-0.5 bg-gray-800 rounded-full shadow-md border border-gray-600">
            <motion.div
              initial={{ x: 0 }}
              animate={{ x: solvedFilter === false ? "100%" : "0%" }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className={`absolute top-0 left-0 w-1/2 h-full ${
                solvedFilter != null &&
                (solvedFilter == true ? "bg-blue-500" : "bg-purple-500")
              } rounded-full`}
            />

            <button
              className={`relative z-10 flex-1 px-4 py-2 tracking-wider text-white text-sm font-semibold rounded-full transition-all duration-300 ${
                solvedFilter === true ? "text-white" : "text-gray-300"
              }`}
              onClick={() => setSolvedFilter(true)}
            >
              Solved
            </button>

            <button
              className={`relative z-10 flex-1 px-4 py-2 tracking-wider text-white text-sm font-semibold rounded-full transition-all duration-300 ${
                solvedFilter === false ? "text-white" : "text-gray-300"
              }`}
              onClick={() => setSolvedFilter(false)}
            >
              Unsolved
            </button>
          </div>
        </div>

        {/* Animated Selected Tag */}
        {selectedTag && (
          <button
            onClick={() => setSelectedTag("")}
            className="text-white bg-gradient-to-r from-blue-600 to-purple-600 px-3 py-1 rounded-md text-sm font-medium animate-fade-in animate-scale-up"
          >
            {selectedTag}
          </button>
        )}
      </div>
    </div>
  );
}

export default Header;

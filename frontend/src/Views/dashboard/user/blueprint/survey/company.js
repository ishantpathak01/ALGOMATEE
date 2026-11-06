import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Business as BusinessIcon,
  Search as SearchIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";

const COMPANIES = [
  { name: "Google", logo: "G", color: "bg-blue-500" },
  { name: "Amazon", logo: "A", color: "bg-orange-500" },
  { name: "Microsoft", logo: "M", color: "bg-green-500" },
  { name: "Meta", logo: "M", color: "bg-blue-600" },
  { name: "Apple", logo: "A", color: "bg-gray-600" },
  { name: "Netflix", logo: "N", color: "bg-red-500" },
  { name: "Uber", logo: "U", color: "bg-black" },
  { name: "Airbnb", logo: "A", color: "bg-rose-500" },
  { name: "Twitter", logo: "X", color: "bg-black" },
  { name: "LinkedIn", logo: "L", color: "bg-blue-400" },
  { name: "Adobe", logo: "A", color: "bg-red-400" },
  { name: "Intel", logo: "I", color: "bg-blue-300" },
  { name: "Nvidia", logo: "N", color: "bg-green-400" },
  { name: "Tesla", logo: "T", color: "bg-red-500" },
  { name: "Oracle", logo: "O", color: "bg-red-600" },
  { name: "Salesforce", logo: "S", color: "bg-blue-300" },

  { name: "Nvidia", logo: "N", color: "bg-green-400" },
  { name: "Tesla", logo: "T", color: "bg-red-500" },
  { name: "Oracle", logo: "O", color: "bg-red-600" },
  { name: "Salesforce", logo: "S", color: "bg-blue-300" },
  { name: "Nvidia", logo: "N", color: "bg-green-400" },
  { name: "Tesla", logo: "T", color: "bg-red-500" },
  { name: "Oracle", logo: "O", color: "bg-red-600" },
  { name: "Salesforce", logo: "S", color: "bg-blue-300" },
  { name: "Nvidia", logo: "N", color: "bg-green-400" },
  { name: "Tesla", logo: "T", color: "bg-red-500" },
  { name: "Nvidia", logo: "N", color: "bg-green-400" },
];

const Part1 = ({ formData, handleSelect }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const filteredCompanies = COMPANIES.filter((company) =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleScroll = (direction) => {
    if (containerRef.current) {
      const scrollAmount = 400;
      containerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });

      // Update arrow visibility after scroll completes
      setTimeout(() => {
        if (containerRef.current) {
          const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
          setShowLeftArrow(scrollLeft > 0);
          setShowRightArrow(scrollLeft < scrollWidth - clientWidth);
        }
      }, 300);
    }
  };

  const checkScrollPosition = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        <BusinessIcon className="text-blue-400" />
        Target Company
      </h2>
      <p className="text-gray-300">
        Which company's interview are you preparing for?
      </p>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon className="text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Search companies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="relative">
        <div
          ref={containerRef}
          className="flex flex-row flex-wrap items-center justify-center max-h-96 overflow-y-auto custom-scrollbar"
          onScroll={checkScrollPosition}
        >
          {filteredCompanies.map((company) => (
            <motion.button
              key={company.name}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.95 }}
              className={`flex flex-col w-28 h-28 m-3 items-center p-3 rounded-xl border-2 ${
                formData.company === company.name
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-gray-700 hover:border-gray-600"
              }`}
              onClick={() => handleSelect("company", company.name)}
              type="button"
            >
              <div
                className={`${company.color} w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-bold mb-2`}
              >
                {company.logo}
              </div>
              <span className="text-white text-sm text-center">
                {company.name}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Selection Indicator */}
      {formData.company && (
        <div className="text-center text-blue-400 text-sm">
          Selected: <span className="font-medium">{formData.company}</span>
        </div>
      )}
    </div>
  );
};

export default Part1;

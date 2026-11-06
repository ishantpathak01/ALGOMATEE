import React from "react";
import DangerousOutlinedIcon from "@mui/icons-material/DangerousOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ScreenshotMonitorOutlinedIcon from "@mui/icons-material/ScreenshotMonitorOutlined";
const Sidebar = ({ count, current, setCurrent }) => {
  return (
    <div className="w-80 mt-16 h-[91vh] bg-white shadow-md flex flex-col p-5 border-l">
      {/* Assessment Name */}
      <h2 className="text-xl border-b-2 pb-2 font-bold text-gray-800 mb-4 text-center mt-10">
        DSA Skill Test
      </h2>

      {/* Questions Grid */}
      <div className="flex flex-row flex-wrap justify-center space-x-4 items-center max-h-80 overflow-y-auto">
        {Array.from({ length: count }, (_, index) => {
          const num = index + 1;
          return (
            <button
              key={num}
              onClick={() => setCurrent(num)}
              className={`w-10 h-10 flex items-center justify-center rounded-lg text-lg font-semibold transition-all duration-300 
                ${
                  current === num
                    ? "bg-blue-600 text-white shadow-lg ring-2 ring-blue-300"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200 active:bg-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-blue-400 border border-gray-300`}
            >
              {num}
            </button>
          );
        })}
      </div>

      {/* Instructions */}
      <div className="mt-auto border-t border-gray-300 pt-3 space-y-2">
        <p className="text-sm text-gray-700 flex items-center gap-2">
          <ErrorOutlineIcon className="text-red-500" /> Refreshing this page
          will erase all progress.
        </p>
        <p className="text-sm text-gray-700 flex items-center gap-2">
          <ScreenshotMonitorOutlinedIcon className="text-yellow-500" /> Exiting
          full-screen mode will reduce 5 minutes from your time.
        </p>
        <p className="text-sm text-gray-700 flex items-center gap-2">
          <DangerousOutlinedIcon className="text-blue-500" /> Copy-paste is
          disabled to ensure a fair test.
        </p>
      </div>
    </div>
  );
};

export default Sidebar;

import React from "react";
import { useNavigate } from "react-router-dom";
import { getArticle } from "./../../APIs/mentor";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
const Card = ({ data }) => {
  const navigate = useNavigate();

  const handleClick = async () => {
    const res = await getArticle({ Id: data.id });
    if (res.status === 200) {
      navigate(`${data.id}/documentation`, { state: { data: res.data } });
    }
  };

  const readTime = Math.max(Math.ceil((data?.words || 0) / 200), 1);

  return (
    <div
      className="relative backdrop-blur-lg bg-slate-800/20 border border-white/20 text-white w-10/12 p-6 h-auto rounded-xl shadow-md transition duration-300 m-4 
      hover:bg-slate-900/30 hover:border-white/40 hover:shadow-2xl"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-xl pointer-events-none"></div>

      <h1 className="text-2xl font-bold relative">{data.name}</h1>
      <p className="mt-2 text-sm text-gray-200 relative ml-4 mr-4">
        {data.description}
      </p>

      {/* 🚀 Bottom Section (Read Time + Button) */}
      <div className="flex justify-between items-center m-4 mb-0">
        {/* 📖 Read Time on Left */}
        <div className="flex flex-row justify-center items-center space-x-4 text-slate-300 ml-2">
          <div className="flex flex-row justify-center items-center space-x-1">
            <PersonOutlineOutlinedIcon fontSize={"small"} />
            <p className="text-xs text-gray-300">
              {data?.authorName || "Anonymous user"}
            </p>
          </div>
          <p>|</p>
          <div className="flex flex-row justify-center items-center space-x-1">
            <TimerOutlinedIcon fontSize={"small"} />
            <p className="text-xs text-gray-300">{readTime} min read</p>
          </div>
        </div>

        {/* 🚀 Modern Button */}
        <button
          onClick={handleClick}
          className="group flex items-center gap-3 px-5 py-2 rounded-md text-sm font-medium transition-all duration-300
          bg-slate-900/10 backdrop-blur-md border border-white/20 text-white shadow-lg
          hover:bg-blue-800/20 hover:border-white/40 hover:shadow-xl hover:scale-105"
        >
          <MenuBookIcon fontSize="small" className="opacity-80" />
          <span className="font-semibold">Explore</span>
          <ArrowForwardIcon fontSize="small" className="opacity-80" />
        </button>
      </div>
    </div>
  );
};

export default Card;

import React from "react";
import { motion, useAnimation } from "framer-motion";
import "./card.css";
import RoomOutlinedIcon from "@mui/icons-material/RoomOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import HomeWorkOutlinedIcon from "@mui/icons-material/HomeWorkOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";

function Card({ data }) {
  const controls = useAnimation();
  const handleInView = (inView) => {
    if (inView) {
      controls.start({ opacity: 1, y: 0 });
    } else {
      controls.start({ opacity: 0, y: 50 });
    }
  };

  return (
    <motion.div
      className="bg-slate-400 text-slate-950 m-4 bg-opacity-90 p-8 flex flex-row justify-between items-center rounded-md shadow-sm"
      animate={controls}
      initial={{ opacity: 0, y: 50 }}
      transition={{ duration: 0.5 }}
      onViewportEnter={handleInView}
    >
      <div className="flex flex-col">
        <div>
          <h1 className="text-lg p-1 font-semibold">{data.Position}</h1>
          <h1 className="ml-2 p-1 font-serif">{data.Company}</h1>
        </div>
        <div className="flex flex-row mt-1 text-sm opacity-80">
          <h3 className="p-2 pt-0 flex flex-row justify-center items-center space-x-1">
            <p>
              <WorkOutlineOutlinedIcon fontSize="small"></WorkOutlineOutlinedIcon>
            </p>
            <p className="mt-1">{data.Experience}</p>
          </h3>
          |
          <h3 className="p-2 pt-0 flex flex-row justify-center items-center space-x-1">
            <p>
              <RoomOutlinedIcon fontSize="small"></RoomOutlinedIcon>
            </p>
            <p className="mt-1">{data.Location}</p>
          </h3>
          |
          <h3 className="p-2 pt-0 flex flex-row justify-center items-center space-x-1">
            <p>
              <HomeWorkOutlinedIcon fontSize="small"></HomeWorkOutlinedIcon>
            </p>
            <p className="mt-1">{data.Type}</p>
          </h3>
          |
          <h3 className="p-2 pt-0 flex flex-row justify-center items-center space-x-1">
            <p>
              <PaymentsOutlinedIcon fontSize="small"></PaymentsOutlinedIcon>
            </p>
            <p className="mt-1">{data.Salary}</p>
          </h3>
        </div>
      </div>
      <div className="mr-4 ml-4">
        <a className="button" href={data.ApplyLink} target="_blank">
          Apply Now
        </a>
      </div>
    </motion.div>
  );
}

export default Card;

import React, { useState } from "react";
import { motion } from "framer-motion";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import { useAppContext } from "../../context/userContext";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { requestDoubt } from "./../../APIs/user";
import ConfirmationModal from "./confirmationModel";

function Form({ data }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [userMessage, setUserMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [confirmationModel,setConfirmationModel] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAppContext();

  const getDayName = (date) => {
    const days = ["Sun", "Mon", "Tues", "Wed", "Thu", "Fri", "Sat"];
    return days[new Date(date).getDay()];
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setAvailableSlots(data.Availability[date]);
    setSelectedSlot(null);
  };

  const getMonthName = (monthNumber) => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sept",
      "Oct",
      "Nov",
      "Dec",
    ];
    return months[monthNumber - 1];
  };

  const handleSubmit = async () => {
    setConfirmationModel(false);
    if (!user) {
      navigate("/auth/user", { state: { redirect: location.pathname } });
      return;
    }

    if (user.Type === "Mentor") {
      navigate("/auth/user", { state: { redirect: location.pathname } });
      return;
    }

    if (!userMessage.trim()) {
      toast.error("Please enter a question or doubt before submitting.");
      return;
    }

    setIsSubmitting(true);

    let res = await requestDoubt({
      Id: user?._id,
      UserId: user?._id,
      Name: user?.Name,
      MentorId: data?._id,
      Date: selectedDate,
      Slot: selectedSlot,
      Message: userMessage,
    });

    if (res.status === 200) {
      toast.success(res.message);
      setTimeout(() => navigate("/mentorSearch"), 1000);
    } else {
      toast.error(res.message);
    }

    setIsSubmitting(false);
  };

  return (
    <motion.div
      className="bg-gradient-to-b from-gray-900 to-black_A text-white w-full m-10 rounded-3xl p-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-center text-xl mb-4 font-semibold">
        Available Dates -
      </h2>

      <motion.div
        className="flex mb-4 space-x-10 justify-center overflow-x-scroll"
        style={{ scrollbarWidth: "none" }}
        initial={{ x: "100vw" }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 25 }}
      >
        {Object.keys(data?.Availability || {}).map((date) => (
          <motion.button
            key={date}
            className={`px-4 py-3 font-semibold text-xsm rounded text-slate-900 ${
              selectedDate === date ? "bg-slate-400" : "bg-gray-200"
            }`}
            onClick={() => handleDateChange(date)}
            whileTap={{ scale: 0.95 }}
          >
            <p>{getDayName(date)}</p>
            <p>
              {date.substring(8)} {getMonthName(parseInt(date.substring(5, 7)))}
            </p>
          </motion.button>
        ))}
      </motion.div>

      {selectedDate && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div
            className="flex justify-center overflow-x-scroll mt-4"
            style={{ scrollbarWidth: "none" }}
            initial={{ y: "-40px" }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 50 }}
          >
            {availableSlots.map((slot, i) => (
              <motion.button
                key={i}
                className={`text-sm font-sans m-2 ${
                  selectedSlot === slot ? "bg-slate-400" : "bg-gray-200"
                } px-6 tracking-wider rounded-md py-2 font-semibold w-min mx-2 text-slate-900`}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedSlot(slot)}
              >
                {slot}
              </motion.button>
            ))}
          </motion.div>
        </motion.div>
      )}

      <motion.div
        className="flex justify-center mt-8"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <textarea
          className="w-4/5 h-40 text-slate-900 rounded-lg focus:outline-none bg-slate-200 text-lg pl-4 pt-2"
          placeholder="What doubts or questions do you have?"
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
        ></textarea>
      </motion.div>

      <motion.div
        className="flex justify-center mt-6"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <motion.button
          className={`bg-gradient-to-r from-purple-600 to-blue-800 hover:from-blue-800 hover:to-purple-600 text-white font-semibold px-6 py-3 rounded-md shadow-lg flex flex-row space-x-2 ${
            !selectedDate ||
            !selectedSlot ||
            !userMessage.trim() ||
            isSubmitting
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
          disabled={
            !selectedDate ||
            !selectedSlot ||
            !userMessage.trim() ||
            isSubmitting
          }
          whileHover={!isSubmitting ? { scale: 1.1 } : {}}
          whileTap={!isSubmitting ? { scale: 0.95 } : {}}
          onClick={()=>setConfirmationModel(true)}
        >
          <h2>Ask Doubt</h2>
          <TaskAltRoundedIcon />
        </motion.button>
        {confirmationModel && <ConfirmationModal onConfirm={handleSubmit} open={true} onClose={()=>setConfirmationModel(false)}></ConfirmationModal>}
      </motion.div>
    </motion.div>
  );
}

export default Form;

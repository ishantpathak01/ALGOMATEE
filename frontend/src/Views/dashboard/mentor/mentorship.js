import React, { useState } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import BookmarkBorderOutlinedIcon from "@mui/icons-material/BookmarkBorderOutlined";
import DateRangeOutlinedIcon from "@mui/icons-material/DateRangeOutlined";
import QueryBuilderOutlinedIcon from "@mui/icons-material/QueryBuilderOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import DangerousOutlinedIcon from "@mui/icons-material/DangerousOutlined";
import dayjs from "dayjs";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  updateSlots,
  acceptDoubtRequest,
  rejectDoubtRequest,
  refreshRequest,
} from "./../../../APIs/mentor";
import { useAppContext } from "../../../context/userContext";
import toast from "react-hot-toast";
import { Rating } from "@mui/material";

function Mentorship() {
  const [view, setView] = useState(true);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [showInput, setShowInput] = useState(false);
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);
  const [period, setPeriod] = useState("AM");
  const { user, setUser } = useAppContext();
  const [slots, setMySlots] = useState(user?.Availability || {});

  const addSlot = () => {
    if (
      minute > 60 ||
      minute < 0 ||
      hour > 12 ||
      hour < 0 ||
      (period != "AM" && period != "PM")
    ) {
      toast.error("Slot timings is not correct");
      return;
    }
    if (minute % 30 == 0) {
      const formattedTime = `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")} ${period}`;
      const formattedDate = dayjs(selectedDate).format("YYYY-MM-DD");
      if (!slots[formattedDate]?.includes(formattedTime)) {
        setMySlots((prevSlots) => ({
          ...prevSlots,
          [formattedDate]: [...(prevSlots[formattedDate] || []), formattedTime],
        }));
        setShowInput(false);
      } else {
        toast.error("Time slots already exist");
      }
    } else {
      toast.error("Time slots should contains difference of 30 minutes.");
    }
  };

  const handleUpdate = async () => {
    let res = await updateSlots({
      Id: user?._id,
      Slots: slots,
    });
    if (res.status == 200) {
      toast.success(res.message);
      setTimeout(() => {
        setUser({ ...user, Availability: slots });
      }, 1000);
    } else {
      toast.error(res.message);
    }
  };

  const handleAccept = async (key) => {
    let res = await acceptDoubtRequest({
      Id: user?._id,
      doubtId: key,
    });
    if (res.status === 200) {
      toast.success(res.message);
      setTimeout(() => {
        setUser(res.mentor);
      }, 500);
    } else {
      toast.error(res.message);
    }
  };

  const handleReject = async (key) => {
    let res = await rejectDoubtRequest({
      Id: user?._id,
      doubtId: key,
    });

    if (res.status === 200) {
      toast.success(res.message);
      setTimeout(() => {
        setUser(res.mentor);
      }, 500);
    } else {
      toast.error(res.message);
    }
  };

  const handleRefreshRequests = async () => {
    let res = await refreshRequest(user._id);
    if (res.status === 200) {
      toast.success(res.message);
      setUser(res.mentor);
    } else {
      toast.error(res.message);
    }
  };

  if (!user.Verified) {
    return (
      <div className="min-h-screen text-white text-lg opacity-50 flex justify-center items-center flex-col space-y-2">
        <h1>Your request has not been approved by the manager yet.</h1>
        <h1>Please contact the managers as soon as possible to proceed.</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div>
        <div className="flex flex-row justify-around text-white mb-10 border-b-2">
          <button
            onClick={() => setView(true)}
            className={`w-1/2 ${
              view ? "bg-slate-400" : "bg-transparent"
            } pt-4 pb-4 border-r-2 bg-opacity-15`}
          >
            Manage Slots
          </button>
          <button
            onClick={() => setView(false)}
            className={`w-1/2 ${
              !view ? "bg-slate-400" : "bg-transparent"
            } pt-4 pb-4 border-r-2 bg-opacity-15`}
          >
            Doubt Requests
          </button>
        </div>
        {view ? (
          <div>
            <div className="relative">
              <button
                onClick={handleUpdate}
                className="absolute right-20 w-36 flex flex-row items-center justify-center space-x-3 border focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 border-slate-500 text-slate-500 hover:text-white hover:bg-slate-800 focus:ring-slate-500"
              >
                <h2>Update</h2>
                <BookmarkBorderOutlinedIcon />
              </button>
            </div>
            <div className="flex flex-row justify-around items-center h-120">
              <div className="text-white bg-black_B w-min rounded-xl p-2">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateCalendar
                    sx={{
                      color: "white",
                      "& .MuiPickersDay-root": { color: "white" },
                      "& .MuiTypography-root": { color: "white" },
                      "& .MuiSvgIcon-root": { color: "white" },
                      "& .MuiPickersYear-yearButton": { color: "white" },
                    }}
                    value={selectedDate}
                    onChange={(newValue) => setSelectedDate(newValue)}
                    shouldDisableDate={(date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return date < today;
                    }}
                  />
                </LocalizationProvider>
              </div>
              <div className="w-1/2 bg-black_B h-96 p-4 rounded-xl text-white flex flex-col items-center overflow-y-scroll custom-scrollbar">
                <h1 className="text-center text-xl font-semibold w-full border-b-2 pb-3 mb-2">
                  {dayjs(selectedDate).format("DD-MM-YYYY")}
                </h1>
                <div className="flex flex-row flex-wrap w-full">
                  <div
                    onClick={() => setShowInput(true)}
                    className="relative w-28 h-14 flex justify-center items-center rounded-md p-3 bg-slate-400 hover:bg-gradient-to-br hover:from-purple-500 hover:to-blue-600 hover:scale-95 transition-all bg-opacity-40 cursor-pointer m-3 group"
                  >
                    <h2 className="group-hover:hidden block"> Add New</h2>
                    <h2 className="absolute hidden group-hover:block">
                      <AddCircleOutlineOutlinedIcon fontSize="large" />
                    </h2>
                  </div>
                  {slots[dayjs(selectedDate).format("YYYY-MM-DD")]?.map(
                    (slot) => (
                      <div
                        key={slot}
                        onClick={() => {
                          const formattedDate =
                            dayjs(selectedDate).format("YYYY-MM-DD");
                          setMySlots((prevSlots) => ({
                            ...prevSlots,
                            [formattedDate]:
                              prevSlots[formattedDate]?.filter(
                                (s) => s !== slot
                              ) || [],
                          }));
                        }}
                        className="relative w-28 h-14 flex justify-center items-center p-3 rounded-md bg-slate-400 hover:bg-gradient-to-br hover:from-purple-500 hover:to-blue-600 hover:scale-95 transition-all bg-opacity-40 cursor-pointer m-3 group"
                      >
                        <h2 className="group-hover:hidden block">{slot}</h2>
                        <h2 className="absolute hidden group-hover:block">
                          <CancelOutlinedIcon fontSize="large" />
                        </h2>
                      </div>
                    )
                  )}
                </div>
                {showInput && (
                  <div className="flex flex-col items-center mt-4 bg-slate-400 bg-opacity-25 p-4 rounded-md w-min">
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        min="1"
                        max="12"
                        value={hour}
                        onChange={(e) => setHour(e.target.value)}
                        className="w-12 p-1 rounded-md bg-transparent border-2 focus:outline-none"
                      />
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={minute}
                        onChange={(e) => setMinute(e.target.value)}
                        className="w-12 p-1  rounded-md bg-transparent border-2 focus:outline-none"
                      />
                      <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="p-1  rounded-md bg-transparent border-2 focus:outline-none"
                      >
                        <option value="AM" className="text-slate-900">
                          AM
                        </option>
                        <option value="PM" className="text-slate-900">
                          PM
                        </option>
                      </select>
                    </div>
                    <button
                      onClick={addSlot}
                      className="mt-4 p-2 px-3 bg-gradient-to-br from-red-500 shadow-md hover:scale-95 text-xsm shadow-slate-800 to-blue-600 rounded"
                    >
                      Add Slot
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="relative">
              <button
                onClick={handleRefreshRequests}
                className="absolute right-20 w-36 flex flex-row items-center justify-center space-x-3 border focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 border-slate-500 text-slate-500 hover:text-white hover:bg-slate-800 focus:ring-slate-500"
              >
                <h2>Refresh</h2>
                <RefreshIcon />
              </button>
            </div>
            <div className="flex flex-row w-full pt-10">
              <div className="flex flex-col items-center w-2/3 bg-slate-400 bg-opacity-10 m-8 rounded-lg h-screen overflow-y-scroll custom-scrollbar border-4 border-slate-400 border-opacity-5">
                <h1 className="text-center text-2xl font-semibold p-6 w-4/5 font-serif  mb-2 border-b-2  pb-2 text-white text-opacity-80">
                  Pending Requests
                </h1>
                {user?.Doubts.length != 0 ? (
                  <div className="w-full flex flex-col justify-center items-center">
                    {user?.Doubts?.slice()
                      .reverse()
                      .map((doubt) => (
                        <div className="flex flex-row justify-between w-4/5 bg-slate-400 pl-6 bg-opacity-30 text-white rounded-lg m-4 mr-2 p-4">
                          <div className=" flex flex-col w-full ">
                            <h2 className="text-xl font-semibold">
                              {doubt?.Name}
                            </h2>
                            <div className="flex  flex-row space-x-3 font-serif m-2">
                              <h2 className="mr-2 flex flex-row justify-center items-center space-x-1">
                                <DateRangeOutlinedIcon></DateRangeOutlinedIcon>
                                <p>{doubt?.Date}</p>
                              </h2>
                              |
                              <h2 className="flex flex-row justify-center items-center space-x-1">
                                <QueryBuilderOutlinedIcon></QueryBuilderOutlinedIcon>
                                <p>{doubt?.Slot}</p>
                              </h2>
                            </div>
                            <h2 className="font-sans w-4/5 ml-6 mt-4 text-wrap">
                              {doubt?.Message}
                            </h2>
                          </div>
                          <div className="flex flex-col justify-center m-2">
                            <button
                              onClick={() => handleReject(doubt.Key)}
                              className="bg-gradient-to-br from-red-500 to-orange-400 shadow-lg p-2 m-2 px-6 rounded hover:scale-95 transition-all flex flex-row space-x-1 justify-center items-center "
                            >
                              <DangerousOutlinedIcon></DangerousOutlinedIcon>
                              <p>Reject</p>
                            </button>
                            <button
                              onClick={() => handleAccept(doubt.Key)}
                              className="bg-gradient-to-br from-green-500 to-blue-400 shadow-lg p-2 m-2 px-6 rounded hover:scale-95 transition-all flex flex-row space-x-1 justify-center items-center "
                            >
                              <CheckCircleOutlineOutlinedIcon></CheckCircleOutlineOutlinedIcon>
                              <p>Accept</p>
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <h2 className="text-slate-400 text-opacity-45 mt-40 text-lg font-serif tracking-wider">
                    No pending requests.
                  </h2>
                )}
              </div>
              <div className="flex flex-col items-center w-1/3 bg-slate-400 bg-opacity-10 m-8 ml-2 rounded-lg h-screen overflow-y-scroll custom-scrollbar border-4 border-slate-400 border-opacity-5">
                <h1 className="text-center text-2xl font-semibold font-serif mt-6  mb-2 border-b-2 w-4/5 pb-2 text-white text-opacity-80">
                  Accepted Requests
                </h1>
                {user?.AcceptedDoubts.length != 0 ? (
                  <div>
                    {user?.AcceptedDoubts?.slice()
                      .reverse()
                      .map((doubt) => (
                        <div
                          className={`flex flex-col justify-between ${
                            doubt.Rating ? "bg-blue-300" : "bg-pink-200"
                          } bg-opacity-30 text-white rounded-lg m-4 p-4`}
                        >
                          <h2 className="text-xl font-semibold">
                            {doubt?.Name}
                          </h2>
                          <div className="flex flex-row space-x-3 w-60 font-serif m-2">
                            <h2 className="mr-2 flex flex-row justify-center items-center space-x-1">
                              <DateRangeOutlinedIcon></DateRangeOutlinedIcon>
                              <p>{doubt?.Date}</p>
                            </h2>
                            |
                            <h2 className="flex flex-row justify-center items-center space-x-1">
                              <QueryBuilderOutlinedIcon></QueryBuilderOutlinedIcon>
                              <p>{doubt?.Slot}</p>
                            </h2>
                          </div>
                          <div className="flex justify-center items-center\">
                            {doubt.Rating && (
                              <Rating
                                name="half-rating-read"
                                defaultValue={doubt.Rating}
                                precision={0.5}
                                readOnly
                              />
                            )}
                          </div>
                          <h2 className="font-sans mt-2 text-wrap text-center">
                            {doubt?.Message}
                          </h2>
                        </div>
                      ))}
                  </div>
                ) : (
                  <h2 className="text-slate-400 text-opacity-45 mt-40 text-lg font-serif tracking-wider">
                    No accepted requests.
                  </h2>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Mentorship;

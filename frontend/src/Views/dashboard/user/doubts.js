import React, { useState } from "react";
import { useAppContext } from "../../../context/userContext";
import { submitDoubtRating } from "./../../../APIs/user";
import AccessAlarmsIcon from "@mui/icons-material/AccessAlarms";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { Rating } from "@mui/material";
import toast from "react-hot-toast";
function Doubts() {
  const [view, setView] = useState("Pending");
  const { setUser, user } = useAppContext();
  const [ratingBox, setRatingBox] = useState("");
  const [rating, setRating] = useState(0);

  const parseDoubtTime = (date, time) => {
    if (!date || !time) return null;

    const [timePart, meridian] = time.split(" ");
    let [hours, minutes] = timePart.split(":").map(Number);

    if (meridian === "PM" && hours !== 12) hours += 12;
    if (meridian === "AM" && hours === 12) hours = 0;

    return new Date(
      `${date}T${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:00Z`
    );
  };

  const currentTime = new Date();

  const filteredDoubts = user.Doubts.filter((doubt) => {
    const doubtTime = parseDoubtTime(doubt.Date, doubt.Slot);
    const isExpired =
      currentTime.getTime() >= doubtTime.getTime() + 30 * 60 * 1000;
    if (view === "Solved") return doubt.Status === "Accepted" && isExpired;
    if (view === "Accepted") return doubt.Status === "Accepted" && !isExpired;
    return doubt.Status === view;
  });

  const submitRating = async (id) => {
    try {
      if (rating <= 0 || rating > 5) {
        toast.error("Please give a valid feedback.");
        return;
      }
      const res = await submitDoubtRating({
        Id: user?._id,
        DoubtId: id,
        Rating: rating,
      });

      if (res.status === 200) {
        toast.success("Thank you for your response.");
        toast.success(res.message);
        setUser((prevUser) => ({
          ...prevUser,
          Doubts: prevUser.Doubts.map((doubt) =>
            doubt._id === id ? { ...doubt, Rating: rating } : doubt
          ),
        }));
        setRatingBox((prev) => ({ ...prev, [id]: false }));
        setRating(0);
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error("Something went wrong.");
    }
  };

  return (
    <div className="text-white min-h-screen flex flex-col items-center p-6">
      <h1 className="text-3xl font-semibold text-center border-b-2 border-slate-700 pb-3 w-full mb-8">
        My Doubts
      </h1>

      <div className="flex space-x-2 mb-6 bg-gray-800 p-1 rounded-lg">
        {["Pending", "Accepted", "Rejected", "Solved"].map((status) => (
          <button
            key={status}
            onClick={() => setView(status)}
            className={`px-6 py-2 rounded-md transition-all duration-300 flex-1 text-center text-lg font-medium
              ${
                view === status
                  ? status === "Pending"
                    ? "bg-yellow-500 text-black"
                    : status === "Accepted"
                    ? "bg-green-500 text-white"
                    : status === "Rejected"
                    ? "bg-red-500 text-white"
                    : "bg-blue-500 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="w-full max-w-4xl flex flex-col space-y-4">
        {filteredDoubts.length === 0 ? (
          <p className="text-center text-gray-400 text-lg py-20">
            No {view.toLowerCase()} doubts found.
          </p>
        ) : (
          filteredDoubts
            .slice()
            .reverse()
            .map((doubt, index) => (
              <div
                key={index}
                className={`p-5 rounded-lg shadow-lg transition-all duration-300 
                ${
                  view === "Pending"
                    ? "bg-yellow-200 bg-opacity-20"
                    : view === "Accepted"
                    ? "bg-green-200 bg-opacity-20"
                    : view === "Rejected"
                    ? "bg-red-300 bg-opacity-20 "
                    : "bg-blue-200 bg-opacity-20"
                }`}
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold">
                    Mentor: {doubt.Name}
                  </h2>
                  <div className="flex space-x-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <CalendarMonthIcon />
                      <span>{doubt.Date}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <AccessAlarmsIcon />
                      <span>{doubt.Slot}</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between flex-row items-start">
                  <p
                    className={`mt-4 italic border-l-4 pl-4 ${
                      view == "Pending"
                        ? "border-yellow-500"
                        : view == "Accepted"
                        ? "border-green-500"
                        : view == "Rejected"
                        ? "border-red-400"
                        : "border-blue-500"
                    }  w-3/4
                `}
                  >
                    "{doubt.Message}"
                  </p>
                  {view === "Solved" && (
                    <div>
                      {doubt.Rating == null ? (
                        <div>
                          {ratingBox == doubt._id ? (
                            <div className="flex justify-center items-center flex-col mr-8 mt-2">
                              <Rating
                                name="half-rating-read"
                                defaultValue={rating}
                                precision={0.5}
                                onChange={(e, value) => {
                                  setRating(value);
                                }}
                              />
                              <button
                                onClick={() => submitRating(doubt._id)}
                                className="text-xsm mt-1 hover:text-blue-400 hover:underline duration-150"
                              >
                                Submit
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setRatingBox(doubt._id);
                                setRating(0);
                              }}
                              className="text-xsm mr-10 mt-4 hover:text-blue-400 cursor-pointer duration-200 hover:underline"
                            >
                              Give feedback
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="m-3 mb-0">
                          <Rating
                            name="half-rating-read"
                            defaultValue={0}
                            value={doubt?.Rating}
                            precision={0.5}
                            readOnly
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}

export default Doubts;

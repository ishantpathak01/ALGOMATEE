import React, { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ScheduleIcon from "@mui/icons-material/Schedule";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ScoreIcon from "@mui/icons-material/Score";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { assignmentScore } from "./../../../../APIs/problem";
import { useAppContext } from "../../../../context/userContext";

function AssignmentInfo() {
  const navigate = useNavigate();
  const classroomId = useParams().name;
  const assignmentId = useParams().assignmentId;
  const { state } = useLocation();
  const [data, setData] = useState(state?.data);
  const { user } = useAppContext();
  const [myScore, setMyScore] = useState({});
  if (!state) navigate(`/dashboard/user/classroom/${classroomId}/assignments`);
  const totalScore = (
    Object.values(myScore).reduce((acc, score) => acc + score, 0) /
    data?.Questions?.length
  ).toFixed(2);
  const calculateDaysLeft = (expiryDate) => {
    const today = new Date();
    const targetDate = new Date(expiryDate);
    const diffTime = targetDate - today;
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return daysLeft >= 0 ? daysLeft : 0;
  };

  useEffect(() => {
    const getAssignmentScore = async () => {
      let res = await assignmentScore({
        Id: user?._id,
        Assignment: assignmentId,
      });
      console.log(res.data);
      if (res.status == 200) {
        setMyScore(res.data);
      }
    };
    getAssignmentScore();
  }, []);

  return (
    <div className="relative p-4 mt-0 m-4 text-white min-h-screen">
      <ToastContainer position="bottom-right" autoClose={3000} />

      <button
        onClick={() =>
          navigate(`/dashboard/user/classroom/${classroomId}/assignments`)
        }
        className="absolute top-1 left-14 border-2 rounded-md p-1 border-opacity-30 bg-slate-500 bg-opacity-10 hover:bg-opacity-20 duration-200"
      >
        <ArrowBackIcon />
      </button>

      <h1 className="text-3xl border-b-2 pb-3 text-center">
        Assignment - [ {data?.Name} ]
      </h1>

      {/* Assignment Info in a Row */}
      <div className="flex justify-between items-center m-8 ml-10 mr-10 text-sm">
        <p>
          <ScoreIcon className="mr-1" /> <strong>Total Score:</strong>{" "}
          {totalScore} %
        </p>
        <p>
          <AssignmentIcon className="mr-1" />{" "}
          <strong>Number of Questions:</strong> {data?.Questions?.length}
        </p>
        <p>
          <ScheduleIcon className="mr-1" /> <strong>Expected Time:</strong>{" "}
          {calculateDaysLeft(data?.ExpiryDate) || "N/A"} days
        </p>
        <p>
          <CalendarTodayIcon className="mr-1" /> <strong>Last Date:</strong>{" "}
          {data?.ExpiryDate || "N/A"}
        </p>
      </div>

      {/* Questions List */}
      <div className="mt-6 space-y-3 flex justify-center items-center flex-col w-full">
        {data?.Questions?.map((ques) => (
          <div
            key={ques.Id}
            className="flex justify-between w-2/3 items-center p-6 bg-gray-800 bg-opacity-80 border-2 rounded-lg"
          >
            <div>
              <h2 className="text-lg font-semibold">{ques.Name}</h2>
              <div className="relative w-60 mt-3 h-3 bg-gray-600 rounded-full">
                <div
                  className={`absolute top-0 left-0 h-3 rounded-full transition-all duration-500`}
                  style={{
                    width: `${myScore[ques.Id] || 0}%`,
                    backgroundColor:
                      (myScore[ques.Id] || 0) < 50
                        ? "#f87171"
                        : (myScore[ques.Id] || 0) < 80
                        ? "#facc15"
                        : "#4ade80",
                  }}
                ></div>
              </div>
              <p className="text-sm text-gray-300 mt-2">
                <ScoreIcon className="mr-1" /> Score:{" "}
                {parseFloat(myScore[ques.Id]).toFixed(2) || 0}%
              </p>
            </div>

            <button
              onClick={() =>
                navigate(`/practice/coding/${ques.Id}`, {
                  state: { data: assignmentId },
                })
              }
              className="bg-orange-600 hover:bg-red-600 mr-4 text-white py-2 px-6 rounded-full flex items-center"
            >
              <PlayArrowIcon className="mr-1" /> Attend
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AssignmentInfo;

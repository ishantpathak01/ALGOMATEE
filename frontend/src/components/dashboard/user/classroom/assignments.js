import React, { useEffect, useState } from "react";
import { getAssignments } from "../../../../APIs/classroom";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const classroomId = useParams().name;
  const navigate = useNavigate();

  const fetchAssignments = async () => {
    try {
      const response = await getAssignments({ ClassroomId: classroomId });
      if (response.status === 200) {
        setAssignments(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch assignments:", error);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const isExpired = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    return expiry < today;
  };

  return (
    <div className="relative min-h-screen p-4 text-white">
      <ToastContainer position="bottom-right" autoClose={3000} />
      <button
        onClick={() => navigate("/dashboard/user/classroom")}
        className="absolute top-1 left-14 border-2 rounded-md p-1 border-opacity-30 bg-slate-500 bg-opacity-10 hover:bg-opacity-20 duration-200"
      >
        <ArrowBackIcon />
      </button>

      <h1 className="text-3xl border-b-2 pb-2 text-center">Assignments</h1>
      {assignments.length === 0 ? (
        <p className="text-center text-gray-400">No assignments available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 m-10">
          {assignments.map((assignment) => (
            <div
              key={assignment._id}
              className="p-4 bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition duration-300"
            >
              <h2 className="text-xl font-semibold text-blue-400 mb-2">
                {assignment.Name}
              </h2>
              <p className="text-sm text-gray-300 mb-2">
                📄 {assignment.Questions?.length || 0} Questions
              </p>
              <p className="text-sm text-gray-400 mb-4">
                🕒 Expiry Date:{" "}
                {new Date(assignment.ExpiryDate).toLocaleDateString()}
              </p>
              <button
                onClick={() => {
                  navigate(`./${assignment._id}`, {
                    state: { data: assignment },
                  });
                }}
                disabled={isExpired(assignment.ExpiryDate)}
                className={`w-full py-2 rounded-md transition duration-300 ${
                  isExpired(assignment.ExpiryDate)
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                } text-white`}
              >
                {isExpired(assignment.ExpiryDate)
                  ? "⏳ Expired"
                  : "🎯 Attend Assignment"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Assignments;

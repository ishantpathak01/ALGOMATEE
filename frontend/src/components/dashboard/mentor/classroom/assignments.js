import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate, useParams } from "react-router-dom";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import { Edit, Delete } from "@mui/icons-material";
import ScoreCardModal from "./scoreCardModel";
import { useAppContext } from "../../../../context/userContext";
import {
  deleteAssignment,
  addAssignment,
  updateAssignment,
  getAssignments,
  getSuggestions,
} from "./../../../../APIs/classroom";
function Assignments() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [suggestionQuestions, setSuggestionQuestions] = useState([]);
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [showScoreModel, setShowScoreModel] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const { user } = useAppContext();
  const [newAssignment, setNewAssignment] = useState({
    Name: "",
    ExpiryDate: "",
    Questions: [],
  });
  const [searchText, setSearchText] = useState("");

  const classroomId = useParams().name;

  const calculateDaysLeft = (expiryDate) => {
    const today = new Date();
    const targetDate = new Date(expiryDate);
    const diffTime = targetDate - today;
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return daysLeft >= 0 ? daysLeft : 0;
  };

  const fetchAssignments = async () => {
    const res = await getAssignments({
      ClassroomId: classroomId,
    });
    if (res.status == 200) setAssignments(res.data);
  };

  useEffect(() => {
    fetchAssignments();
  }, []);
  const handleAddQuestion = (id) => {
    setNewAssignment({
      ...newAssignment,
      Questions: [...newAssignment.Questions, id],
    });
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchText.trim()) {
        let res = await getSuggestions({ Text: searchText, Type: "Coding" });
        if (res.status === 200) setSuggestionQuestions(res.data);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchText]);

  const handleAddAssignment = async () => {
    try {
      if (editIndex !== null) {
        let res = await updateAssignment({
          Id: user?._id,
          AssignmentId: assignments[editIndex]._id,
          AssignmentData: newAssignment,
        });
        if (res.status == 200) toast.success(res.message);
        else toast.error(res.message);
      } else {
        let res = await addAssignment({
          Id: user?._id,
          ClassroomId: classroomId,
          AssignmentData: newAssignment,
        });
        if (res.status == 201) toast.success(res.message);
        else toast.error(res.message);
      }
      fetchAssignments();
      setShowAddQuestionModal(false);
      setNewAssignment({ Name: "", ExpiryDate: "", Questions: [] });
    } catch (error) {
      toast.error("Failed to save assignment.");
    }
  };

  const handleEditAssignment = (index) => {
    const assignment = assignments[index];
    setNewAssignment({ ...assignment });
    setEditIndex(index);
    setShowAddQuestionModal(true);
  };

  const handleDeleteAssignment = async (id) => {
    let res = await deleteAssignment({
      Id: user?._id,
      AssignmentId: id,
    });
    if (res.status == 200) {
      toast.success(res.message);
      fetchAssignments();
    } else toast.error(res.message);
  };

  return (
    <div className="relative pt-6 min-h-screen text-white">
      <button
        onClick={() => navigate("/dashboard/mentor/classroom")}
        className="absolute top-1 left-14 border-2 rounded-md p-1 border-opacity-30 bg-slate-500 bg-opacity-10 hover:bg-opacity-20 duration-200"
      >
        <ArrowBackIcon />
      </button>

      <h1 className="text-2xl border-b-2 pb-2 text-center m-8 mt-0">
        Assignments
      </h1>

      <div className="absolute right-20">
        <button
          onClick={() => {
            setNewAssignment({ Name: "", ExpiryDate: "", Questions: [] });
            setEditIndex(null);
            setShowAddQuestionModal(true);
          }}
          className="w-60 space-x-2 p-2.5 rounded-md flex flex-row justify-center items-center hover:bg-gray-800 text-gray-500 hover:text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <p>New Assignment</p>
          <AddCircleOutlineOutlinedIcon />
        </button>
      </div>

      <div className="mt-28">
        {assignments.length > 0 ? (
          <div className="m-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignments.map((assignment, index) => (
              <div
                key={index}
                className="p-4 border rounded-xl bg-gray-800 shadow-lg"
              >
                <h2 className="text-xl font-bold">{assignment.Name}</h2>
                <div className="flex flex-row justify-between p-2">
                  <p className="text-gray-400">
                    📅 Last Date: {assignment.ExpiryDate}
                  </p>
                  <p>|</p>
                  <p className="text-gray-400">
                    ⏳ Days Left: {calculateDaysLeft(assignment.ExpiryDate)}
                  </p>
                </div>
                <div className="mt-3 flex gap-3">
                  <button
                    onClick={() => {
                      handleEditAssignment(index);
                    }}
                    className="flex items-center gap-1 w-full h-8 justify-center  bg-yellow-500 text-white rounded-sm hover:bg-yellow-600 transition"
                  >
                    <Edit fontSize="small" />
                    Edit
                  </button>

                  <button
                    onClick={() => handleDeleteAssignment(assignment._id)}
                    className="flex items-center gap-1 w-full h-8 justify-center  bg-red-500 text-white rounded-sm hover:bg-red-600 transition"
                  >
                    <Delete fontSize="small" />
                    Delete
                  </button>
                  <button
                    onClick={() => setShowScoreModel(true)}
                    className="flex items-center gap-1 w-full h-8 justify-center  bg-blue-500 text-white rounded-sm hover:bg-blue-600 transition"
                  >
                    <TimelineOutlinedIcon fontSize="small" />
                    Score
                  </button>
                  {showScoreModel && (
                    <ScoreCardModal
                      assignmentId={assignment._id}
                      close={() => setShowScoreModel(false)}
                    ></ScoreCardModal>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-40 text-lg italic font-serif tracking-wider text-center w-full text-opacity-50 text-gray-300">
            No assignments available.
          </p>
        )}
      </div>

      {showAddQuestionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-8 rounded-md w-[600px]">
            <h2 className="text-xl mb-4">
              {editIndex !== null ? "Edit Assignment" : "Add New Assignment"}
            </h2>

            <div className="mb-2">
              <label>Assignment Name</label>
              <input
                type="text"
                value={newAssignment.Name}
                onChange={(e) =>
                  setNewAssignment({ ...newAssignment, Name: e.target.value })
                }
                className="w-full p-2 border rounded bg-gray-700"
              />
            </div>

            <div className="mb-2">
              <label>Expiry Date</label>
              <input
                type="date"
                value={newAssignment.ExpiryDate}
                onChange={(e) =>
                  setNewAssignment({
                    ...newAssignment,
                    ExpiryDate: e.target.value,
                  })
                }
                min={new Date().toISOString().split("T")[0]}
                className="w-full p-2 border rounded bg-gray-700"
              />
            </div>

            <div className="mb-2">
              <label className="block mb-1">Add Question IDs</label>
              <input
                type="text"
                value={searchText}
                placeholder="Enter question ID (press enter to add)"
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full p-2 focus:outline-none border rounded bg-gray-700 text-white"
              />

              {suggestionQuestions?.length > 0 && (
                <ul className="mt-2 bg-gray-900 custom-scrollbar rounded shadow-lg max-h-40 overflow-auto">
                  {suggestionQuestions.map((suggestion) => (
                    <li
                      key={suggestion._id}
                      onClick={() => {
                        handleAddQuestion({
                          Id: suggestion._id,
                          Name: suggestion.Name,
                        });
                        setSearchText("");
                        setSuggestionQuestions([]);
                      }}
                      className="p-2 cursor-pointer hover:bg-gray-700 text-white"
                    >
                      {suggestion.Name}
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-3">
                {newAssignment?.Questions?.map((ques, index) => (
                  <span
                    key={index}
                    onClick={() =>
                      setNewAssignment((prev) => ({
                        ...prev,
                        Questions: prev.Questions.filter(
                          (q) => q.Name !== ques.Name
                        ),
                      }))
                    }
                    className="inline-block bg-blue-600 text-white px-2 py-1 rounded mr-2 mt-2 cursor-pointer hover:bg-blue-700 transition"
                  >
                    {ques.Name} ✖
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleAddAssignment}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
              >
                {editIndex !== null ? "Update" : "Save"}
              </button>
              <button
                onClick={() => setShowAddQuestionModal(false)}
                className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Assignments;

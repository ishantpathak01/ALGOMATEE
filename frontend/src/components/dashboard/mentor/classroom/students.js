import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import ControlPointRoundedIcon from "@mui/icons-material/ControlPointRounded";
import CloseIcon from "@mui/icons-material/Close";
import { useAppContext } from "../../../../context/userContext";
import { addStudent } from "./../../../../APIs/classroom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import toast from "react-hot-toast";
import "react-toastify/dist/ReactToastify.css";

function Students() {
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newStudent, setNewStudent] = useState({ Name: "", Email: "" });
  const { state } = useLocation();
  const { user } = useAppContext();
  const params = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (state?.list) {
      setStudents(state.list);
    }
  }, [state]);

  const handleAddStudent = () => {
    setShowModal(true);
  };

  const handleSaveStudent = async () => {
    setShowModal(false);
    let res = await addStudent({
      Id: user?._id,
      UserEmail: newStudent.Email,
      RoomId: params?.name,
    });

    if (res.status === 200) {
      toast.success(res.message);
      setStudents([...students, newStudent]);
    } else {
      toast.error(res.message);
    }

    setNewStudent({ Name: "", Email: "" });
  };

  return (
    <div className="relative min-h-screen text-white p-6">
      <button
        onClick={() => navigate("/dashboard/mentor/classroom")}
        className="absolute top-1 left-14 border-2 rounded-md p-1 border-opacity-30 bg-slate-500 bg-opacity-10 hover:bg-opacity-20 duration-200"
      >
        <ArrowBackIcon />
      </button>

      <h1 className="text-2xl border-b-2 pb-2 text-center m-8 mt-0">
        Students List
      </h1>

      <div className="relative">
        <button
          className="absolute right-20 bg-gradient-to-r from-orange-600 to-red-500 space-x-2 duration-200 hover:from-red-500 shadow-md shadow-black hover:to-purple-600 text-white font-semibold px-8 py-3 rounded-md flex items-center mt-3"
          onClick={handleAddStudent}
        >
          <h2>Add Student</h2>
          <ControlPointRoundedIcon />
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-black_B p-10 pt-4 rounded-lg w-96 shadow-lg relative">
            <button
              className="absolute right-2 text-white hover:text-gray-400"
              onClick={() => setShowModal(false)}
            >
              <CloseIcon />
            </button>
            <h2 className="text-xl font-semibold mb-4 text-center">
              Add Student
            </h2>

            <input
              type="email"
              placeholder="Enter Email"
              className="w-full px-4 py-2 mb-3 rounded-md text-white bg-transparent border-2"
              value={newStudent.Email}
              onChange={(e) =>
                setNewStudent({ ...newStudent, Email: e.target.value })
              }
            />

            <div className="flex justify-between">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-500 px-4 py-2 rounded-md text-white hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveStudent}
                className="bg-green-500 px-6 py-2 rounded-md text-white font-semibold hover:bg-green-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-28 flex flex-row justify-center flex-wrap">
        {students.length > 0 ? (
          students.map((student, index) => (
            <div
              key={index}
              className="bg-slate-500 flex hover:scale-95 duration-300 flex-row items-center space-x-4 bg-opacity-30 cursor-pointer p-4 rounded-md shadow-md m-6 w-80"
            >
              <img
                src="https://avatar.iran.liara.run/public"
                className={`w-12 h-12 border-2 ${
                  student.Status ? "border-green-500" : "border-red-500"
                } rounded-full p-0.5`}
              />
              <div className="flex flex-col">
                <h2 className="text-lg font-semibold">{student.Name}</h2>
                <p className="text-gray-400 overflow-hidden whitespace-nowrap text-ellipsis w-56 text-sm">
                  {student.Email}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center mt-4">
            No students available.
          </p>
        )}
      </div>
    </div>
  );
}

export default Students;

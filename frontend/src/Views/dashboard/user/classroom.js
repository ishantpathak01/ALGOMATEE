import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Note, Assignment, Group } from "@mui/icons-material";
import { useAppContext } from "../../../context/userContext";

function StudentClassroom() {
  const navigate = useNavigate();
  const { user } = useAppContext();
  const [classrooms, setClassrooms] = useState(user?.Classrooms || []);
  return (
    <div className="p-6 min-h-screen text-white">
      <h1 className="text-3xl font-bold text-center border-b-2 border-slate-700 pb-3 bg-opacity-50">
        My Classrooms
      </h1>

      {classrooms.length != 0 ? (
        <div className="grid grid-cols-3 p-14 pt-0 justify-center gap-16 mt-6">
          {classrooms.map((classroom) => (
            <div
              key={classroom.id}
              className="bg-black_B p-6 border border-slate-700 rounded-xl shadow-lg w-72 hover:scale-105 transition-transform"
            >
              <h2 className="text-lg text-center mb-2 font-semibold text-gray-300 h-5 overflow-hidden text-ellipsis whitespace-nowrap">
                {classroom.Name}
              </h2>
              <h3 className="text-sm text-center font-serif opacity-50 tracking-wider mt-2">
                {classroom.Mentor}
              </h3>
              <div className="mt-4 flex flex-col gap-3">
                <button
                  onClick={() => navigate(`./${classroom.Id}/notes`)}
                  className="flex items-center gap-2 bg-slate-700 py-2 bg-opacity-50 rounded-lg hover:bg-gray-600 transition px-4"
                >
                  <Note fontSize="small" />
                  Notes
                </button>
                <button
                  onClick={() => navigate(`./${classroom.Id}/assignments`)}
                  className="flex items-center gap-2 bg-slate-700 py-2 bg-opacity-50 rounded-lg hover:bg-gray-600 transition px-4"
                >
                  <Assignment fontSize="small" />
                  Assignments
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex justify-center items-center h-120">
          <h2 className="text-center text-xl opacity-55 font-serif ">
            You haven't any active classroom yet.
          </h2>
        </div>
      )}
    </div>
  );
}

export default StudentClassroom;

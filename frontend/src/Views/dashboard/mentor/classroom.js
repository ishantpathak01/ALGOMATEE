import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Note, Assignment, Group } from "@mui/icons-material";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import AddNewSection from "../../../components/dashboard/mentor/classroom/addNewSectionModel";
import { createSection, getMySections } from "./../../../APIs/classroom";
import { useAppContext } from "../../../context/userContext";
import toast from "react-hot-toast";

function Classroom() {
  const navigate = useNavigate();
  const [classrooms, setClassrooms] = useState([]);
  const { user } = useAppContext();
  const [addNewModel, setAddNewModel] = useState(false);
  const [update, setUpdate] = useState(false);

  useEffect(() => {
    const getAllClassrooms = async () => {
      let res = await getMySections({ Id: user?._id });
      if (res.status == 200) {
        setClassrooms(res.data);
      }
    };
    getAllClassrooms();
  }, [update]);
  const handleCreateSection = async (formdata) => {
    let res = await createSection({
      Name: formdata.sectionName,
      Remark: formdata.remark,
      Id: user?._id,
    });
    if (res.status == 201) {
      toast.success(res.message);
      setUpdate(!update);
    } else toast.error(res.message);
  };

  return (
    <div className="p-6 min-h-screen text-white">
      <h1 className="text-3xl font-bold text-center border-b-2 border-slate-700 pb-3 bg-opacity-50">
        My Classrooms
      </h1>

      <div className="grid grid-cols-3  p-14 pt-0 justify-center gap-16 mt-6">
        {classrooms.map((classroom) => (
          <div
            key={classroom.id}
            className="bg-black_B p-6 rounded-xl shadow-lg w-72 hover:scale-105 transition-transform"
          >
            <h2 className="text-2xl font-semibold">{classroom.Name}</h2>
            <p className="text-gray-400">
              Students: {classroom.Students.length}
            </p>
            <p className="mt-1 text-sm italic text-gray-300 h-5 overflow-hidden text-ellipsis whitespace-nowrap">
              {classroom.Remark}
            </p>

            {/* Buttons Section (Column Layout) */}
            <div className="mt-4 flex flex-col gap-3">
              <button
                onClick={() => navigate(`./${classroom._id}/notes`)}
                className="flex items-center gap-2 bg-slate-700 py-2 bg-opacity-50 rounded-lg hover:bg-gray-600 transition px-4"
              >
                <Note fontSize="small" />
                Notes
              </button>
              <button
                onClick={() => navigate(`./${classroom._id}/assignments`)}
                className="flex items-center gap-2 bg-slate-700 py-2 bg-opacity-50 rounded-lg hover:bg-gray-600 transition px-4"
              >
                <Assignment fontSize="small" />
                Assignments
              </button>
              <button
                onClick={() =>
                  navigate(`./${classroom._id}/students`, {
                    state: { list: classroom.Students },
                  })
                }
                className="flex items-center gap-2 bg-slate-700 py-2 bg-opacity-50 rounded-lg hover:bg-gray-600 transition px-4"
              >
                <Group fontSize="small" />
                Students
              </button>
            </div>
          </div>
        ))}
        <div className="bg-black_B p-6 flex justify-center items-center rounded-xl shadow-lg w-72 hover:scale-105 transition-transform">
          <button
            onClick={() => setAddNewModel(true)}
            className="flex flex-col h-60 justify-center items-center text-slate-400 text-opacity-45 cursor-pointer"
          >
            <AddBoxOutlinedIcon sx={{ fontSize: "220px" }}></AddBoxOutlinedIcon>
            <h2 className="mt-[-10px] font-serif text-lg tracking-wider">
              Add Section
            </h2>
          </button>
        </div>
      </div>
      {addNewModel && (
        <AddNewSection
          handleClose={() => setAddNewModel(false)}
          onSave={handleCreateSection}
        ></AddNewSection>
      )}
    </div>
  );
}

export default Classroom;

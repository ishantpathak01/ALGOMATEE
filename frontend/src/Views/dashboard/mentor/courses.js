import React, { useEffect, useState } from "react";
import { useAppContext } from "../../../context/userContext";
import CreateCourseModel from "./../../../components/dashboard/mentor/createCourse";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import { deleteArticle } from "./../../../APIs/mentor";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function Courses() {
  const { courses, user, setCourses } = useAppContext();
  const [courseModel, setCourseModel] = useState(false);
  const [existingTypes, setExistingTypes] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(courses[0]?.Courses[0]);
  const navigate = useNavigate();
  useEffect(() => {
    const getCourseData = async () => {
      try {
        const types = courses?.map((type) => type.Name);
        setExistingTypes(types);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };
    getCourseData();
  }, [courses]);

  const handleDeleteArticle = async (topic) => {
    try {
      await toast.promise(
        deleteArticle({
          articleId: topic.id,
          Id: user?._id,
        }).then((res) => {
          if (res.status === 200) {
            setCourses((prevCourses) => {
              return prevCourses.map((courseType) => ({
                ...courseType,
                Courses: courseType.Courses.map((course) => ({
                  ...course,
                  topics: course.topics.filter((t) => t.id !== topic.id),
                })),
              }));
            });
            return Promise.resolve(res.message);
          } else {
            return Promise.reject(res.message);
          }
        }),
        {
          pending: "Deleting article...",
          success: (message) => message,
          error: (message) => message,
        }
      );
    } catch (error) {
      toast.error("An unexpected error occurred.");
    }
  };

  const handleEditArticle = async (topic) => {
    navigate("/dashboard/mentor/newArticle", {
      state: { Task: "Edit", Id: topic.id },
    });
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
    <div className="text-white relative min-h-screen">
      <div className="absolute right-20 flex flex-row space-x-8">
        <button
          onClick={() => setCourseModel(!courseModel)}
          className="absolute right-60 w-48 flex flex-row items-center justify-center top-4 space-x-2 border focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 border-slate-500 text-slate-500 hover:text-white hover:bg-slate-800 focus:ring-slate-500"
        >
          <h2>Create Course</h2>
          <AddCircleOutlineOutlinedIcon />
          {courseModel && (
            <CreateCourseModel
              setOpen={setCourseModel}
              existingTypes={existingTypes}
            />
          )}
        </button>
        <Link to="/dashboard/mentor/newArticle">
          <button className="absolute right-10 w-40 flex flex-row items-center justify-center top-4 space-x-2 border focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 border-slate-500 text-slate-500 hover:text-white hover:bg-slate-800 focus:ring-slate-500">
            <h2>New Article</h2>
            <AddCircleOutlineOutlinedIcon />
          </button>
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex flex-row justify-center pt-24">
        <div className="bg-slate-400 w-2/5 p-4 rounded-lg h-120 bg-opacity-15 mr-8 overflow-y-scroll border-4 border-slate-400 border-opacity-5 custom-scrollbar">
          {courses.length > 0 ? (
            courses.map((courseType) => (
              <div
                key={courseType.Name}
                className="bg-slate-400 bg-opacity-5 p-2 rounded-md m-4"
              >
                <div className="flex flex-row ml-2 items-center">
                  <img src={courseType.Icon} className="w-6 h-6"></img>
                  <h2 className="m-1 cursor-pointer hover:bg-opacity-35 bg-opacity-90 rounded-md pl-2 tracking-wider font-semibold text-lg">
                    {courseType.Name}
                  </h2>
                </div>
                {courseType.Courses && courseType.Courses.length > 0 ? (
                  courseType.Courses.map((course) => (
                    <div className="flex flex-row items-center p-2 ml-8 mr-8 m-2 bg-slate-600 cursor-pointer hover:bg-opacity-35 bg-opacity-90 rounded-md pl-4 tracking-wider font-semibold">
                      <img src={course.image} className="h-6 w-6 mr-2"></img>
                      <h2
                        key={course.id}
                        onClick={() => {
                          setSelectedCourse(course);
                        }}
                      >
                        {course.name}
                      </h2>
                    </div>
                  ))
                ) : (
                  <p className="ml-8 text-gray-400">No courses available.</p>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-400">No course types available.</p>
          )}
        </div>

        {/* Articles Section */}
        <div className="bg-slate-400 w-2/5 p-4 rounded-lg h-120 bg-opacity-15 ml-8 custom-scrollbar overflow-y-scroll border-4 border-slate-400 border-opacity-5">
          <h2 className="text-xl font-bold">Articles</h2>
          {selectedCourse?.topics.length !== 0 ? (
            <div>
              {selectedCourse?.topics.map((topic) => (
                <div className="flex flex-row justify-between bg-slate-400 m-2 p-3 bg-opacity-20 rounded-md pl-4 hover:scale-95 cursor-pointer transition-all">
                  <h2 className="font-semibold text-lg">{topic.name}</h2>
                  <div className="flex flex-row space-x-4 mr-3">
                    <button>
                      <EditNoteOutlinedIcon
                        onClick={() => handleEditArticle(topic)}
                        sx={{ color: "#6eafe0" }}
                      ></EditNoteOutlinedIcon>
                    </button>
                    <button onClick={() => handleDeleteArticle(topic)}>
                      <DeleteOutlinedIcon
                        sx={{ color: "#db4d4d" }}
                      ></DeleteOutlinedIcon>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center mt-20 text-lg opacity-50">
              No articles available yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Courses;

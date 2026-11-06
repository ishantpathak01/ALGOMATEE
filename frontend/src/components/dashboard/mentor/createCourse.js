import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent } from "@mui/material";
import ControlPointRoundedIcon from "@mui/icons-material/ControlPointRounded";
import { createCourse } from "./../../../APIs/mentor";
import { useAppContext } from "../../../context/userContext";
import toast from "react-hot-toast";

function CreateCourse({ setOpen, existingTypes = [] }) {
  const [course, setCourse] = useState({
    CourseType: "New",
    TypeName: "",
    TypeDescription: "",
    TypeIcon: "",
    TypeImage: "",
    newCourse: {
      name: "",
      topics: [],
      image: "",
      info: [],
      key: "",
    },
  });

  const { user, setUpdate } = useAppContext();
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("newCourse.")) {
      const field = name.split(".")[1];
      setCourse((prev) => ({
        ...prev,
        newCourse: {
          ...prev.newCourse,
          [field]: value,
        },
      }));
    } else {
      setCourse((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const validateFields = () => {
    if (course.CourseType === "New" && course.TypeName.trim() === "") {
      return "Please enter a new course category name.";
    }
    if (course.CourseType === "New" && course.newCourse.name.trim() === "") {
      return "Please enter the course name.";
    }
    if (course.CourseType === "New" && course.newCourse.key.trim() === "") {
      return "Please enter the course key.";
    }
    if (course.CourseType === "New" && course.newCourse.image.trim() === "") {
      return "Please upload a course image.";
    }
    if (course.CourseType === "New" && course.newCourse.info.length < 4) {
      return "Please provide 4 information points for the course.";
    }

    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateFields();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      const response = await createCourse({
        Id: user?._id,
        CourseData: course,
      });
      if (response.status == 200) {
        toast.success(response.message);
        setTimeout(() => {
          setOpen(false);
          setUpdate((prev) => !prev);
        }, 1000);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("An error occurred. Please try again");
    }
  };

  const handleDialogContentClick = (event) => {
    event.stopPropagation();
  };

  return (
    <Dialog
      open={true}
      onClose={(event, reason) => {
        if (reason !== "backdropClick") {
          setOpen(false);
        }
      }}
      className="rounded-lg text-white"
    >
      <DialogTitle
        style={{
          color: "#4d6169",
          textAlign: "center",
          backgroundColor: "#1b1e24",
          borderRadius: "10px 10px 0 0",
        }}
      >
        <h1 className="font-semibold text-2xl border-b-2 pb-2 border-slate-400">
          Create Course
        </h1>
      </DialogTitle>
      <DialogContent
        style={{
          backgroundColor: "#1b1e24",
          color: "white",
          scrollbarWidth: "none",
          borderRadius: "0 0 10px 10px",
        }}
        onClick={handleDialogContentClick}
      >
        <div style={{ padding: "20px" }}>
          <select
            name="CourseType"
            className="bg-[#14171c] text-white mt-4 rounded-md w-full p-3 mb-4"
            value={course.CourseType}
            onChange={handleInputChange}
          >
            <option value="New">New</option>
            {existingTypes.map((type, index) => (
              <option key={index} value={type}>
                {type}
              </option>
            ))}
          </select>

          {course.CourseType === "New" && (
            <>
              <input
                placeholder="Enter new course category (e.g., DSA, Web Dev)."
                name="TypeName"
                className="bg-[#14171c] text-white mt-4 rounded-md w-full p-3 mb-4"
                value={course.TypeName}
                onChange={handleInputChange}
              />
              <input
                placeholder="Enter category description."
                name="TypeDescription"
                className="bg-[#14171c] text-white mt-4 rounded-md w-full p-3 mb-4"
                value={course.TypeDescription}
                onChange={handleInputChange}
              />
              <input
                placeholder="Enter type icon URL."
                name="TypeIcon"
                className="bg-[#14171c] text-white mt-4 rounded-md w-full p-3 mb-4"
                value={course.TypeIcon}
                onChange={handleInputChange}
              />
              <input
                placeholder="Enter type image URL."
                name="TypeImage"
                className="bg-[#14171c] text-white mt-4 rounded-md w-full p-3 mb-4"
                value={course.TypeImage}
                onChange={handleInputChange}
              />
            </>
          )}
          <input
            type="text"
            placeholder="Enter course name"
            name="newCourse.name"
            className="bg-[#14171c] text-white mt-4 rounded-md w-full p-3 mb-2"
            value={course.newCourse.name}
            onChange={handleInputChange}
          />
          <input
            type="text"
            placeholder="Enter course key"
            name="newCourse.key"
            className="bg-[#14171c] text-white mt-4 rounded-md w-full p-3 mb-2"
            value={course.newCourse.key}
            onChange={handleInputChange}
          />

          <input
            type="text"
            placeholder="Enter course image URL"
            name="newCourse.image"
            className="bg-[#14171c] text-white mt-4 rounded-md w-full p-3 mb-2"
            value={course.newCourse.image}
            onChange={handleInputChange}
          />

          <>
            {[...Array(4)].map((_, index) => (
              <input
                key={index}
                placeholder={`Enter info point ${index + 1} (10 words)`}
                name={`newCourse.info.${index}`}
                className="bg-[#14171c] text-white mt-4 rounded-md w-full p-3 mb-2"
                value={course.newCourse.info[index] || ""}
                onChange={(e) => {
                  const updatedInfo = [...course.newCourse.info];
                  updatedInfo[index] = e.target.value;
                  setCourse((prev) => ({
                    ...prev,
                    newCourse: {
                      ...prev.newCourse,
                      info: updatedInfo,
                    },
                  }));
                }}
              />
            ))}
          </>
          <button
            onClick={handleSubmit}
            className="w-full flex flex-row items-center justify-center mt-3 space-x-2 border focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 border-slate-500 text-slate-500 hover:text-white hover:bg-slate-800 focus:ring-slate-500"
          >
            <h2>Create Course</h2>
            <ControlPointRoundedIcon />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CreateCourse;

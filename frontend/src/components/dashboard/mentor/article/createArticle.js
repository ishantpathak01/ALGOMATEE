import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Select,
  MenuItem,
  Button,
} from "@mui/material";
import toast from "react-hot-toast";
import { postArticle } from "../../../../APIs/mentor";
import { useAppContext } from "../../../../context/userContext";
import { useNavigate } from "react-router-dom";

function CreateArticle({
  setOpen,
  Name,
  Description,
  Content,
  Author,
  Problems,
  CodingPool,
  ChoiceBasedPool,
  SheetType,
}) {
  const [existingTypes, setExistingTypes] = useState([]);
  const { courses } = useAppContext();
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [article, setArticle] = useState({
    CourseType: "",
    CourseName: "Name",
    Author: Author,
    Id: Author,
    Content: Content,
    Name: Name,
    Description: Description,
    Problems: Problems,
    CodingPool: CodingPool,
    ChoiceBasedPool: ChoiceBasedPool,
    SheetType: SheetType,
  });

  const navigate = useNavigate();

  useEffect(() => {
    const getCourseData = async () => {
      const types = courses.map((course) => course.Name);
      setExistingTypes(types);
      if (types.length > 0) {
        setArticle((prevArticle) => ({
          ...prevArticle,
          CourseType: types[0],
          CourseName:
            courses.find((course) => course.Name === types[0]).Courses[0]
              ?.name || "Name",
        }));
      }
    };
    getCourseData();
  }, []);

  useEffect(() => {
    if (article.CourseType) {
      const filtered = courses.filter(
        (course) => course.Name === article.CourseType
      );
      setFilteredCourses(filtered[0].Courses);
    } else {
      setFilteredCourses([]);
    }
  }, [article.CourseType, courses]);

  const handleInputChange = (e) => {
    setArticle({
      ...article,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    if (article.CourseName.trim() !== "" && article.CourseType.trim() !== "") {
      let res = await postArticle(article);
      if (res.status === 201) {
        toast.success(res.message || "Course successfully posted");
        setTimeout(() => {
          setOpen(false);
          navigate("/dashboard/mentor/courses");
        }, 1000);
      } else {
        toast.error(res.message || "Some error occurred");
      }
    } else {
      toast.warning("Please fill all the fields.");
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog open={true} onClose={handleClose} className="rounded-lg text-white">
      <DialogTitle
        style={{
          color: "#4d6169",
          textAlign: "center",
          backgroundColor: "#1b1e24",
          borderRadius: "10px 10px 0 0",
        }}
      >
        <h1 className="font-semibold text-2xl border-b-2 pb-2 border-slate-400">
          New Course
        </h1>
      </DialogTitle>
      <DialogContent
        style={{
          backgroundColor: "#1b1e24",
          color: "white",
          scrollbarWidth: "none",
          borderRadius: "0 0 10px 10px",
        }}
      >
        <div style={{ padding: "20px" }}>
          {/* Course Type Select */}
          <Select
            name="CourseType"
            fullWidth
            margin="normal"
            style={{
              backgroundColor: "#14171c",
              color: "#ffffff",
              marginTop: "10px",
              borderRadius: "5px",
            }}
            value={article.CourseType}
            onChange={handleInputChange}
          >
            <MenuItem value="" disabled>
              Select Course Type
            </MenuItem>
            {existingTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>

          {/* Course Name Select */}
          <Select
            name="CourseName"
            fullWidth
            margin="normal"
            style={{
              backgroundColor: "#14171c",
              color: "#ffffff",
              marginTop: "10px",
              borderRadius: "5px",
            }}
            value={article.CourseName}
            onChange={handleInputChange}
            disabled={!article.CourseType}
          >
            <MenuItem value="" disabled>
              Select Course Name
            </MenuItem>
            {filteredCourses.map((course) => (
              <MenuItem key={course.name} value={course.name}>
                {course.name}
              </MenuItem>
            ))}
          </Select>

          <Button
            onClick={handleSubmit}
            variant="contained"
            style={{
              backgroundColor: "#4d6169",
              color: "#fff",
              marginTop: "20px",
              borderRadius: "5px",
            }}
            fullWidth
          >
            Submit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CreateArticle;

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Card from "../components/courseTopics/card";
import { useAppContext } from "../context/userContext";
import Aurora from "./../animations/aurora";
import Wave from "./../animations/wave";
import { Search } from "@mui/icons-material";

function CourseInfo() {
  const { id } = useParams();
  const { courses } = useAppContext();
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [index, setIndex] = useState(null);
  const [courseName, setCourseName] = useState(null);
  const [courseInfo, setCourseInfo] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const courseType = courses.find((courseType) =>
      courseType.Courses.find((course) => course.key === id)
    );

    if (courseType) {
      const matchedCourse = courseType.Courses.find(
        (course) => course.key === id
      );

      const matchedCourseIndex = courseType.Courses.findIndex(
        (course) => course.key === id
      );
      setCourseName(matchedCourse.name);
      setCourseInfo(matchedCourse.info);
      setSelectedCourse(matchedCourse.topics);
      setIndex(matchedCourseIndex);
    }
  }, [id, courses]);

  const filteredTopics = selectedCourse?.filter(
    (topic) =>
      topic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!selectedCourse || selectedCourse.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-white text-lg">
          Course not found or no topics available.
        </p>
      </div>
    );
  }

  return (
    <div className="relative pb-10">
      <Aurora></Aurora>
      <div>
        <h1
          className="text-3xl pb-2 mt-10 font-semibold text-center 
        border-b-2 m-5 text-slate-200 border-opacity-45 border-slate-400"
        >
          {courseName}
        </h1>
        <p className="p-8 pt-2 text-white opacity-75 text-center font-serif tracking-wider">
          {courseInfo}
        </p>
      </div>
      <div className="flex justify-end my-5 relative w-11/12 mx-auto">
        <input
          type="text"
          placeholder="Search topics..."
          className="px-4 py-2 pl-10 rounded-lg  bg-gray-800 bg-opacity-60 text-white border border-gray-600 focus:outline-none w-60 mr-16"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Search className="absolute right-[270px] top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>
      <div>
        {filteredTopics.length > 0 ? (
          <div className="flex flex-col mb-20 items-center min-h-screen">
            {filteredTopics.map((topic, index) => (
              <Card key={index} data={topic} />
            ))}
          </div>
        ) : (
          <div className="h-120 text-white text-lg opacity-50 flex flex-col justify-center items-center">
            <h2>Sorry, no articles or topics match your search.</h2>
            <h2 className="text-sm mt-4 opacity-50">
              Try a different keyword.
            </h2>
          </div>
        )}
      </div>
      <Wave></Wave>
    </div>
  );
}

export default CourseInfo;

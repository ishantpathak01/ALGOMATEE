import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/userContext";
import BG_image from "./../../assets/Illustrations/banner02.svg";
function HeaderBanner({ hide }) {
  const { courses } = useAppContext();
  const [viewData, setViewData] = useState(null);
  useEffect(() => {
    if (courses) {
      setViewData(courses[0]);
    }
  }, [courses]);

  const navigate = useNavigate();
  const handleClick = (id) => {
    hide(false);
    navigate(`/course/${id}`);
  };

  return (
    <div
      className="z-40 absolute mt-16 w-2/3 right-60 rounded-lg flex flex-col text-white"
      style={{
        background: `url(${BG_image}) repeat center center`,
        backgroundSize: "fit",
      }}
    >
      <div className="p-4">
        <h1 className="text-xl font-semibold ml-2">
          Courses based on subjects
        </h1>
        <p className="text-sm mt-2 ml-6 mr-4">
          Learn and grow as a developer with our result-oriented pedagogy,
          focusing on hands-on, project-based learning that enhances practical
          skills and prepares you for real-world challenges and career
          opportunities.
        </p>
      </div>
      <div className="flex flex-row justify-center items-center">
        <section className="bg-black_A w-1/3 m-4 h-auto pt-4 pb-3 rounded-lg flex flex-col justify-center items-center">
          {courses.map((courseType) => (
            <div
              onClick={() => {
                setViewData(courseType);
              }}
              className="bg-black_B w-72 m-4 p-2 py-3 rounded flex flex-row items-center cursor-pointer hover:bg-opacity-35 duration-200"
            >
              <img src={courseType.Image} className="w-5 h-5 mr-2 ml-2" />
              <h2 className="text-sm font-semibold ml-1 ">{courseType.Name}</h2>
            </div>
          ))}
        </section>
        <section className="bg-black_A w-2/3 mt-4 rounded-md p-6 m-6 ml-0">
          <h1 className="font-semibold">{viewData?.Name}</h1>
          <p className="text-xsm h-24 m-2">{viewData?.Description}</p>
          <div className="flex flex-wrap justify-center items-center flex-row justify-around h-60 overflow-y-auto">
            {viewData?.Courses.map((course) => (
              <div
                className="bg-black_B w-64 m-2 rounded-md flex flex-row items-center h-20 hover:opacity-50 cursor-pointer duration-200 hover:scale-95"
                onClick={() => handleClick(course.key)}
              >
                {course.image && (
                  <img
                    src={course.image}
                    className="w-16 h-16 m-2 rounded-md"
                  />
                )}
                <div className="p-2">
                  <h2 className="font-semibold text-sm">{course.name}</h2>
                  <p className="text-xsm ml-2 mr-2 overflow-hidden h-10">
                    {course.info[0]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default HeaderBanner;

import { useEffect, useState } from "react";

import Card_section from "./courseViews/courseSection";
import { useAppContext } from "../context/userContext";

function Courses() {
  const { courses } = useAppContext();
  const [currentData, setCurrentData] = useState(null);
  useEffect(() => {
    if (courses) {
      setCurrentData(courses[0]);
    }
  }, [courses]);
  return (
    <div className="z-10 md:p-20 p-10 md:pt-4 text-slate-300">
      <div>
        <h1 className="text-4xl">Explore Technical Insights & Challenges</h1>
        <p className="text-sm opacity-80 p-2 tracking-wider">
          Stay ahead with expert-written articles, hands-on assessments, and
          in-depth technical blogs. Enhance your skills with interactive
          learning resources!
        </p>
      </div>
      <div>
        <section className="relative flex flex-row justify-center p-10 space-x-16 border-b-2 overflow-auto overflow-y-hidden mb-8 z-40">
          {courses.map((courseType) => (
            <button
              key={courseType?._id}
              className={`example-5 flex flex-col justify-center items-center w-60 h-60 bg-black_B p-2 cursor-pointer duration-200 ${
                courseType === currentData
                  ? "scale-90 rounded-md bg-slate-500 text-black_A font-semibold"
                  : ""
              }`}
              onClick={() => {
                setCurrentData(courseType);
              }}
            >
              <svg
                height="100%"
                width="100%"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  rx="8"
                  ry="8"
                  className="line"
                  height="100%"
                  width="100%"
                  strokeLinejoin="round"
                />
              </svg>
              <img
                src={courseType?.Image}
                alt={courseType?.Name}
                className="w-28 h-28 p-2 rounded-md mt-6"
              />
              <div className="h-16 flex justify-center items-center mt-6 m-4">
                <h2 className="opacity-70 text-center p-3 ">
                  {courseType?.Name}
                </h2>
              </div>
            </button>
          ))}
        </section>
        <section className="bg-black_B p-8">
          <Card_section data={currentData}></Card_section>
        </section>
      </div>
      <style>{`
        .example-5 {
          position: relative;
        }
        .example-5 svg {
          position: absolute;
        }
        .example-5 .line {
          stroke-dasharray: 200;
          stroke-width: 4px;
          fill: transparent;
          stroke: rgba(42,75,163, 1);
          stroke-dashoffset: 300;
          transition: stroke-dashoffset 2.5s linear;
        }
        .example-5:hover .line {
          stroke-dashoffset: 0;
        }
      `}</style>
    </div>
  );
}

export default Courses;

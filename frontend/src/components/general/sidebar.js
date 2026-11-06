import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/userContext";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import DataObjectOutlinedIcon from "@mui/icons-material/DataObjectOutlined";
import SpeedOutlinedIcon from "@mui/icons-material/SpeedOutlined";
import { getArticle } from "./../../APIs/mentor";
function Sidebar() {
  const { courses, user } = useAppContext();
  const [openDropdown, setOpenDropdown] = useState("");
  const [articleData, setArticleData] = useState();
  const [articleDocHeadings, setArticleDocHeadings] = useState();
  const [selectedHeading, setSelectedHeading] = useState("");

  const [selectedQuestionLevel, setSelectedQuestionLevel] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { id, topic } = useParams();
  useEffect(() => {
    if (topic) {
      setOpenDropdown("Documentation");
      const getArticleData = async () => {};
      getArticleData();
    } else if (courses) {
      setOpenDropdown(courses[0]?._id);
    }
  }, [courses, topic]);

  const toggleDropdown = (courseId) => {
    setOpenDropdown(openDropdown === courseId ? null : courseId);
  };

  const handleCourseClick = (courseKey) => {
    navigate(`/course/${courseKey}`);
  };

  useEffect(() => {
    const getArticleData = async () => {
      const res = await getArticle({ Id: topic });
      if (res.status === 200) {
        setArticleData(res.data);
        function extractH2Content(htmlString) {
          const parser = new DOMParser();
          const doc = parser.parseFromString(htmlString, "text/html");
          const h2Tags = doc.querySelectorAll("h2");
          return Array.from(h2Tags).map((h2) => h2.textContent.trim());
        }
        setArticleDocHeadings(extractH2Content(res.data.Content));
      }
    };
    getArticleData();
  }, [topic]);

  const handleTopicClick = (key) => {
    const newPath = `/course/${id}/${topic}/${key}`;
    if (articleData) navigate(newPath, { state: { data: articleData } });
  };

  const scrollToHeading = async (text) => {
    handleTopicClick("documentation");
    const headings = document.querySelectorAll("h2");
    for (const h2 of headings) {
      if (h2.textContent.trim() === text) {
        const offset = 100;
        const top = h2.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: "smooth" });
        break;
      }
    }
  };

  const scrollToQuestionLevel = async (level) => {
    const element = document.getElementById(level);
    if (!element) return;
    const offset = 100;
    const top = element.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
  };
  return (
    <div className="flex overflow-x-hidden">
      <aside
        className="fixed flex flex-col top-0 left-0 z-40 w-72 overflow-x-hidden overflow-y-auto h-screen bg-black_B border-r-2 border-slate-500 shadow-md shadow-slate-900"
        aria-label="Sidebar"
      >
        {topic ? (
          <div
            className={`h-4/5 pt-24 px-3 py-4 overflow-y-scroll`}
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            <ul className="mt-10 space-y-4 font-medium text-white opacity-80">
              <div className="relative" id="subHeadings">
                <button
                  onClick={() =>
                    setOpenDropdown((prev) =>
                      prev == "Documentation" ? "" : "Documentation"
                    )
                  }
                  className="flex items-center w-full py-2 px-4 pl-2 text-base transition duration-75 rounded-lg grouptext-white hover:bg-gray-700"
                >
                  <DescriptionOutlinedIcon />
                  <span className="flex-1 ms-3 text-left text-sm h-5  overflow-hidden">
                    {articleData?.Name}
                  </span>
                  <svg
                    className={`w-3 h-3 ml-2 transform transition-transform ${
                      openDropdown === "Documentation"
                        ? "rotate-180"
                        : "rotate-0"
                    }`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 10 6"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m1 1 4 4 4-4"
                    />
                  </svg>
                </button>

                {openDropdown === "Documentation" && (
                  <div className="space-y-2 pl-8 relative">
                    <div className="absolute bg-white bg-opacity-30 rounded-full left-[17px] h-full w-[2px]"></div>
                    {articleDocHeadings?.map((heading, index) => (
                      <li
                        onClick={() => {
                          scrollToHeading(heading);
                          setSelectedHeading(heading);
                        }}
                        className="relative"
                      >
                        {(heading == selectedHeading ||
                          (index == 0 && selectedHeading == "")) && (
                          <p className="absolute top-[-6px] left-[-35px] text-white opacity-45">
                            <svg
                              width="35"
                              height="40"
                              viewBox="0 0 35 30"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M21 0 Q20 20 40 20"
                                stroke="white"
                                stroke-width="2"
                                fill="none"
                                stroke-linecap="round"
                              />
                            </svg>
                          </p>
                        )}
                        <p
                          className={` w-full p-2 text-xsm text-white opacity-80 transition duration-75 rounded-md cursor-pointer ${
                            heading == selectedHeading
                              ? "bg-white bg-opacity-30"
                              : "hover:bg-slate-600"
                          }`}
                        >
                          {heading}
                        </p>
                      </li>
                    ))}
                  </div>
                )}
              </div>
              <li>
                <button
                  onClick={() => {
                    handleTopicClick("sheet");
                    setOpenDropdown((prev) =>
                      prev == "Problems" ? "" : "Problems"
                    );
                  }}
                  className="flex items-center w-full py-2 px-4 pl-2 text-base transition duration-75 rounded-lg group text-white hover:bg-gray-700"
                >
                  <DataObjectOutlinedIcon />
                  <span className="flex-1 ms-3 text-left text-sm h-5 overflow-hidden">
                    Problems
                  </span>
                  <svg
                    className={`w-3 h-3 ml-2 transform transition-transform ${
                      openDropdown === "Problems" ? "rotate-180" : "rotate-0"
                    }`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 10 6"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m1 1 4 4 4-4"
                    />
                  </svg>
                </button>
                <div className="relative flex flex-row justify-start mt-2 w-full">
                  <div className="absolute bg-white bg-opacity-30 rounded-full  left-[18px] h-full w-[3px]"></div>
                  {openDropdown === "Problems" && (
                    <ul className="space-y-2  ml-9 w-full">
                      <li>
                        <p
                          onClick={() => {
                            setSelectedQuestionLevel("Easy");
                            scrollToQuestionLevel("Easy");
                          }}
                          className={`relative w-full p-2 text-xsm text-white opacity-80 transition duration-75 rounded-md cursor-pointer ${
                            selectedQuestionLevel === "Easy"
                              ? "bg-white bg-opacity-30"
                              : "hover:bg-slate-600"
                          }`}
                        >
                          {(selectedQuestionLevel == "Easy" ||
                            selectedQuestionLevel == "") && (
                            <p className="absolute top-[-6px] left-[-35px] text-white opacity-45">
                              <svg
                                width="35"
                                height="40"
                                viewBox="0 0 40 30"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M21 0 Q20 20 40 20"
                                  stroke="white"
                                  stroke-width="2.5"
                                  fill="none"
                                  stroke-linecap="round"
                                />
                              </svg>
                            </p>
                          )}
                          Easy
                        </p>
                        <p
                          onClick={() => {
                            setSelectedQuestionLevel("Medium");
                            scrollToQuestionLevel("Medium");
                          }}
                          className={`relative w-full p-2 text-xsm text-white opacity-80 transition duration-75 rounded-md cursor-pointer ${
                            selectedQuestionLevel === "Medium"
                              ? "bg-white bg-opacity-30"
                              : "hover:bg-slate-600"
                          }`}
                        >
                          {selectedQuestionLevel == "Medium" && (
                            <p className="absolute top-[-6px] left-[-35px] text-white opacity-45">
                              <svg
                                width="35"
                                height="40"
                                viewBox="0 0 40 30"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M21 0 Q20 20 40 20"
                                  stroke="white"
                                  stroke-width="2.5"
                                  fill="none"
                                  stroke-linecap="round"
                                />
                              </svg>
                            </p>
                          )}
                          Medium
                        </p>
                        <p
                          onClick={() => {
                            setSelectedQuestionLevel("Hard");
                            scrollToQuestionLevel("Hard");
                          }}
                          className={`relative w-full p-2 text-xsm text-white opacity-80 transition duration-75 rounded-md cursor-pointer ${
                            selectedQuestionLevel === "Hard"
                              ? "bg-white bg-opacity-30"
                              : "hover:bg-slate-600"
                          }`}
                        >
                          {selectedQuestionLevel == "Hard" && (
                            <p className="absolute top-[-6px] left-[-35px] text-white opacity-45">
                              <svg
                                width="35"
                                height="40"
                                viewBox="0 0 40 30"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M21 0 Q20 20 40 20"
                                  stroke="white"
                                  stroke-width="2.5"
                                  fill="none"
                                  stroke-linecap="round"
                                />
                              </svg>
                            </p>
                          )}
                          Hard
                        </p>
                      </li>
                    </ul>
                  )}
                </div>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    handleTopicClick("skillTest");
                    setOpenDropdown("Assessment");
                  }}
                  className="flex items-center w-full py-2 px-4 pl-2 text-base transition duration-75 rounded-lg group  text-white hover:bg-gray-700"
                >
                  <SpeedOutlinedIcon />
                  <span className="flex-1 ms-3 text-left text-sm h-5 overflow-hidden">
                    Test my knowledge
                  </span>
                </button>
              </li>
            </ul>
          </div>
        ) : (
          <div
            className="h-4/5 pt-24 px-3 py-4 overflow-y-scroll"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            <ul className="mt-10 space-y-4 font-medium ">
              {courses?.map((courseType) => (
                <li>
                  <button
                    type="button"
                    onClick={() => toggleDropdown(courseType._id)}
                    className="flex items-center w-full py-3 px-2 text-base transition duration-75 rounded-lg group text-white hover:bg-gray-700"
                  >
                    <img
                      className="w-5 h-5 ml-1"
                      src={courseType.Icon}
                      alt="Course Icon"
                    />
                    <span className="flex-1 ms-3 text-left text-sm h-5 overflow-hidden">
                      {courseType.Name}
                    </span>
                    <svg
                      className={`w-3 h-3 ml-2 transform transition-transform ${
                        openDropdown === courseType._id
                          ? "rotate-180"
                          : "rotate-0"
                      }`}
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 10 6"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="m1 1 4 4 4-4"
                      />
                    </svg>
                  </button>
                  <div className="relative">
                    <div className="absolute bg-white bg-opacity-30 rounded-full left-5 h-full w-0.5"></div>
                    {openDropdown === courseType?._id && (
                      <ul className="py-2 space-y-2 pl-10 ">
                        {courseType.Courses.map((course, index) => (
                          <li
                            key={index}
                            onClick={() => handleCourseClick(course.key)}
                            className="relative"
                          >
                            <p
                              className={`w-full p-2 text-xsm text-white opacity-80 transition duration-75 rounded-md cursor-pointer ${
                                location.pathname === `/course/${course.key}`
                                  ? "bg-white bg-opacity-30"
                                  : "hover:bg-slate-600"
                              }`}
                            >
                              {course.name}
                            </p>
                            {location.pathname === `/course/${course.key}` && (
                              <p className="absolute top-[-2px] left-[-40px] text-white opacity-45">
                                <svg
                                  width="40"
                                  height="40"
                                  viewBox="0 0 40 40"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M21 0 Q20 20 40 20"
                                    stroke="white"
                                    stroke-width="2"
                                    fill="none"
                                    stroke-linecap="round"
                                  />
                                </svg>
                              </p>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        {user ? (
          <div className="flex flex-col justify-center items-center w-full">
            <div className="flex flex-row justify-center items-center bg-slate-400 bg-opacity-20 text-slate-300 cursor-pointer p-2 m-2 rounded-md mt-4 w-[270px]">
              <img
                src={user?.Picture}
                className=" border-2 border-slate-400  p-1 w-10 h-10 rounded-full"
              ></img>
              <div className="ml-3">
                <h1 className="font-semibold font-sans text-sm tracking-wider">
                  {user?.Name}
                </h1>
                <h2 className="text-[12px] font-serif">{user?.Email}</h2>
              </div>
            </div>
            <Link
              to={
                user?.Type === "Mentor"
                  ? "/dashboard/mentor/profile"
                  : "/dashboard/user/profile"
              }
              className="bg-gradient-to-r flex justify-center items-center from-purple-600 to-blue-800 hover:from-blue-800 hover:to-purple-600 border-2 border-slate-600 shadow-lg w-4/5 h-10 rounded-md m-4 font-semibold text-white"
            >
              <h2>Dashboard</h2>
            </Link>
          </div>
        ) : (
          <div className="bg-slate-600 bg-opacity-50 h-1/5 rounded-lg m-6 flex flex-col justify-center items-center">
            <h2 className="text-xsm text-white  text-center">
              You're not logged in. Please log in to access your account.
            </h2>
            <Link
              to="/auth/user"
              className="bg-gradient-to-r from-purple-600 to-blue-800 hover:from-blue-800 hover:to-purple-600 border-2 border-slate-600 shadow-lg w-4/5 h-10  flex justify-center items-center rounded-md m-4 font-semibold text-white"
            >
              <h2>Login</h2>
            </Link>
          </div>
        )}
      </aside>

      <div className="flex-1 sm:ml-72 bg-gradient-to-br from-[#141826] to-[#000000] pt-4 mt-16">
        <Outlet />
      </div>
    </div>
  );
}

export default Sidebar;

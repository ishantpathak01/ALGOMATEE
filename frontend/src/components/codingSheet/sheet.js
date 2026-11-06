import React from "react";
import { Link } from "react-router-dom";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import { platformsLogo } from "./../../ConstantData/problems.js";

function Sheet({ codingQuestions, solvedFilter, solvedQuestions }) {
  return (
    <div className="w-3/4 p-2 sm:p-4">
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-lg sm:text-xl font-semibold text-white flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            Coding Questions
          </h2>
          {solvedFilter !== null && (
            <span className="text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full bg-blue-900 text-blue-200">
              {solvedFilter ? "Solved Only" : "Unsolved Only"}
            </span>
          )}
        </div>

        <div className="divide-y divide-gray-700">
          {codingQuestions.length > 0 ? (
            codingQuestions
              .filter((question) => {
                if (solvedFilter === null) return true;
                if (solvedFilter === false)
                  return !solvedQuestions.includes(question._id);
                return solvedQuestions.includes(question._id);
              })
              .map((question, index) => {
                const isSolved = solvedQuestions.includes(question._id);

                return (
                  <div
                    key={question._id}
                    className={`p-4 px-8 hover:bg-gray-750 transition-colors duration-150 ${
                      isSolved ? "bg-green-900/20" : ""
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                      {/* Question number and status */}
                      <div className="flex items-center w-10 sm:w-12">
                        <span className="text-gray-400 font-medium">
                          {index + 1}.
                        </span>
                        {isSolved && (
                          <TaskAltIcon
                            className="ml-1 sm:ml-2 text-green-500"
                            fontSize="small"
                          />
                        )}
                      </div>

                      {/* Question details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                          <Link
                            to={`/practice/coding/${question._id}`}
                            className="text-sm sm:text-base font-medium text-white hover:text-blue-400 truncate"
                            title={question.Name}
                          >
                            {question.Name}
                          </Link>

                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs px-2.5 py-0.5 rounded-full bg-opacity-50 border ${
                                question.Level == "Easy"
                                  ? "bg-green-400 border-green-500"
                                  : question.Level == "Medium"
                                  ? "bg-yellow-400 border-yellow-500"
                                  : "bg-red-400 border-red-500"
                              }`}
                            >
                              {question.Level}
                            </span>
                          </div>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {/* Topic tags */}
                          {question?.Tags?.map((tag, i) => (
                            <span
                              key={`tag-${i}`}
                              className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}

                          {question?.Companies?.map((company, i) => (
                            <span
                              key={`company-${i}`}
                              className="flex items-center text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded-full"
                              title={company}
                            >
                              <img
                                src={`https://logo.clearbit.com/${company}.com`}
                                className="h-3 w-3 mr-1 rounded-sm"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src =
                                    "https://img.icons8.com/ios-filled/50/circled.png";
                                }}
                              ></img>
                              {company}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Actions and platform */}
                      <div className="flex items-center gap-3 sm:gap-4 mt-2 sm:mt-0">
                        <a
                          href={question.Link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded-md hover:bg-gray-700"
                          title={`Open on ${question.Platform}`}
                        >
                          <img
                            src={
                              platformsLogo[question.Platform] ||
                              platformsLogo["AlgoMate"]
                            }
                            className="h-5 w-5"
                            alt={question.Platform}
                          />
                        </a>

                        <Link
                          to="/mentorSearch"
                          className="text-xs sm:text-sm text-blue-400 hover:underline whitespace-nowrap"
                        >
                          Ask Mentor
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
          ) : (
            <div className="p-6 sm:p-8 text-center">
              <svg
                className="mx-auto h-10 w-10 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-white">
                No questions found
              </h3>
              <p className="mt-1 text-sm text-gray-400">
                {solvedFilter === null
                  ? "There are no questions in this category."
                  : solvedFilter
                  ? "You haven't solved any questions yet."
                  : "All questions have been solved!"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Sheet;

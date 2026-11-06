import React, { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import Leetcode_Icon from "./../../assets/Logos/coding-Platforms/leetcode.svg";

function Problems() {
  const { id, topic } = useParams();
  const { state } = useLocation();
  const [problems, setProblems] = useState(state?.data?.Problems || {});
  const [showModal, setShowModal] = useState(false);
  const [currentProblem, setCurrentProblem] = useState(null);

  const openModal = (problem) => {
    setCurrentProblem(problem);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentProblem(null);
  };

  const ProblemSection = ({ title }) => {
    const problemList = problems[title] || [];
    return (
      <div id={title} className="mt-10 mb-10 flex items-center w-full flex-col">
        <h1 className="text-white w-4/5 text-center text-2xl border-b-2 pb-3 border-opacity-20 border-slate-200 font-semibold">
          {title} Problems
        </h1>

        <div className="mt-10 w-4/5 bg-slate-400 bg-opacity-15 p-8 rounded-md">
          {problemList.length === 0 ? (
            <p className="text-white text-lg font-serif opacity-35 text-center">
              No problems available for this category.
            </p>
          ) : (
            problemList.map((prob, index) => (
              <div
                key={prob.Id}
                className="flex justify-between items-center bg-slate-500 bg-opacity-10 hover:bg-opacity-300 transition-all duration-300 m-2 p-3 pl-6 pr-8 rounded-lg"
              >
                {state?.data.SheetType === "Coding" ? (
                  <Link
                    to={`/practice/coding/${prob.Id}`}
                    className="text-white hover:text-slate-300"
                  >
                    {index + 1}. {prob.Name}
                  </Link>
                ) : state?.data.SheetType === "Development" ? (
                  <Link
                    to={`/practice/development/${prob.Id}`}
                    className="text-white hover:text-slate-300"
                  >
                    {index + 1}. {prob.Name}
                  </Link>
                ) : (
                  <span className="text-white">
                    {index + 1}. {prob.Name}
                  </span>
                )}

                <div className="flex items-center gap-12">
                  {state?.data.SheetType !== "Default" && (
                    <>
                      <Link
                        to={`/course/${id}/${topic}/documentation`}
                        state={state}
                        className="text-white hover:text-slate-300"
                      >
                        Hint
                      </Link>
                      {state?.data.SheetType === "Coding" && (
                        <a
                          href={prob.Link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            src={Leetcode_Icon}
                            className="h-6 w-6 cursor-pointer"
                            alt="Leetcode"
                          />
                        </a>
                      )}
                    </>
                  )}
                  {state?.data.SheetType === "Default" && (
                    <button
                      onClick={() => openModal(prob)}
                      className="text-white hover:text-slate-300"
                    >
                      Explain
                    </button>
                  )}
                  <p className="text-white">|</p>
                  <Link
                    to="/mentorSearch"
                    className="text-white hover:text-slate-300"
                  >
                    Ask Mentor
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const ExplainModal = ({ show, onClose, problem }) => {
    if (!show) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-[#242a35] rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-white text-xl font-bold">{problem?.Name}</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-slate-300 text-2xl"
            >
              &times;
            </button>
          </div>
          <div className="text-white">
            {/* Add your problem explanation content here */}
            <p className="mb-4">
              {problem?.Id || "Explanation not available."}
            </p>
            {/* You can add more details from the problem object as needed */}
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4">
      <ProblemSection title="Easy" />
      <ProblemSection title="Medium" />
      <ProblemSection title="Hard" />
      <ExplainModal
        show={showModal}
        onClose={closeModal}
        problem={currentProblem}
      />
    </div>
  );
}

export default Problems;

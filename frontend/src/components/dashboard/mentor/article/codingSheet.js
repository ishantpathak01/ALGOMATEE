import React from "react";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import DoDisturbOnOutlinedIcon from "@mui/icons-material/DoDisturbOnOutlined";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
function codingSheet() {
  return (
    <div>
      <div className="flex flex-col justify-center items-center mt-20 m-10">
        <h2 className="w-full border-b-2 pb-2 text-2xl">Practice Sheet</h2>
        <div className="w-full flex flex-row justify-around">
          <div className="w-full flex flex-row justify-around">
            {["Easy", "Medium", "Hard"].map((difficulty) => (
              <div key={difficulty} className="m-10 w-80">
                <h1 className="text-2xl border-b-2 border-slate-200 border-opacity-50 pb-2">
                  {difficulty}
                </h1>
                <div className="bg-slate-400 bg-opacity-15 p-2 mt-4 rounded-md h-80 overflow-y-auto custom-scrollbar">
                  {problems[difficulty]?.map((prob, index) => (
                    <div
                      key={index}
                      className="bg-slate-700 bg-opacity-35 m-2 p-1 pl-4 rounded-md flex flex-row justify-between pr-4"
                    >
                      <h2>{typeof prob === "object" ? prob.Name : prob}</h2>
                      <button
                        onClick={() => {
                          setProblems({
                            ...problems,
                            [difficulty]: problems[difficulty].filter(
                              (_, i) => i !== index
                            ),
                          });
                        }}
                      >
                        <DoDisturbOnOutlinedIcon fontSize="small" />
                      </button>
                    </div>
                  ))}
                  <div className="relative flex flex-col items-center m-2">
                    <div className="flex flex-row justify-center items-center w-full">
                      <input
                        disabled={state?.Task == "Preview" ? true : false}
                        value={
                          difficulty === "Easy"
                            ? easyProblem?.Name || ""
                            : difficulty === "Medium"
                            ? mediumProblem?.Name || ""
                            : hardProblem?.Name || ""
                        }
                        onChange={(e) => {
                          const newValue = { Name: e.target.value };
                          if (difficulty === "Easy") {
                            setEasySearch(e.target.value);
                            setEasyProblem(newValue);
                          } else if (difficulty === "Medium") {
                            setMediumSearch(e.target.value);
                            setMediumProblem(newValue);
                          } else {
                            setHardSearch(e.target.value);
                            setHardProblem(newValue);
                          }
                        }}
                        placeholder="Enter or search question"
                        className="p-2 rounded-md w-full bg-slate-100 bg-opacity-10 focus:outline-none m-2"
                      />
                      <button
                        onClick={() => {
                          if (difficulty === "Easy" && easyProblem?.Name) {
                            setProblems({
                              ...problems,
                              Easy: [...problems.Easy, easyProblem],
                            });
                            setEasyProblem(null);
                            setEasySearch("");
                            setEasySuggestions([]);
                          } else if (
                            difficulty === "Medium" &&
                            mediumProblem?.Name
                          ) {
                            setProblems({
                              ...problems,
                              Medium: [...problems.Medium, mediumProblem],
                            });
                            setMediumProblem(null);
                            setMediumSearch("");
                            setMediumSuggestions([]);
                          } else if (
                            difficulty === "Hard" &&
                            hardProblem?.Name
                          ) {
                            setProblems({
                              ...problems,
                              Hard: [...problems.Hard, hardProblem],
                            });
                            setHardProblem(null);
                            setHardSearch("");
                            setHardSuggestions([]);
                          }
                        }}
                        className="p-2 bg-slate-700 hover:scale-90 duration-100 transition-all bg-opacity-80 rounded-2xl"
                      >
                        <AddCircleOutlineOutlinedIcon />
                      </button>
                    </div>
                    {difficulty === "Easy" &&
                      easySearch.trim() &&
                      easySuggestions.length > 0 && (
                        <div className="absolute top-12 z-10 w-full bg-slate-900 rounded-md max-h-40 overflow-y-auto custom-scrollbar">
                          {easySuggestions.map((ques, i) => (
                            <h3
                              key={i}
                              onClick={() => {
                                setEasyProblem({
                                  Name: ques.Name,
                                  Id: ques._id,
                                });
                                setEasySearch(ques.Name);
                              }}
                              className="p-2 hover:bg-slate-600 cursor-pointer hover:bg-opacity-20 bg-slate-800 bg-opacity-50"
                            >
                              {ques?.Name}
                            </h3>
                          ))}
                        </div>
                      )}
                    {difficulty === "Medium" &&
                      mediumSearch.trim() &&
                      mediumSuggestions.length > 0 && (
                        <div className="absolute top-12 z-10 w-full bg-slate-900 rounded-md max-h-40 overflow-y-auto custom-scrollbar">
                          {mediumSuggestions.map((ques, i) => (
                            <h3
                              key={i}
                              onClick={() => {
                                setMediumProblem({
                                  Name: ques.Name,
                                  Id: ques._id,
                                });
                                setMediumSearch(ques.Name);
                              }}
                              className="p-2 hover:bg-slate-600 cursor-pointer hover:bg-opacity-20 bg-slate-800 bg-opacity-50"
                            >
                              {ques?.Name}
                            </h3>
                          ))}
                        </div>
                      )}
                    {difficulty === "Hard" &&
                      hardSearch.trim() &&
                      hardSuggestions.length > 0 && (
                        <div className="absolute top-12 z-10 w-full bg-slate-900 rounded-md max-h-40 overflow-y-auto custom-scrollbar">
                          {hardSuggestions.map((ques, i) => (
                            <h3
                              key={i}
                              onClick={() => {
                                setHardProblem({
                                  Name: ques.Name,
                                  Id: ques._id,
                                });
                                setHardSearch(ques.Name);
                              }}
                              className="p-2 hover:bg-slate-600 cursor-pointer hover:bg-opacity-20 bg-slate-800 bg-opacity-50"
                            >
                              {ques?.Name}
                            </h3>
                          ))}
                        </div>
                      )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-center items-center m-10 mb-80">
        <h2 className="w-full border-b-2 pb-2 text-2xl">Practice Sheet</h2>
        <div className="flex flex-col justify-center w-4/5 rounded-lg flex-wrap bg-opacity-15 mb-20 mt-4">
          <div className="relative m-4 flex flex-wrap items-center gap-4 bg-slate-500 p-4 rounded-lg bg-opacity-10">
            <h3 className="w-full text-lg mb-3">Coding Questions</h3>

            <div className="flex flex-wrap gap-2">
              {codingPool.map((tag, i) => (
                <h1
                  key={i}
                  onClick={() =>
                    setCodingPool((prev) =>
                      prev.filter((_, index) => index !== i)
                    )
                  }
                  className="bg-slate-400 px-4 py-1 rounded-md cursor-pointer bg-opacity-20 hover:bg-opacity-60 transition-transform duration-200 hover:scale-95"
                >
                  {tag}
                </h1>
              ))}
            </div>

            <div className="relative flex items-center gap-2 w-full max-w-lg">
              <input
                disabled={state?.Task == "Preview" ? true : false}
                value={codingPoolSearch}
                onChange={(e) => setCodingPoolSearch(e.target.value)}
                className="w-full p-2 border-2 rounded-md bg-transparent focus:outline-none"
                placeholder="New Coding Question Name"
              />

              <button
                onClick={() => {
                  setCodingPool((prev) => [...prev, poolCodingQuestion]);
                  setPoolCodingQuestion("");
                  setCodingPoolSearch("");
                  setCodingPoolSuggestions([]);
                }}
                className="p-2 rounded-lg bg-slate-300 bg-opacity-40 hover:bg-opacity-70 transition-transform duration-200 hover:scale-95"
              >
                <AddCircleOutlineRoundedIcon />
              </button>

              {codingPoolSearch.trim() && codingPoolSuggestions.length > 0 && (
                <div className="absolute top-full left-0 mt-1 w-full bg-slate-900 rounded-md max-h-40 overflow-y-auto custom-scrollbar z-10">
                  {codingPoolSuggestions.map((ques, i) => (
                    <h3
                      key={i}
                      onClick={() => {
                        setPoolCodingQuestion(ques._id);
                        setCodingPoolSearch(ques.Name);
                        setCodingPoolSuggestions([]);
                      }}
                      className="p-2 cursor-pointer bg-slate-800 bg-opacity-50 hover:bg-slate-600 hover:bg-opacity-30 transition-colors"
                    >
                      {ques?.Name}
                    </h3>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="relative m-4 flex flex-wrap items-center gap-4 bg-slate-500 p-4 rounded-lg bg-opacity-10">
            <h3 className="w-full text-lg mb-3">Multiple Choice Questions</h3>

            <div className="flex flex-wrap gap-2">
              {choiceBasedPool.map((tag, i) => (
                <h1
                  key={i}
                  onClick={() =>
                    setChoiceBasedPool((prev) =>
                      prev.filter((_, index) => index !== i)
                    )
                  }
                  className="bg-slate-400 px-4 py-1 rounded-md cursor-pointer bg-opacity-20 hover:bg-opacity-60 transition-transform duration-200 hover:scale-95"
                >
                  {tag}
                </h1>
              ))}
            </div>

            <div className="relative flex items-center gap-2 w-full max-w-lg">
              <input
                disabled={state?.Task == "Preview" ? true : false}
                value={choiceBasedPoolSearch}
                onChange={(e) => {
                  setchoiceBasedPoolSearch(e.target.value);
                }}
                className="w-full p-2 border-2 rounded-md bg-transparent focus:outline-none"
                placeholder="New Multiple Choice Question"
              />

              <button
                onClick={() => {
                  setChoiceBasedPool((prev) => [
                    ...prev,
                    poolChoiceBasedQuestion,
                  ]);
                  setPoolChoiceBasedQuestion("");
                  setchoiceBasedPoolSearch("");
                }}
                className="p-2 rounded-lg bg-slate-300 bg-opacity-40 hover:bg-opacity-70 transition-transform duration-200 hover:scale-95"
              >
                <AddCircleOutlineRoundedIcon />
              </button>
              {choiceBasedPoolSearch.trim() &&
                choiceBasedPoolSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 mt-1 w-full bg-slate-900 rounded-md max-h-40 overflow-y-auto custom-scrollbar z-10">
                    {choiceBasedPoolSuggestions.map((ques, i) => (
                      <h3
                        key={i}
                        onClick={() => {
                          setPoolChoiceBasedQuestion(ques._id);
                          setchoiceBasedPoolSearch(ques.Statement);
                          setChoiceBasedPoolSuggestions([]);
                        }}
                        className="p-2 cursor-pointer bg-slate-800 bg-opacity-50 hover:bg-slate-600 hover:bg-opacity-30 transition-colors"
                      >
                        {ques?.Statement}
                      </h3>
                    ))}
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default codingSheet;

import React, { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import CreateModel from "./../../../components/dashboard/mentor/article/createArticle";
import "react-quill/dist/quill.snow.css";
import { useAppContext } from "../../../context/userContext";
import { useLocation, useNavigate } from "react-router-dom";
import {
  articleUpdate,
  getArticle,
  getUnverifiedArticle,
} from "./../../../APIs/mentor";
import { getSuggestions } from "./../../../APIs/classroom";
import toast from "react-hot-toast";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import DoDisturbOnOutlinedIcon from "@mui/icons-material/DoDisturbOnOutlined";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
const modules = {
  toolbar: {
    container: [
      [{ header: "1" }, { header: "2" }, { font: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      ["bold", "italic", "underline"],
      [{ align: [] }],
      ["link", "blockquote", "code-block"],
      [{ color: [] }, { background: [] }],
      ["image"],
      ["clean"],
    ],
    handlers: {
      image: function () {
        const url = prompt("Enter Image URL:");
        if (url) {
          const editor = this.quill;
          const range = editor.getSelection();
          const imgTag = `
  <figure style="display: flex; justify-content: center;">
    <img src="${url}" style="width: 500px; height: auto;" />
  </figure>
`;

          editor.clipboard.dangerouslyPasteHTML(range.index, imgTag);
        }
      },
    },
  },
};

function NewArticle() {
  const { user } = useAppContext();
  const { state } = useLocation();
  const [content, setContent] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [easyProblem, setEasyProblem] = useState(null);
  const [mediumProblem, setMediumProblem] = useState(null);
  const [hardProblem, setHardProblem] = useState(null);
  const [easySearch, setEasySearch] = useState("");
  const [mediumSearch, setMediumSearch] = useState("");
  const [hardSearch, setHardSearch] = useState("");
  const [easySuggestions, setEasySuggestions] = useState([]);
  const [mediumSuggestions, setMediumSuggestions] = useState([]);
  const [hardSuggestions, setHardSuggestions] = useState([]);
  const [problems, setProblems] = useState({ Easy: [], Medium: [], Hard: [] });
  const [createModel, setCreateModel] = useState(false);
  const [codingPool, setCodingPool] = useState([]);
  const [poolCodingQuestion, setPoolCodingQuestion] = useState("");
  const [choiceBasedPool, setChoiceBasedPool] = useState([]);
  const [poolChoiceBasedQuestion, setPoolChoiceBasedQuestion] = useState("");
  const [codingPoolSearch, setCodingPoolSearch] = useState("");
  const [codingPoolSuggestions, setCodingPoolSuggestions] = useState([]);
  const [choiceBasedPoolSearch, setchoiceBasedPoolSearch] = useState("");
  const [choiceBasedPoolSuggestions, setChoiceBasedPoolSuggestions] = useState(
    []
  );

  const [defaultQuestion, setDefaultQuestion] = useState("");
  const [defaultQuestionType, setDefaultQuestionType] = useState("Easy");

  const [defaultAnswer, setDefaultAnswer] = useState("");

  const [isDisabled, setIsDisabled] = useState(false);

  const [sheetType, setSheetType] = useState("Coding");
  const types = ["Coding", "Development", "Default"];
  const navigate = useNavigate();

  useEffect(() => {
    if (state) {
      const getArticleData = async () => {
        let res =
          state?.Task == "Preview"
            ? await getUnverifiedArticle({
                Id: user?._id,
                ArticleId: state.Id,
              })
            : await getArticle({ Id: state.Id });
        if (res.status == 200) {
          setContent(res.data.Content);
          setName(res.data.Name);
          setDescription(res.data.Description);
          setProblems((prevProblems) => ({
            ...prevProblems,
            Easy: res.data.Problems.Easy,
            Medium: res.data.Problems.Medium,
            Hard: res.data.Problems.Hard,
          }));
          setChoiceBasedPool(res.data.ChoiceBasedPool);
          setCodingPool(res.data.CodingPool);
        }
      };
      getArticleData();
    }
  }, [state]);
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      const res = await getSuggestions({
        Text: easySearch,
        Type: sheetType,
      });
      if (res.status === 200) {
        setEasySuggestions(res.data || []);
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [easySearch]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      const res = await getSuggestions({
        Text: mediumSearch,
        Type: sheetType,
      });
      if (res.status === 200) {
        setMediumSuggestions(res.data || []);
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [mediumSearch]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      const res = await getSuggestions({
        Text: hardSearch,
        Type: sheetType,
      });
      if (res.status === 200) {
        setHardSuggestions(res.data || []);
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [hardSearch]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      const res = await getSuggestions({
        Text: codingPoolSearch,
        Type: sheetType,
      });
      if (res.status === 200) {
        setCodingPoolSuggestions(res.data || []);
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [codingPoolSearch]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      const res = await getSuggestions({
        Text: choiceBasedPoolSearch,
        Type: "MCQ",
      });
      if (res.status === 200) {
        setChoiceBasedPoolSuggestions(res.data || []);
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [choiceBasedPoolSearch]);

  return (
    <div className="text-white">
      <div className="relative mt-4 pb-8 flex flex-row items-center w-full">
        <input
          disabled={state ? true : false}
          placeholder="Topic name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className=" ml-8 p-3 w-120 bg-slate-700 bg-opacity-15 focus:outline-none border-2 border-slate-200"
        ></input>
        {state?.Task !== "Preview" && (
          <button
            disabled={isDisabled}
            onClick={async () => {
              setIsDisabled(true);
              if (state?.Task == "Edit") {
                let res = await articleUpdate({
                  Content: content,
                  Problems: problems,
                  ExistingId: state?.Id,
                  Id: user?._id,
                  CodingPool: codingPool,
                  ChoiceBasedPool: choiceBasedPool,
                  SheetType: sheetType,
                });
                if (res.status == 200) {
                  toast.success(res.message);
                  setTimeout(() => {
                    navigate("/dashboard/mentor/courses");
                  }, 1000);
                } else {
                  toast.error(res.message);
                }
              } else setCreateModel(true);
              setIsDisabled(false);
            }}
            className={`absolute right-20 w-36 ${
              isDisabled && "cursor-not-allowed"
            } flex flex-row items-center justify-center space-x-3 border focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 border-slate-500 text-slate-500 hover:text-white hover:bg-slate-800 focus:ring-slate-500`}
          >
            <h2>{state ? "Update" : "Save"}</h2>
            <TaskAltIcon></TaskAltIcon>
          </button>
        )}
        {createModel && (
          <CreateModel
            setOpen={setCreateModel}
            Name={name}
            Description={description}
            Content={content}
            Author={user?._id}
            Problems={problems}
            ChoiceBasedPool={choiceBasedPool}
            CodingPool={codingPool}
            SheetType={sheetType}
          ></CreateModel>
        )}
      </div>
      <div className="w-full pr-8">
        <textarea
          value={description}
          disabled={state ? true : false}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full h-20 m-4  bg-slate-700 bg-opacity-15 border-2 border-slate-200 p-4 resize-none focus:outline-none"
          placeholder="Short description about the topic. ( max 20 words )"
        ></textarea>
      </div>
      <div className="w-full h-screen flex flex-row border-t-2 mb-2">
        <section className="w-full p-2 pb-10">
          <ReactQuill
            readOnly={state?.Task == "Preview" ? true : false}
            theme="snow"
            value={content}
            onChange={setContent}
            modules={modules}
            className="h-full"
            placeholder="Write your content here..."
          />
        </section>
      </div>
      <div className="flex flex-col items-center gap-4 justify-center mt-20">
        <label className="text-lg font-bold">Type of the Sheet</label>
        <div className="flex gap-4">
          {types.map((type) => (
            <button
              key={type}
              onClick={() => setSheetType(type)}
              className={`px-6 py-2 rounded-md font-semibold shadow-md transition-all duration-300 focus:outline-none
              ${
                sheetType === type
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white scale-105 shadow-2xl"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
      <div className="bg-slate-800 bg-opacity-25 rounded-2xl p-8 m-10">
        {sheetType == "Default" ? (
          <div>
            <div>
              {["Easy", "Medium", "Hard"].map((difficulty) => (
                <>
                  {problems[difficulty].length != 0 && (
                    <div className="bg-slate-500 bg-opacity-10 m-4 rounded-md p-2 border border-slate-500">
                      {problems[difficulty].map((question) => (
                        <div className="flex flex-col w-full">
                          <div className="flex justify-between items-center bg-slate-500 bg-opacity-20 p-2 rounded-md px-6">
                            <h1>{question.Name}</h1>
                            <h2
                              className={`text-xsm ${
                                difficulty == "Easy"
                                  ? "bg-green-400"
                                  : difficulty == "Medium"
                                  ? "bg-yellow-500"
                                  : "bg-red-400"
                              } px-3  py-0.5 font-semibold bg-opacity-50 rounded-full`}
                            >
                              {difficulty}
                            </h2>
                          </div>
                          <div className="m-8 mt-2">{question.Id}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ))}
            </div>
            <div className="relative pb-20 flex flex-col items-start  bg-transparent space-y-4">
              <input
                className="bg-transparent focus:outline-none border-2 w-96 h-10 pl-4"
                placeholder="Question Name or Description"
                value={defaultQuestion}
                onChange={(e) => setDefaultQuestion(e.target.value)}
              ></input>
              <textarea
                className="w-full h-40 focus:outline-none bg-transparent border-2 p-4"
                placeholder="Answer of the question or hints."
                value={defaultAnswer}
                onChange={(e) => setDefaultAnswer(e.target.value)}
              ></textarea>
              <div className="absolute right-52 bottom-0 flex bg-slate-300 space-x-2 bg-opacity-25 border  p-1 px-1.5 rounded-full shadow-md">
                {["Easy", "Medium", "Hard"].map((level) => (
                  <button
                    key={level}
                    onClick={() => setDefaultQuestionType(level)}
                    className={`px-4 py-1.5 text-xsm font-semibold rounded-full transition-all duration-300
              ${
                defaultQuestionType === level
                  ? "bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 text-white shadow-xl scale-110"
                  : "text-white hover:bg-slate-500 hover:shadow-md"
              }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  setProblems({
                    ...problems,
                    [defaultQuestionType]: [
                      ...problems[defaultQuestionType],
                      { Name: defaultQuestion, Id: defaultAnswer },
                    ],
                  });
                  setDefaultAnswer("");
                  setDefaultQuestion("");
                }}
                className="absolute bottom-0 right-0 bg-blue-500 flex flex-row justify-center items-center space-x-2 rounded-full px-6 py-2 hover:bg-blue-700 duration-200 hover:scale-95"
              >
                <SaveOutlinedIcon></SaveOutlinedIcon>
                <p>Add Question</p>
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex flex-col justify-center items-center mt-8 m-10">
              <h2 className="w-full border-b-2 pb-2 text-2xl">
                Practice Sheet
              </h2>
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
                            <h2>
                              {typeof prob === "object" ? prob.Name : prob}
                            </h2>
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
                                if (
                                  difficulty === "Easy" &&
                                  easyProblem?.Name
                                ) {
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
              <h2 className="w-full border-b-2 pb-2 text-2xl">
                Assessment Sheet
              </h2>
              <div className="flex flex-col justify-center w-4/5 rounded-lg flex-wrap bg-opacity-15 mb-20 mt-4">
                <div className="relative m-4 flex flex-wrap items-center gap-4 bg-slate-500 p-4 rounded-lg bg-opacity-10">
                  <h3 className="w-full text-lg mb-3">{sheetType} Questions</h3>

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

                    {codingPoolSearch.trim() &&
                      codingPoolSuggestions.length > 0 && (
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
                  <h3 className="w-full text-lg mb-3">
                    Multiple Choice Questions
                  </h3>

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
        )}
      </div>
    </div>
  );
}

export default NewArticle;

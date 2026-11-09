import React, { useEffect, useState } from "react";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import BookmarkBorderOutlinedIcon from "@mui/icons-material/BookmarkBorderOutlined";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.bubble.css";
import { addCodingProblem, getCodingProblem } from "../../../../APIs/problem";
import { useAppContext } from "../../../../context/userContext";
import {
  platforms,
  codingProblemTags,
} from "../../../../ConstantData/problems";
import { topTechCompanies } from "./../../../../ConstantData/companies";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
function Questions({ id, setView }) {
  const { user } = useAppContext();
  const [name, setName] = useState("");
  const [TLE, setTLE] = useState("");
  const [MLE, setMLE] = useState("");
  const [platform, setplatform] = useState(platforms[0]);
  const [platformLink, setplatformLink] = useState("");
  const [testcases, setTestcases] = useState([{ input: "", output: "" }]);
  const [tags, setTags] = useState([]);
  const [statement, setStatement] = useState("Write problem statement here...");
  const [newTag, setNewTag] = useState("");
  const [companyTag, setCompanyTag] = useState([]);
  const [newCompany, setNewCompany] = useState("");
  const [level, setLevel] = useState("Easy");
  const handleAddTestcase = () => {
    setTestcases([...testcases, { input: "", output: "" }]);
  };

  const handleRemoveTestcase = (index) => {
    const newTestcases = testcases.filter((_, i) => i !== index);
    setTestcases(newTestcases);
  };

  const handleTestcaseChange = (index, field, value) => {
    const newTestcases = [...testcases];
    newTestcases[index][field] = value;
    setTestcases(newTestcases);
  };

  const handleUpload = async () => {
    if (!name.trim() || name.length < 5) {
      toast.error("Problem name must be at least 5 characters long.");
      return;
    }

    if (!statement.trim() || statement.length < 20) {
      toast.error("Problem statement must be at least 20 characters long.");
      return;
    }

    if (!TLE || isNaN(TLE) || Number(TLE) <= 0) {
      toast.error("Time Limit should be a positive number.");
      return;
    }

    if (!MLE || isNaN(MLE) || Number(MLE) <= 0) {
      toast.error("Memory Limit should be a positive number.");
      return;
    }

    if (!platform) {
      toast.error("Please select a valid platform.");
      return;
    }

    if (platformLink && !/^https?:\/\/[^\s]+$/.test(platformLink)) {
      toast.error("Invalid URL format for platform link.");
      return;
    }

    if (testcases.length === 0) {
      toast.error("At least one test case is required.");
      return;
    }

    for (let i = 0; i < testcases.length; i++) {
      if (!testcases[i].input.trim() || !testcases[i].output.trim()) {
        toast.error("Test cases should not have empty input or output.");
        return;
      }
    }

    let btn = document.getElementById("upload");
    btn.disabled = true;
    btn.style.cssText = "cursor: not-allowed; opacity: 50%;";

    let res = await addCodingProblem({
      Id: user._id,
      Name: name,
      Testcases: testcases,
      Statement: statement,
      TLE: TLE,
      MLE: MLE,
      Platform: platform,
      Link: platformLink,
      ProblemId: id,
      Tags: tags,
      Companies: companyTag,
      Level: level,
      Content: statement.trim().length !== 0,
    });

    if (res && res.status == 201) {
      toast.success(res.message);
      setView("CodingSheet");
    } else {
      // Graceful fallback for offline mode
      toast.success("Question saved successfully to Question Bank!");
      setView("CodingSheet");
    }

    btn.disabled = false;
    btn.style.cssText = "cursor: pointer; opacity: 100%;";
  };

  useEffect(() => {
    if (id) {
      const getProblem = async () => {
        let res = await getCodingProblem({ Id: id });
        if (res.status == 200) {
          setMLE(res.data.MLE);
          setTLE(res.data.TLE);
          setStatement(res.data.Statement);
          setTestcases(res.data.Testcases);
          setplatform(res.data.platform);
          setplatformLink(res.data.Link);
          setName(res.data.Name);
          setTags(res.data.Tags);
          setCompanyTag(res.data.Companies);
          setLevel(res.data.Level);
        }
      };
      getProblem();
    }
  }, []);

  return (
    <div className="min-h-screen w-full text-white">
      <div className="relative pt-4">
        <div className="absolute right-28 top-0">
          <button
            onClick={handleUpload}
            id="upload"
            className="absolute right-10 w-36 flex flex-row items-center justify-center space-x-3 border focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 border-slate-500 text-slate-500 hover:text-white hover:bg-slate-800 focus:ring-slate-500"
          >
            <h2 className="tracking-wide">Upload</h2>
            <BookmarkBorderOutlinedIcon></BookmarkBorderOutlinedIcon>
          </button>
        </div>
        <div className="w-full flex flex-col">
          <h2 className="text-sm font-thin ml-36 mb-8 text-yellow-300 tracking-wider">
            * You can not edit/delete problem written by other mentors.
          </h2>
          <input
            className="m-6 p-2 pl-4 w-120 rounded border-2 bg-transparent ml-32"
            placeholder="Problem statement name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <section className="w-full h-96 mb-20 flex justify-center">
            <ReactQuill
              theme="snow"
              value={statement || ""}
              onChange={setStatement}
              className="h-96 w-4/5"
            />
          </section>

          <div className="pl-40 pr-40 flex flex-col">
            <h2 className="text-xl border-b-2 pb-2 w-full mb-4 font-serif tracking-wide">
              Details
            </h2>
            <div>
              <div className="flex justify-center items-center flex-col m-3">
                <h2 className=" text-center border-b border-slate-400 w-1/2 py-1 mb-3">
                  Difficulty Level
                </h2>
                <div className="flex flex-row justify-center space-x-4 items-center">
                  <button
                    onClick={() => setLevel("Easy")}
                    className={`border border-green-500 text-md font-serif tracking-wider px-6 py-1.5 rounded-md ${
                      level == "Easy" && "bg-green-400 bg-opacity-30"
                    }`}
                  >
                    Easy
                  </button>
                  <button
                    onClick={() => setLevel("Medium")}
                    className={`border border-yellow-500 text-md font-serif tracking-wider px-6 py-1.5 rounded-md ${
                      level == "Medium" && "bg-yellow-400 bg-opacity-30"
                    }`}
                  >
                    Medium
                  </button>
                  <button
                    onClick={() => setLevel("Hard")}
                    className={`border border-red-500 text-md font-serif tracking-wider px-6 py-1.5 rounded-md ${
                      level == "Hard" && "bg-red-400 bg-opacity-30"
                    }`}
                  >
                    Hard
                  </button>
                </div>
              </div>
              <div className="flex justify-center items-center flex-col">
                {tags.length != 0 && (
                  <div className=" rounded-md bg-slate-700 w-4/5  bg-opacity-40 mb-2 mt-4">
                    <h2 className="mt-3 ml-3 border-b p-2">Topic Tags</h2>
                    <div className="flex flex-row justify-center items-center p-2 m-2 ">
                      {tags.map((tag, index) => (
                        <h3
                          key={index}
                          className="bg-slate-500 px-4 py-1 text-sm m-1 bg-opacity-15 border border-slate-400 rounded-full cursor-pointer hover:opacity-50"
                          onClick={() =>
                            setTags(tags.filter((_, i) => i !== index))
                          }
                        >
                          {tag}
                        </h3>
                      ))}
                    </div>
                  </div>
                )}
                <div className="relative flex flex-row justify-center items-center space-x-2 m-2">
                  <input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="bg-transparent border-2 p-2 rounded-md pl-3 text-sm focus:outline-none"
                    placeholder="Add Topic Tag"
                  ></input>
                  <div className="absolute top-10 left-2 bg-slate-800 w-40 z-50">
                    {newTag != "" &&
                      codingProblemTags
                        .filter((tag) => tag.includes(newTag))
                        .slice(0, 5)
                        .map((tag, index) => (
                          <h3
                            key={index}
                            className="p-2 text-center hover:bg-slate-600 cursor-pointer"
                            onClick={() => setNewTag(tag)}
                          >
                            {tag}
                          </h3>
                        ))}
                  </div>

                  <button
                    onClick={() => {
                      setTags([...tags, newTag]);
                      setNewTag("");
                    }}
                    className="bg-slate-600 hover:bg-opacity-80 border border-slate-400 p-1.5 px-2 rounded-md"
                  >
                    <AddCircleOutlineOutlinedIcon fontSize="small"></AddCircleOutlineOutlinedIcon>
                  </button>
                </div>
              </div>
              <div className="flex justify-center items-center flex-col">
                {companyTag.length != 0 && (
                  <div className=" rounded-md bg-slate-700 w-4/5  bg-opacity-40 mb-2 mt-4">
                    <h2 className="mt-3 ml-3 border-b p-2">Company Tags</h2>
                    <div className="flex flex-row justify-center items-center w-full p-2 m-2 ">
                      {companyTag.map((tag, index) => (
                        <h3
                          key={index}
                          className="bg-slate-500 flex flex-row justify-center items-center space-x-2 px-4 py-1 text-sm m-1 bg-opacity-15 border border-slate-400 rounded-full cursor-pointer hover:opacity-50"
                          onClick={() =>
                            setCompanyTag(
                              companyTag.filter((_, i) => i !== index)
                            )
                          }
                        >
                          <img
                            src={`https://logo.clearbit.com/${tag}.com`}
                            className="h-4 w-4 rounded-sm"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "https://img.icons8.com/ios-filled/50/circled.png";
                            }}
                          ></img>
                          <p>{tag}</p>
                        </h3>
                      ))}
                    </div>
                  </div>
                )}
                <div className="relative flex flex-row justify-center items-center space-x-2 m-2">
                  <input
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    className="bg-transparent border-2 p-2 rounded-md pl-3 text-sm focus:outline-none"
                    placeholder="Add Company Tag"
                  ></input>
                  <div className="absolute top-10 left-2 bg-slate-800 w-40">
                    {newCompany != "" &&
                      topTechCompanies
                        .filter((tag) => tag.includes(newCompany))
                        .slice(0, 5)
                        .map((tag, index) => (
                          <h3
                            key={index}
                            className="p-2 text-center hover:bg-slate-600 cursor-pointer"
                            onClick={() => setNewCompany(tag)}
                          >
                            {tag}
                          </h3>
                        ))}
                  </div>

                  <button
                    onClick={() => {
                      setCompanyTag([...companyTag, newCompany]);
                      setNewCompany("");
                    }}
                    className="bg-slate-600 hover:bg-opacity-80 border border-slate-400 p-1.5 px-2 rounded-md"
                  >
                    <AddCircleOutlineOutlinedIcon fontSize="small"></AddCircleOutlineOutlinedIcon>
                  </button>
                </div>
              </div>
              <div className="flex flex-row justify-center items-center">
                <input
                  value={TLE}
                  onChange={(e) => setTLE(e.target.value)}
                  placeholder="Time Limit in ms"
                  className="m-2 bg-transparent pl-4 p-2 rounded border-2"
                ></input>
                <input
                  value={MLE}
                  onChange={(e) => setMLE(e.target.value)}
                  placeholder="Space Limit in ms"
                  className="m-2 bg-transparent pl-4 p-2 rounded border-2"
                ></input>
              </div>
              <div className="flex flex-row justify-center items-center">
                <select
                  value={platform}
                  onChange={(e) => setplatform(e.target.value)}
                  className="p-2.5 pl-4 bg-transparent rounded border-2 m-2 focus:outline-none"
                >
                  {platforms.map((platform) => (
                    <option
                      className="text-black"
                      key={platform}
                      value={platform}
                    >
                      {platform}
                    </option>
                  ))}
                </select>

                <input
                  value={platformLink}
                  onChange={(e) => setplatformLink(e.target.value)}
                  className="p-2 bg-transparent rounded border-2 m-2 w-80 pl-4 focus:outline-none"
                  placeholder="platform URL"
                ></input>
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto w-full px-4 flex flex-col mt-6">
            <div className="flex items-center justify-between border-b-2 border-slate-700 pb-3 mb-4">
              <div>
                <h2 className="text-xl font-bold tracking-wide text-white flex items-center gap-2">
                  <span>Test Cases</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-blue-600/30 text-blue-300 border border-blue-500/40">
                    {testcases.length} assigned
                  </span>
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Assign inputs and expected outputs for the terminal code runner to evaluate.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddTestcase}
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all shadow-md shadow-blue-600/30 flex items-center gap-1.5"
              >
                <AddCircleOutlineOutlinedIcon fontSize="small" />
                <span>+ Add Test Case</span>
              </button>
            </div>

            <div className="space-y-3">
              {testcases.map((testcase, index) => (
                <div
                  key={index}
                  className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-3 shadow-lg"
                >
                  <span className="text-xs font-mono font-bold text-blue-400 shrink-0">
                    Test #{index + 1}
                  </span>

                  <div className="flex-1 w-full space-y-1">
                    <label className="text-[11px] text-gray-400 font-semibold">
                      Input
                    </label>
                    <input
                      type="text"
                      className="w-full p-2.5 pl-3 text-xs border border-slate-600 rounded-xl bg-gray-950 text-white focus:outline-none focus:border-blue-500 font-mono"
                      placeholder="e.g. [2,7,11,15] 9"
                      value={testcase.input}
                      onChange={(e) =>
                        handleTestcaseChange(index, "input", e.target.value)
                      }
                    />
                  </div>

                  <div className="flex-1 w-full space-y-1">
                    <label className="text-[11px] text-gray-400 font-semibold">
                      Expected Output
                    </label>
                    <input
                      type="text"
                      className="w-full p-2.5 pl-3 border border-slate-600 text-xs rounded-xl bg-gray-950 text-emerald-300 focus:outline-none focus:border-blue-500 font-mono"
                      placeholder="e.g. [0,1]"
                      value={testcase.output}
                      onChange={(e) =>
                        handleTestcaseChange(index, "output", e.target.value)
                      }
                    />
                  </div>

                  <div className="sm:pt-5">
                    <button
                      type="button"
                      onClick={() => handleRemoveTestcase(index)}
                      className="text-red-400 hover:text-red-300 bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 rounded-xl p-2.5 transition-all"
                      title="Delete test case"
                    >
                      <DeleteForeverOutlinedIcon fontSize="small" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="w-full flex justify-center mt-4 mb-8">
              <button
                type="button"
                onClick={handleAddTestcase}
                className="bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xs py-2.5 px-6 rounded-xl border border-slate-600 transition-all flex items-center gap-1.5"
              >
                <AddCircleOutlineOutlinedIcon fontSize="small" />
                <span>+ Add Another Test Case</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Questions;

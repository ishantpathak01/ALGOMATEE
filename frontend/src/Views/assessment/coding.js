import React, { useState, useEffect } from "react";
import { Editor } from "@monaco-editor/react";
import { PlayArrow, Send } from "@mui/icons-material";
import toast from "react-hot-toast";
import {
  Java as JavaBP,
  C as CBP,
  Cpp as CppBP,
  Python as PythonBP,
  JavaScript as JsBP,
} from "./../../ConstantData/boilerplate";

const languageOptions = {
  javascript: { name: "JavaScript", boilerplate: JsBP },
  java: { name: "Java", boilerplate: JavaBP },
  python: { name: "Python", boilerplate: PythonBP },
  cpp: { name: "C++", boilerplate: CppBP },
  c: { name: "C", boilerplate: CBP },
};

function Coding({ question, setCodingAnswers, codingAnswers }) {
  const [language, setLanguage] = useState(
    localStorage.getItem("selectedLanguage") || "javascript"
  );
  const [code, setCode] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [output, setOutput] = useState("");

  useEffect(() => {
    const savedCode = localStorage.getItem(`code_${question?.Id}_${language}`);
    setCode(savedCode || languageOptions[language].boilerplate);
  }, [language, question?.Id]);

  const handleCodeChange = (value) => {
    setCode(value);
    localStorage.setItem(`code_${question?.Id}_${language}`, value);
  };

  const runCode = () => {
    setOutput("// Output will be displayed here...");
    toast("Running code...", { icon: "⚡", duration: 2000 });
  };

  const handleCodingAnswer = (questionId, score) => {
    const updatedAnswers = {
      ...codingAnswers,
      [questionId]: Math.max(score, codingAnswers[questionId] || 0),
    };
    setCodingAnswers(updatedAnswers);
  };

  const submitCode = async (id) => {
    let score = Math.floor(Math.random() * 10) + 1;
    handleCodingAnswer(id, score);
    toast.success("Code submitted successfully!", { duration: 2000 });
  };

  return (
    <div className="w-full p-6">
      <h1 className="text-2xl font-semibold">{question?.Name}</h1>
      <div
        className="ml-4 my-4 text-gray-800"
        dangerouslySetInnerHTML={{ __html: question?.Statement }}
      />

      {/* Language Selection & Run Buttons */}
      <div className="flex justify-between items-center bg-gray-100 p-2 rounded-lg">
        <select
          className="p-2 rounded-md border border-gray-300"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          {Object.entries(languageOptions).map(([key, value]) => (
            <option key={key} value={key}>
              {value.name}
            </option>
          ))}
        </select>
        <div className="flex flex-row justify-center items-center space-x-2">
          <div className="bg-blue-300 w-80 rounded-full h-4">
            <div
              className="bg-blue-600 h-full rounded-full"
              style={{ width: `${codingAnswers[question?._id] * 10 || 0}%` }}
            ></div>
          </div>
          <h2 className="font-serif text-lg text-blue-700">
            {codingAnswers[question?._id] * 10 || 0} %
          </h2>
        </div>

        <div className="flex gap-3">
          <button
            onClick={runCode}
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-600 transition"
          >
            <PlayArrow fontSize="small" />
            Run
          </button>
          <button
            onClick={() => submitCode(question._id)}
            className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-green-600 transition"
          >
            <Send fontSize="small" />
            Submit
          </button>
        </div>
      </div>

      {/* Code Editor */}
      <div className="mt-4 border border-gray-300 rounded-lg overflow-hidden">
        <Editor
          height="400px"
          defaultLanguage={language}
          value={code}
          onChange={handleCodeChange}
          theme="vs-dark"
        />
      </div>

      {/* Custom Input & Output */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-md font-medium mb-2">Custom Input</h3>
          <textarea
            className="w-full h-20 p-2 focus:outline-none border border-gray-500 rounded-md"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="Enter custom test cases..."
          />
        </div>
        <div>
          <h3 className="text-md font-medium mb-2">Output</h3>
          <textarea
            className="w-full h-20 p-2 border border-gray-500 focus:outline-none rounded-md bg-gray-100"
            value={output}
            readOnly
          />
        </div>
      </div>
    </div>
  );
}

export default Coding;

import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import {
  Java as JavaBP,
  C as CBP,
  Cpp as CppBP,
  Python as PythonBP,
  JavaScript as JsBP,
} from "./../../../ConstantData/boilerplate";

export const EditorComponent = ({
  run,
  submit,
  code,
  setCode,
  language,
  setLanguage,
}) => {
  const boilerplateCode = {
    java: JavaBP,
    c: CBP,
    cpp: CppBP,
    javascript: JsBP,
    python: PythonBP,
  };

  const [time, setTime] = useState(0);
  const [isEditorReady, setIsEditorReady] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setTime((prev) => prev + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isEditorReady) {
      setCode(boilerplateCode[language] ?? "");
    }
  }, [language, setCode, isEditorReady]);

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  const convertTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-gray-200 rounded-lg overflow-hidden border border-gray-700">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
        {/* Language Selector */}
        <div className="w-40">
          <select
            value={language}
            onChange={handleLanguageChange}
            className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {Object.keys(boilerplateCode).map((lang) => (
              <option
                key={lang}
                value={lang}
                className="text-gray-200 bg-gray-800"
              >
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Timer */}
        <div className="flex items-center px-3 py-1.5 rounded-md bg-gray-700">
          <TimerOutlinedIcon className="w-5 h-5 mr-2 text-gray-400" />
          <span className="font-mono text-sm">{convertTime(time)}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={run}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors"
          >
            Run
          </button>
          <button
            onClick={submit}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors"
          >
            Submit
          </button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          theme="vs-dark"
          language={language}
          value={code}
          onChange={setCode}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: "on",
            automaticLayout: true,
          }}
          onMount={() => setIsEditorReady(true)}
          loading={
            <div className="flex items-center justify-center h-full bg-gray-900">
              <div className="text-gray-400">Loading editor...</div>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default EditorComponent;

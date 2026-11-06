import React, { useState, useRef } from "react";
import { Description } from "@mui/icons-material";
import Editor from "@monaco-editor/react";
import "./../../../Views/courseTopic/styling.css";

const FileEditor = ({
  files,
  activeFileIndex,
  onFileChange,
  onFileTabChange,
  Statement,
}) => {
  const editorRefs = useRef([]);
  const [selectedTab, setSelectedTab] = useState(0); // 0 = statement, 1+ = files

  const handleEditorDidMount = (editor, index) => {
    editorRefs.current[index] = editor;
  };

  const handleEditorChange = (value, index) => {
    const updatedFiles = [...files];
    updatedFiles[index] = { ...updatedFiles[index], content: value };
    onFileChange(updatedFiles);
  };

  const handleTabChange = (index) => {
    setSelectedTab(index);
    if (index > 0) {
      onFileTabChange(index - 1); // Adjust index for parent component
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#161f2e] rounded-lg overflow-hidden border border-gray-700 shadow-lg">
      {/* File Tabs */}
      <div className="border-b border-gray-700 bg-gray-750">
        <div className="flex overflow-x-auto scrollbar-thin">
          {/* Problem Statement Tab (always first) */}
          <button
            onClick={() => handleTabChange(0)}
            className={`px-3 py-2 flex items-center justify-center gap-2 border-b-2 transition-colors text-sm ${
              selectedTab === 0
                ? "border-purple-500 text-purple-400 bg-gray-800"
                : "border-transparent text-gray-400 hover:text-gray-300 hover:bg-gray-700"
            }`}
          >
            <Description className="text-purple-400" fontSize="small" />
            <p className="mt-0.5">Problem Statement</p>
          </button>

          {/* Regular File Tabs */}
          {files.map((file, index) => (
            <button
              key={index + 1}
              onClick={() => handleTabChange(index + 1)}
              className={`px-3 py-2 flex items-center gap-2 border-b-2 transition-colors text-sm ${
                selectedTab === index + 1
                  ? "border-blue-500 text-blue-400 bg-gray-800"
                  : "border-transparent text-gray-400 hover:text-gray-300 hover:bg-gray-700"
              }`}
            >
              <FileIcon active={selectedTab === index + 1} />
              <p className="mt-0.5">{file.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden bg-gray-900">
        {/* Problem Statement Content */}
        {selectedTab === 0 && (
          <div className="p-4 pt-8 text-gray-300 overflow-y-auto text-sm scoped-styles h-full">
            <div dangerouslySetInnerHTML={{ __html: Statement }} />
          </div>
        )}

        {/* Code Editors */}
        {files.map((file, index) => (
          <div
            key={index}
            className={`h-full ${
              selectedTab === index + 1 ? "block" : "hidden"
            }`}
          >
            <Editor
              height="100%"
              language={
                file.name.endsWith(".css")
                  ? "css"
                  : file.name.endsWith(".js")
                  ? "javascript"
                  : "html"
              }
              theme="vs-dark"
              path={file.name}
              value={file.content}
              onMount={(editor) => handleEditorDidMount(editor, index)}
              onChange={(value) => handleEditorChange(value, index)}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </div>
        ))}
      </div>

      {/* Status Bar */}
      <div className="px-2 py-1 bg-gray-800 border-t border-gray-700 flex justify-between items-center text-xs text-gray-400">
        <div className="flex items-center gap-1">
          {selectedTab === 0 ? (
            <Description className="text-purple-400 w-3.5 h-3.5" />
          ) : (
            <FileIcon active={true} />
          )}
          <span>
            {selectedTab === 0 ? "Statement.md" : files[selectedTab - 1]?.name}
          </span>
        </div>
        <div>
          <span className="px-1.5 py-0.5 bg-gray-700 rounded text-xs">
            {selectedTab === 0
              ? "Markdown"
              : files[selectedTab - 1]?.name.endsWith(".css")
              ? "CSS"
              : files[selectedTab - 1]?.name.endsWith(".js")
              ? "JavaScript"
              : "HTML"}
          </span>
        </div>
      </div>
    </div>
  );
};

const FileIcon = ({ active }) => (
  <svg
    className={`w-5 h-5 ${active ? "text-blue-400" : "text-gray-500"}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

export default FileEditor;

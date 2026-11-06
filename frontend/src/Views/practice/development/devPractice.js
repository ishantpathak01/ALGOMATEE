import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { getDevProblem, submitDevCode } from "../../../APIs/problem";
import Editor from "./../../../components/practice/development/editor";
import Preview from "./../../../components/practice/development/preview";
import Result from "./../../../components/practice/development/result";

import { Alarm, CheckCircle } from "@mui/icons-material";
import { useAppContext } from "../../../context/userContext";
import toast from "react-hot-toast";

function DevPractice({ data, setScore }) {
  const params = useParams();
  const { user } = useAppContext();
  const [problem, setProblem] = useState(null);
  const [files, setFiles] = useState([]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [splitPosition, setSplitPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [finished, setFinished] = useState(false);
  const [result, setResult] = useState();
  const timerRef = useRef(null);

  useEffect(() => {
    if (!data) {
      const getProblem = async () => {
        const res = await getDevProblem({
          Id: params?.problemId,
          UserType: "User",
        });
        if (res.status === 200) {
          setProblem(res.data);
          setFiles(res.data.Files);
        }
      };
      getProblem();
    } else {
      setProblem(data);
      setFiles(data.Files || []);
    }
  }, [params?.problemId, data]);

  useEffect(() => {
    if (!data) {
      timerRef.current = setInterval(() => {
        setTimeElapsed((prevTime) => prevTime + 1);
      }, 1000);

      return () => {
        clearInterval(timerRef.current);
      };
    }
  }, []);

  const handleFileChange = (index) => {
    setActiveFileIndex(index);
  };

  const handleFilesChange = (updatedFiles) => {
    setFiles(updatedFiles);
  };

  const handleMouseDown = () => {
    setIsDragging(true);
    document.body.style.cursor = "col-resize";
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const container = document.querySelector(".editor-preview-container");
    if (!container) return;
    const containerRect = container.getBoundingClientRect();
    const newPosition =
      ((e.clientX - containerRect.left) / containerRect.width) * 100;
    setSplitPosition(Math.min(Math.max(newPosition, 20), 80));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    document.body.style.cursor = "";
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging]);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    clearInterval(timerRef.current);
    if (!data) setFinished(true);
    toast.success("Your solution is submitted successfully.");
    setIsSubmitting(true);
    let res = await submitDevCode({
      Files: files,
      QuestionId: problem?._id,
    });
    if (res?.status == 200) {
      setResult(res?.data);
      if (data) setScore(res?.data?.Score);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${mins
        .toString()
        .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div>
      {!finished ? (
        <div className={`${!data && "pt-20"} h-screen flex flex-col`}>
          <div className="flex items-center justify-between px-4 py-3 bg-[#161e2e] text-gray-100 border-b border-slate-700">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-blue-400">
                {problem?.Name || "Problem"}
              </h1>
            </div>

            <div className="flex items-center space-x-6">
              {!data && (
                <div className="flex items-center space-x-2 bg-gray-700 px-3 py-1 rounded-md">
                  <Alarm className="text-yellow-400" />
                  <span className="font-mono text-lg">
                    {formatTime(timeElapsed)}
                  </span>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                  isSubmitting
                    ? "bg-gray-600 cursor-not-allowed text-gray-400"
                    : "bg-green-700 hover:bg-green-600 text-white"
                }`}
              >
                <CheckCircle className="mr-2" />
                {isSubmitting ? "Submitting..." : "Submit Solution"}
              </button>
            </div>
          </div>

          <div className="flex-1 editor-preview-container flex w-full bg-gray-900">
            <div
              className="h-full overflow-hidden border-r border-gray-700"
              style={{ width: `${splitPosition}%` }}
            >
              <Editor
                files={files}
                activeFileIndex={activeFileIndex}
                onFileChange={handleFilesChange}
                onFileTabChange={handleFileChange}
                Statement={problem?.Statement}
              />
            </div>

            <div
              className="w-2 bg-gray-700 hover:bg-blue-500 cursor-col-resize transition-colors"
              onMouseDown={handleMouseDown}
            />

            <div
              className="h-full overflow-hidden"
              style={{ width: `${100 - splitPosition}%` }}
            >
              <Preview files={files} activeFile={files[activeFileIndex]} />
            </div>
          </div>
        </div>
      ) : (
        <Result score={result?.Score} feedback={result?.Feedback} />
      )}
    </div>
  );
}

export default DevPractice;

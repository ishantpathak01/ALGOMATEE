import React, { useState, useEffect } from "react";
import { Resizable } from "re-resizable";
import Editor from "./../../../components/practice/coding/editor";
import ProblemStatement from "./../../../components/practice/coding/problemStatement";
import CustomTestcases from "./../../../components/practice/coding/testcases";
import { getCodingProblem, submitCode } from "../../../APIs/problem";
import { useLocation, useParams } from "react-router-dom";
import { useAppContext } from "./../../../context/userContext";
import toast from "react-hot-toast";
import { Skeleton } from "@mui/material";

const LeetCodeLikePage = () => {
  const [leftWidth, setLeftWidth] = useState(window.innerWidth * 0.5);
  const [topHeight, setTopHeight] = useState(window.innerHeight * 0.4);
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testcases, setTestcases] = useState([]);
  const [newTestcases, setNewTestcases] = useState([]);
  const [output, setOutput] = useState(null);
  const { state } = useLocation();
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("java");
  const assignment = state?.data;
  const Id = useParams().problemId;

  useEffect(() => {
    const getProblemStatement = async () => {
      setLoading(true);
      try {
        const res = await getCodingProblem({ Id });
        if (res.status == 200) {
          setProblem(res.data);
          setTestcases(res.data.Testcases || []);
        } else {
          console.error("Failed to fetch problem:", res?.message);
          toast.error("Failed to load problem");
        }
      } catch (error) {
        console.error("Error fetching problem:", error);
        toast.error("Error loading problem");
      } finally {
        setLoading(false);
      }
    };
    getProblemStatement();
  }, [Id]);

  const rightWidth = `calc(100% - ${leftWidth}px - 16px)`;

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please Login to submit your code.");
      return;
    }
    try {
      let res = await submitCode({
        Id: user?._id,
        QuestionId: problem._id,
        Code: code,
        Language: language,
        AssignmentId: assignment,
      });
      if (res.status == 200) {
        setOutput({ type: "Submit", ...res.data });
        toast.success(res?.message);
      } else {
        toast.error(res?.message);
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Submission failed");
    }
  };

  const handleRun = async () => {
    toast("Run functionality coming soon!", { icon: "🛠️" });
  };

  const { user } = useAppContext();

  return (
    <div className="h-screen w-full flex gap-4 p-4 pt-20 bg-gray-900 overflow-hidden">
      {/* Left Panel (Problem + Test Cases) */}
      <Resizable
        className="flex flex-col gap-4 rounded-lg shadow-xl  transition-all duration-200"
        size={{ width: leftWidth, height: "100%" }}
        enable={{
          right: true,
        }}
        minWidth={400}
        maxWidth="80%"
        onResizeStop={(e, direction, ref, d) => {
          setLeftWidth(leftWidth + d.width);
        }}
        handleStyles={{
          right: {
            width: "12px",
            right: "-6px",
            backgroundColor: "transparent",
            cursor: "col-resize",
          },
        }}
        handleClasses={{
          right: "resize-handle",
        }}
      >
        {/* Problem Statement */}
        <Resizable
          className="bg-gray-850 bg-gray-800 rounded-lg overflow-hidden border border-gray-700 transition-all duration-200"
          size={{ width: "100%", height: topHeight }}
          enable={{
            bottom: true,
          }}
          minHeight={200}
          maxHeight="70%"
          onResizeStop={(e, direction, ref, d) => {
            setTopHeight(topHeight + d.height);
          }}
          handleStyles={{
            bottom: {
              height: "12px",
              bottom: "-6px",
              backgroundColor: "transparent",
              cursor: "row-resize",
            },
          }}
          handleClasses={{
            bottom: "resize-handle",
          }}
        >
          <div className="h-full overflow-y-auto custom-scrollbar p-4">
            {loading ? (
              <div className="space-y-4">
                <Skeleton variant="text" width="60%" height={40} />
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={i} variant="text" width="100%" height={20} />
                ))}
              </div>
            ) : (
              <ProblemStatement
                name={problem?.Name}
                data={problem?.Statement}
              />
            )}
          </div>
        </Resizable>

        {/* Test Cases */}
        <div className="flex-1 bg-gray-800 rounded-lg overflow-hidden border border-gray-700 flex flex-col">
          {loading ? (
            <div className="p-4 space-y-2">
              <Skeleton variant="text" width="40%" height={30} />
              <Skeleton variant="rectangular" width="100%" height={100} />
            </div>
          ) : (
            <CustomTestcases
              testcases={testcases}
              newTestcases={newTestcases}
              setNewTestcases={setNewTestcases}
              output={output}
            />
          )}
        </div>
      </Resizable>

      {/* Right Panel (Editor) */}
      <div
        className="flex-1 bg-gray-850 rounded-lg shadow-xl overflow-hidden transition-all duration-200"
        style={{ width: rightWidth }}
      >
        <Editor
          run={handleRun}
          submit={handleSubmit}
          code={code}
          setCode={setCode}
          language={language}
          setLanguage={setLanguage}
          loading={loading}
        />
      </div>

      {/* Custom CSS for resize handles */}
      <style jsx>{`
        .resize-handle {
          transition: background-color 0.2s ease;
        }
        .resize-handle:hover,
        .resize-handle:active {
          background-color: rgba(99, 102, 241, 0.3) !important;
        }
        .resize-handle::after {
          content: "";
          position: absolute;
          width: 3px;
          height: 40px;
          background-color: rgba(167, 139, 250, 0.8);
          border-radius: 3px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        .resize-handle:hover::after,
        .resize-handle:active::after {
          opacity: 1;
        }
        .resize-handle.bottom::after {
          width: 40px;
          height: 3px;
        }
      `}</style>
    </div>
  );
};

export default LeetCodeLikePage;

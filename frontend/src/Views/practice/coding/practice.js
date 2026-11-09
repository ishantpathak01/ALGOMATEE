import React, { useState, useEffect } from "react";
import { Resizable } from "re-resizable";
import Editor from "./../../../components/practice/coding/editor";
import ProblemStatement from "./../../../components/practice/coding/problemStatement";
import CustomTestcases from "./../../../components/practice/coding/testcases";
import { getCodingProblem, submitCode } from "../../../APIs/problem";
import { executeCode } from "../../../utils/codeRunner";
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
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState("custom");
  const { state } = useLocation();
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const assignment = state?.data;
  const Id = useParams().problemId;
  const { user } = useAppContext();

  useEffect(() => {
    const getProblemStatement = async () => {
      setLoading(true);
      try {
        const res = await getCodingProblem({ Id });
        if (res && res.status == 200 && res.data) {
          setProblem(res.data);
          setTestcases(res.data.Testcases || []);
        } else {
          // Fallback sample question for mentor questions or offline mode
          const fallbackProblem = {
            _id: Id,
            Name: "Mentor DSA Problem: Subarray Sum & Two Pointers",
            Statement: `
              <h3>Problem Statement</h3>
              <p>Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to <code>target</code>.</p>
              <p>You may assume that each input would have exactly one solution, and you may not use the same element twice.</p>
              <br/>
              <h4>Example 1:</h4>
              <pre>Input: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].</pre>
            `,
            Testcases: [
              { input: "[2,7,11,15], target = 9", output: "[0,1]" },
              { input: "[3,2,4], target = 6", output: "[1,2]" },
              { input: "[3,3], target = 6", output: "[0,1]" },
            ],
          };
          setProblem(fallbackProblem);
          setTestcases(fallbackProblem.Testcases);
        }
      } catch (error) {
        console.error("Error fetching problem:", error);
      } finally {
        setLoading(false);
      }
    };
    getProblemStatement();
  }, [Id]);

  const rightWidth = `calc(100% - ${leftWidth}px - 16px)`;

  const handleSubmit = async () => {
    setIsRunning(true);
    toast.loading("Compiling & Submitting solution...", { id: "code-exec" });
    try {
      const res = await executeCode({
        code,
        language,
        testcases: [...testcases, ...newTestcases],
        problemId: problem?._id || Id,
        userId: user?._id,
        assignmentId: assignment,
        isSubmit: true,
      });

      setOutput(res);
      setActiveTab("result");
      if (res.passed === res.total) {
        toast.success(res.message || "Accepted! All test cases passed.", {
          id: "code-exec",
        });
      } else {
        toast.error(res.message || "Some test cases failed.", {
          id: "code-exec",
        });
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Submission failed: " + error.message, { id: "code-exec" });
    } finally {
      setIsRunning(false);
    }
  };

  const handleRun = async () => {
    setIsRunning(true);
    toast.loading("Running code in terminal...", { id: "code-exec" });
    try {
      const res = await executeCode({
        code,
        language,
        testcases: [...testcases, ...newTestcases],
        problemId: problem?._id || Id,
        userId: user?._id,
        isSubmit: false,
      });

      setOutput(res);
      setActiveTab("terminal");
      toast.success("Execution completed! Terminal output updated.", {
        id: "code-exec",
      });
    } catch (error) {
      console.error("Execution error:", error);
      toast.error("Execution error: " + error.message, { id: "code-exec" });
    } finally {
      setIsRunning(false);
    }
  };

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
              isRunning={isRunning}
              activeTab={activeTab}
              onTabChange={setActiveTab}
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

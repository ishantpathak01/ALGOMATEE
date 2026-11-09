import React, { useState, useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { Resizable } from "re-resizable";
import Editor from "./../../components/practice/coding/editor";
import ProblemStatement from "./../../components/practice/coding/problemStatement";
import CustomTestcases from "./../../components/practice/coding/testcases";
import { getContestById, submitContestProblem } from "../../APIs/contest";
import { executeCode } from "../../utils/codeRunner";
import { useAppContext } from "../../context/userContext";
import toast from "react-hot-toast";
import {
  Trophy,
  Clock,
  Code2,
  ExternalLink,
  ChevronLeft,
  Award,
  Sparkles,
  CheckCircle,
  XCircle,
  Users,
  X,
  LogOut
} from "lucide-react";

export default function ContestArena() {
  const { contestId } = useParams();
  const { user } = useAppContext();
  const [contest, setContest] = useState(null);
  const [activeProblemIndex, setActiveProblemIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTerminalTab, setActiveTerminalTab] = useState("custom");
  const [solvedProblemIds, setSolvedProblemIds] = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  
  // Contest Rules State
  const [hasStarted, setHasStarted] = useState(false);
  const [isDisqualified, setIsDisqualified] = useState(false);

  // Split-pane layout dimensions
  const [leftWidth, setLeftWidth] = useState(window.innerWidth * 0.48);
  const [topHeight, setTopHeight] = useState(window.innerHeight * 0.45);
  const rightWidth = `calc(100% - ${leftWidth}px - 16px)`;

  // Fetch contest details
  useEffect(() => {
    const fetchContest = async () => {
      setLoading(true);
      const res = await getContestById(contestId);
      if (res && res.data) {
        setContest(res.data);
      }
      setLoading(false);
    };
    fetchContest();
  }, [contestId]);

  // Handle Fullscreen & Disqualification Logic
  useEffect(() => {
    const disqualifiedKey = `disqualified_${contestId}_${user?._id || 'guest'}`;
    
    // 1. Check if they were previously disqualified
    if (localStorage.getItem(disqualifiedKey)) {
      setIsDisqualified(true);
    }

    // 2. Listen for exiting full screen
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && hasStarted) {
        // They exited full screen after starting! Disqualify them.
        localStorage.setItem(disqualifiedKey, "true");
        setIsDisqualified(true);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [hasStarted, contestId, user]);

  const handleStartContest = async () => {
    try {
      await document.documentElement.requestFullscreen();
      setHasStarted(true);
    } catch (err) {
      toast.error("Could not enable full screen. Please allow full screen to start.");
    }
  };

  const handleQuit = async () => {
    if (window.confirm("Are you sure you want to quit? You CANNOT rejoin later!")) {
      const disqualifiedKey = `disqualified_${contestId}_${user?._id || 'guest'}`;
      localStorage.setItem(disqualifiedKey, "true");
      setIsDisqualified(true);
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    }
  };

  const activeProblem = contest?.problems?.[activeProblemIndex] || {
    title: "Loading problem...",
    statement: "Loading problem details...",
    testcases: [],
  };

  const handleRun = async () => {
    setIsRunning(true);
    toast.loading("Running solution in terminal...", { id: "contest-exec" });
    try {
      const res = await executeCode({
        code,
        language,
        testcases: activeProblem.testcases || [],
        problemId: activeProblem._id || "contest_prob",
        userId: user?._id,
        isSubmit: false,
      });
      setOutput(res);
      setActiveTerminalTab("terminal");
      toast.success("Execution completed! Terminal updated.", {
        id: "contest-exec",
      });
    } catch (err) {
      toast.error("Execution error: " + err.message, { id: "contest-exec" });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    setIsRunning(true);
    toast.loading("Testing solution against contest test cases...", {
      id: "contest-exec",
    });
    try {
      const execRes = await executeCode({
        code,
        language,
        testcases: activeProblem.testcases || [],
        problemId: activeProblem._id,
        userId: user?._id,
        isSubmit: true,
      });

      setOutput(execRes);
      setActiveTerminalTab("result");

      if (execRes.passed === execRes.total) {
        // Record submission in contest
        await submitContestProblem(contestId, {
          problemId: activeProblem._id,
          code,
          language,
          userId: user?._id || "guest_" + Date.now(),
          userName: user?.Name || "Contestant",
        });

        if (!solvedProblemIds.includes(activeProblem._id)) {
          setSolvedProblemIds([...solvedProblemIds, activeProblem._id]);
          setTotalScore((prev) => prev + (activeProblem.points || 100));
        }

        toast.success(
          `🎉 Accepted! +${activeProblem.points || 100} Contest Points!`,
          { id: "contest-exec" }
        );
      } else {
        toast.error("Some test cases failed. Check terminal & testcases.", {
          id: "contest-exec",
        });
      }
    } catch (err) {
      toast.error("Submission error: " + err.message, { id: "contest-exec" });
    } finally {
      setIsRunning(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-950 text-white space-y-3 flex-col">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-400"></div>
        <p className="text-gray-400 text-sm">Entering Contest Arena...</p>
      </div>
    );
  }

  // Blocking Screen 1: Disqualified or Quit
  if (isDisqualified) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-950 text-white flex-col space-y-4">
        <XCircle className="w-16 h-16 text-red-500" />
        <h2 className="text-3xl font-bold text-red-400">Contest Terminated</h2>
        <p className="text-gray-400 max-w-md text-center">
          You have exited the contest or left full-screen mode. In accordance with the rules, you cannot rejoin this contest.
        </p>
        <Link to="/contests" className="px-6 py-2 mt-4 bg-blue-600 rounded-lg hover:bg-blue-700 transition font-bold">
          Back to Contests Hub
        </Link>
      </div>
    );
  }

  // Blocking Screen 2: Waiting to Start
  if (!hasStarted) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-950 text-white flex-col space-y-6 relative">
        <Link to="/contests" className="absolute top-6 left-6 flex items-center space-x-2 text-gray-400 hover:text-white">
            <ChevronLeft className="w-5 h-5"/> Back
        </Link>
        <Trophy className="w-20 h-20 text-yellow-500" />
        <h1 className="text-4xl font-bold text-center">{contest?.title || "Contest"}</h1>
        <div className="bg-gray-900 p-8 rounded-xl max-w-lg border border-gray-800 shadow-xl">
          <h3 className="text-xl font-semibold text-red-400 mb-4 flex items-center gap-2"><Sparkles className="w-5 h-5"/> Strict Contest Rules</h3>
          <ul className="list-disc list-inside text-gray-300 space-y-3 text-lg">
            <li>This contest requires <b>Full Screen</b> mode.</li>
            <li>If you press <kbd className="bg-gray-800 px-1 rounded">ESC</kbd>, switch tabs, or exit full screen, you will be <b>permanently disqualified</b>.</li>
            <li>You cannot pause or rejoin once started.</li>
          </ul>
        </div>
        <button 
          onClick={handleStartContest}
          className="px-10 py-4 bg-green-600 hover:bg-green-700 font-bold rounded-xl transition text-xl shadow-lg shadow-green-900/40"
        >
          I Agree, Start Contest
        </button>
      </div>
    );
  }

  // Main Arena
  return (
    <div className="h-screen w-full flex flex-col bg-gray-950 text-white overflow-hidden pt-16">
      {/* Contest Arena Top Bar */}
      <header className="h-14 px-4 bg-gray-900 border-b border-gray-800 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center space-x-3">
          <button
            onClick={handleQuit}
            className="flex items-center space-x-1 text-xs text-white px-2.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 transition-all border border-red-800"
            title="Quit Contest Permanently"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline font-bold">Quit Contest</span>
          </button>

          <div className="h-5 w-px bg-gray-800 hidden sm:block"></div>

          <div>
            <h1 className="text-sm font-bold text-white flex items-center space-x-2">
              <Trophy className="w-4 h-4 text-amber-400 inline" />
              <span>{contest?.title}</span>
            </h1>
          </div>
        </div>

        {/* Problems selector pills */}
        <div className="flex items-center space-x-1 overflow-x-auto max-w-md py-1">
          {contest?.problems?.map((prob, idx) => {
            const isSolved = solvedProblemIds.includes(prob._id);
            const isCurrent = activeProblemIndex === idx;
            return (
              <button
                key={prob._id || idx}
                onClick={() => {
                  setActiveProblemIndex(idx);
                  setOutput(null);
                }}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  isCurrent
                    ? "bg-blue-600 text-white shadow-md ring-1 ring-blue-400"
                    : "bg-gray-800/80 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700"
                }`}
              >
                <span>Q{idx + 1}</span>
                <span
                  className={`text-[9px] uppercase px-1 py-0.2 rounded font-bold ${
                    prob.source === "LeetCode"
                      ? "bg-amber-950 text-amber-300"
                      : prob.source === "GeeksForGeeks"
                      ? "bg-emerald-950 text-emerald-300"
                      : "bg-purple-950 text-purple-300"
                  }`}
                >
                  {prob.source === "LeetCode"
                    ? "LC"
                    : prob.source === "GeeksForGeeks"
                    ? "GFG"
                    : "Mentor"}
                </span>
                {isSolved && (
                  <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                )}
              </button>
            );
          })}
        </div>

        {/* Score & Leaderboard Trigger */}
        <div className="flex items-center space-x-3">
          <div className="hidden md:flex items-center space-x-1.5 px-3 py-1 bg-amber-950/40 border border-amber-800/60 rounded-xl text-amber-300 text-xs font-semibold">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Score: {totalScore} pts</span>
          </div>

          <button
            onClick={() => setShowLeaderboard(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/40 text-xs font-semibold transition-all shadow"
          >
            <Users className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Leaderboard</span>
          </button>
        </div>
      </header>

      {/* Main Workspace (Split pane) */}
      <div className="flex-1 flex gap-3 p-3 overflow-hidden">
        {/* Left Panel: Problem Statement & Test Cases / Terminal */}
        <Resizable
          className="flex flex-col gap-3 rounded-xl overflow-hidden transition-all duration-200"
          size={{ width: leftWidth, height: "100%" }}
          enable={{ right: true }}
          minWidth={360}
          maxWidth="75%"
          onResizeStop={(e, direction, ref, d) => {
            setLeftWidth(leftWidth + d.width);
          }}
          handleStyles={{
            right: {
              width: "10px",
              right: "-5px",
              backgroundColor: "transparent",
              cursor: "col-resize",
            },
          }}
        >
          {/* Problem Statement Box */}
          <Resizable
            className="bg-gray-900/90 rounded-xl overflow-hidden border border-gray-800 shadow-xl flex flex-col"
            size={{ width: "100%", height: topHeight }}
            enable={{ bottom: true }}
            minHeight={180}
            maxHeight="75%"
            onResizeStop={(e, direction, ref, d) => {
              setTopHeight(topHeight + d.height);
            }}
          >
            <div className="h-full overflow-y-auto custom-scrollbar p-5 space-y-4">
              {/* Problem Title & Source Badge */}
              <div className="flex items-start justify-between border-b border-gray-800 pb-3">
                <div>
                  <div className="flex items-center space-x-2 mb-1.5">
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        activeProblem.source === "LeetCode"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          : activeProblem.source === "GeeksForGeeks"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          : "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                      }`}
                    >
                      {activeProblem.source} Problem
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-300 font-medium">
                      {activeProblem.difficulty || "Medium"}
                    </span>
                    <span className="text-xs text-blue-400 font-mono font-semibold">
                      +{activeProblem.points || 100} pts
                    </span>
                  </div>
                  <h2 className="text-xl font-extrabold text-white">
                    {activeProblem.title}
                  </h2>
                </div>

                {/* External link for LeetCode / GFG */}
                {activeProblem.externalUrl && (
                  <a
                    href={activeProblem.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-xs text-blue-400 hover:text-blue-300 bg-gray-800/80 px-2.5 py-1.5 rounded-lg border border-gray-700 transition-all shrink-0"
                    title={`View problem on ${activeProblem.source}`}
                  >
                    <span>Original</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {/* Statement Content */}
              <div
                className="text-gray-300 text-sm leading-relaxed prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: activeProblem.statement }}
              />

              {/* Input / Output constraints */}
              {(activeProblem.inputFormat || activeProblem.outputFormat) && (
                <div className="space-y-2 pt-2 border-t border-gray-800 text-xs">
                  {activeProblem.inputFormat && (
                    <div>
                      <span className="font-bold text-gray-300">Input Format: </span>
                      <span className="text-gray-400 font-mono">
                        {activeProblem.inputFormat}
                      </span>
                    </div>
                  )}
                  {activeProblem.outputFormat && (
                    <div>
                      <span className="font-bold text-gray-300">Output Format: </span>
                      <span className="text-gray-400 font-mono">
                        {activeProblem.outputFormat}
                      </span>
                    </div>
                  )}
                  {activeProblem.constraints && (
                    <div>
                      <span className="font-bold text-gray-300">Constraints: </span>
                      <span className="text-gray-400 font-mono">
                        {activeProblem.constraints}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Mentor Hint */}
              {activeProblem.mentorHint && (
                <div className="p-3 bg-purple-950/30 border border-purple-800/50 rounded-xl text-xs text-purple-300 flex items-start space-x-2">
                  <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Mentor Hint: </span>
                    <span>{activeProblem.mentorHint}</span>
                  </div>
                </div>
              )}
            </div>
          </Resizable>

          {/* Bottom Box: Terminal & Test Cases */}
          <div className="flex-1 bg-gray-900/90 rounded-xl overflow-hidden border border-gray-800 flex flex-col shadow-xl">
            <CustomTestcases
              testcases={activeProblem.testcases || []}
              output={output}
              isRunning={isRunning}
              activeTab={activeTerminalTab}
              onTabChange={setActiveTerminalTab}
            />
          </div>
        </Resizable>

        {/* Right Panel: Code Editor */}
        <div
          className="flex-1 bg-gray-900 rounded-xl shadow-2xl overflow-hidden border border-gray-800 flex flex-col"
          style={{ width: rightWidth }}
        >
          <Editor
            run={handleRun}
            submit={handleSubmit}
            code={code}
            setCode={setCode}
            language={language}
            setLanguage={setLanguage}
            loading={isRunning}
          />
        </div>
      </div>

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center space-x-2">
                <Trophy className="w-6 h-6 text-amber-400" />
                <h3 className="text-lg font-bold text-white">
                  Contest Leaderboard
                </h3>
              </div>
              <button
                onClick={() => setShowLeaderboard(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
              {(contest?.leaderboard || []).map((entry, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-3 rounded-xl border text-sm ${
                    idx === 0
                      ? "bg-amber-950/20 border-amber-800/60"
                      : idx === 1
                      ? "bg-slate-800/40 border-slate-700/60"
                      : "bg-gray-950 border-gray-800"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span
                      className={`w-6 text-center font-bold font-mono ${
                        idx === 0
                          ? "text-amber-400 text-lg"
                          : idx === 1
                          ? "text-slate-300"
                          : idx === 2
                          ? "text-amber-600"
                          : "text-gray-500"
                      }`}
                    >
                      #{idx + 1}
                    </span>
                    <img
                      src={
                        entry.avatar ||
                        `https://api.dicebear.com/7.x/bottts/svg?seed=${entry.userName}`
                      }
                      alt={entry.userName}
                      className="w-8 h-8 rounded-full border border-gray-700 bg-gray-800"
                    />
                    <div>
                      <p className="font-semibold text-white">
                        {entry.userName}
                      </p>
                      <p className="text-[11px] text-gray-400">
                        {entry.problemsSolved || 0} Solved · {entry.finishTimeMinutes || 30}m
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-emerald-400 text-base">
                      {entry.score} pts
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={() => setShowLeaderboard(false)}
                className="px-6 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold transition-all"
              >
                Close Leaderboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

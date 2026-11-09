import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Terminal, CheckCircle, XCircle, Play, Cpu, Clock } from "lucide-react";

function Testcases({
  testcases = [],
  newTestcases = [],
  setNewTestcases,
  output,
  isRunning = false,
  activeTab: controlledTab,
  onTabChange,
}) {
  const [internalTab, setInternalTab] = useState("custom");
  const activeTab = controlledTab || internalTab;
  const setActiveTab = (tab) => {
    if (onTabChange) onTabChange(tab);
    setInternalTab(tab);
  };

  const [selectedTestcase, setSelectedTestcase] = useState(0);

  const {
    passed = 0,
    failed = 0,
    error = false,
    message = "",
    runtime = "32 ms",
    memory = "18.4 MB",
    results = [],
    output: stdout = "",
  } = output || {};

  const total = passed + failed;
  const passPercentage = total > 0 ? (passed / total) * 100 : 0;
  const MAX_CUSTOM_TESTS = 6;
  const allTestcases = [...testcases, ...newTestcases];

  // Auto-switch to results or terminal when output arrives
  useEffect(() => {
    if (output) {
      if (output.type === "Run") {
        setActiveTab("terminal");
      } else if (output.type === "Submit") {
        setActiveTab("result");
      }
    }
  }, [output]);

  const handleAddTestcase = () => {
    if (allTestcases.length >= MAX_CUSTOM_TESTS) {
      toast.error(`Maximum ${MAX_CUSTOM_TESTS} test cases allowed`);
      return;
    }
    setNewTestcases([...newTestcases, { input: "", output: "" }]);
    setSelectedTestcase(allTestcases.length);
    toast.success("Added new custom testcase");
  };

  const handleInputChange = (e) => {
    const index = selectedTestcase - testcases.length;
    setNewTestcases((prev) => {
      const updated = [...prev];
      if (updated[index]) updated[index].input = e.target.value;
      return updated;
    });
  };

  const tabs = [
    { id: "custom", label: "Test Cases", icon: Play },
    { id: "terminal", label: "Terminal / Console", icon: Terminal },
    { id: "result", label: "Results", icon: CheckCircle },
  ];

  return (
    <div className="h-full flex flex-col p-4 text-gray-200 bg-gray-900/90 rounded-lg border border-gray-700/60 font-sans">
      {/* Tab Navigation */}
      <div className="flex items-center justify-between border-b border-gray-700 mb-3 pb-1">
        <div className="flex space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-t-md text-xs md:text-sm font-medium transition-all ${
                  isActive
                    ? "bg-gray-800 text-blue-400 border-b-2 border-blue-400 shadow"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.id === "result" && output && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 text-[10px] rounded-full font-bold ${
                      failed === 0 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {passed}/{total || 1}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {isRunning && (
          <div className="flex items-center space-x-2 text-xs text-blue-400 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            <span>Running code...</span>
          </div>
        )}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* TAB 1: TEST CASES */}
        {activeTab === "custom" && (
          <div className="space-y-4">
            {/* Testcase selector pills */}
            <div className="flex flex-wrap gap-2 items-center">
              {allTestcases.map((tc, index) => {
                const res = results[index];
                const hasResult = res !== undefined;
                return (
                  <button
                    key={index}
                    className={`flex items-center space-x-1 px-3 py-1 rounded-md text-xs md:text-sm transition-all ${
                      selectedTestcase === index
                        ? "bg-blue-600 text-white font-semibold ring-2 ring-blue-400"
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700"
                    }`}
                    onClick={() => setSelectedTestcase(index)}
                  >
                    <span>Test {index + 1}</span>
                    {hasResult && (
                      <span className="ml-1">
                        {res.passed ? (
                          <CheckCircle className="w-3.5 h-3.5 text-green-400 inline" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-red-400 inline" />
                        )}
                      </span>
                    )}
                    {index >= testcases.length && (
                      <span className="text-[10px] opacity-70 ml-1 text-amber-300">
                        (custom)
                      </span>
                    )}
                  </button>
                );
              })}

              <button
                className="px-3 py-1 rounded-md bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-medium flex items-center gap-1 transition-all"
                onClick={handleAddTestcase}
                disabled={allTestcases.length >= MAX_CUSTOM_TESTS}
              >
                <span>+ Add</span>
                <span className="text-[11px] opacity-80">
                  ({MAX_CUSTOM_TESTS - allTestcases.length} left)
                </span>
              </button>
            </div>

            {/* Testcase Input display */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span>Testcase Input:</span>
                {selectedTestcase < testcases.length && (
                  <span className="text-gray-500 italic">
                    Mentor default testcase (read-only)
                  </span>
                )}
              </div>
              <textarea
                rows={3}
                disabled={selectedTestcase < testcases.length}
                className={`w-full p-2.5 rounded-lg bg-gray-950 font-mono text-sm border focus:outline-none transition-all ${
                  selectedTestcase < testcases.length
                    ? "border-gray-800 text-gray-300 cursor-not-allowed"
                    : "border-gray-700 text-white focus:border-blue-500"
                }`}
                placeholder="Enter test case input"
                value={
                  selectedTestcase < testcases.length
                    ? testcases[selectedTestcase]?.input || ""
                    : newTestcases[selectedTestcase - testcases.length]?.input || ""
                }
                onChange={handleInputChange}
              />
            </div>

            {/* Expected Output if available */}
            {allTestcases[selectedTestcase]?.output && (
              <div className="space-y-1">
                <span className="text-xs text-gray-400">Expected Output:</span>
                <pre className="p-2.5 rounded-lg bg-gray-950/80 border border-gray-800 text-emerald-400 font-mono text-xs overflow-x-auto">
                  {allTestcases[selectedTestcase]?.output}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TERMINAL / CONSOLE OUTPUT */}
        {activeTab === "terminal" && (
          <div className="h-full flex flex-col font-mono text-xs">
            <div className="bg-black/90 border border-gray-800 rounded-lg p-3 flex-1 overflow-y-auto space-y-2 shadow-inner">
              <div className="flex items-center justify-between text-gray-500 pb-2 border-b border-gray-800/80">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block"></span>
                  <span className="ml-2 text-gray-400">algomate-terminal ~ code-runner</span>
                </div>
                {runtime && (
                  <span className="text-emerald-400 flex items-center space-x-1">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {runtime}
                  </span>
                )}
              </div>

              {isRunning ? (
                <div className="py-8 flex flex-col items-center justify-center text-gray-400 space-y-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
                  <p>Compiling and executing code in terminal sandbox...</p>
                </div>
              ) : output ? (
                <div className="space-y-2 pt-1">
                  <div className="text-gray-500">$ ./solution.run --testcases</div>
                  {stdout && (
                    <div className="text-gray-200 whitespace-pre-wrap leading-relaxed pl-2 border-l-2 border-blue-500/40">
                      {stdout}
                    </div>
                  )}

                  {results && results.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-gray-800/80 space-y-1.5">
                      <div className="text-gray-400 font-semibold mb-1">
                        Execution Evaluation:
                      </div>
                      {results.map((r, i) => (
                        <div
                          key={i}
                          className={`flex items-start justify-between p-2 rounded text-[11px] ${
                            r.passed
                              ? "bg-green-950/30 text-green-300 border border-green-900/50"
                              : "bg-red-950/30 text-red-300 border border-red-900/50"
                          }`}
                        >
                          <div>
                            <span className="font-bold mr-2">
                              Test #{r.testIndex}:
                            </span>
                            <span>{r.passed ? "PASSED" : "FAILED"}</span>
                            {r.expectedOutput && (
                              <div className="text-gray-400 text-[10px] mt-0.5">
                                Exp: <span className="text-gray-300">{r.expectedOutput}</span> | Got:{" "}
                                <span className={r.passed ? "text-green-300" : "text-red-300"}>
                                  {r.actualOutput}
                                </span>
                              </div>
                            )}
                          </div>
                          <span>{r.passed ? "✓" : "✗"}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-2 text-gray-500">
                    ----------------------------------------
                    <br />
                    Process finished with exit code {failed === 0 ? "0" : "1"} · Memory:{" "}
                    {memory}
                  </div>
                </div>
              ) : (
                <div className="py-10 text-center text-gray-500 space-y-2">
                  <Terminal className="w-8 h-8 mx-auto opacity-40 text-blue-400" />
                  <p>Click "Run" to execute your code and view terminal logs here.</p>
                  <p className="text-[11px] text-gray-600">
                    Supports console.log output, runtime errors, and testcase diffs.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: RESULTS SUMMARY */}
        {activeTab === "result" && (
          <div className="space-y-4">
            {output ? (
              <>
                {/* Result header banner */}
                <div
                  className={`p-4 rounded-xl border flex items-center justify-between ${
                    failed === 0
                      ? "bg-green-950/40 border-green-800 text-green-300"
                      : "bg-red-950/40 border-red-800 text-red-300"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {failed === 0 ? (
                      <CheckCircle className="w-7 h-7 text-green-400" />
                    ) : (
                      <XCircle className="w-7 h-7 text-red-400" />
                    )}
                    <div>
                      <h3 className="font-bold text-base">
                        {failed === 0 ? "Accepted" : "Wrong Answer"}
                      </h3>
                      <p className="text-xs opacity-90">{message}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-xs font-mono">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 opacity-70" />
                      <span>{runtime}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Cpu className="w-3.5 h-3.5 opacity-70" />
                      <span>{memory}</span>
                    </div>
                  </div>
                </div>

                {/* Score stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-green-900/20 border border-green-800/60">
                    <p className="text-green-400 text-xs font-medium">Passed Testcases</p>
                    <p className="text-2xl font-bold text-white mt-1">{passed}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-red-900/20 border border-red-800/60">
                    <p className="text-red-400 text-xs font-medium">Failed Testcases</p>
                    <p className="text-2xl font-bold text-white mt-1">{failed}</p>
                  </div>
                </div>

                {/* Success Rate Bar */}
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Testcase Success Rate</span>
                    <span className="font-bold text-white">{Math.round(passPercentage)}%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden border border-gray-700">
                    <div
                      className={`h-full transition-all duration-500 ${
                        failed === 0 ? "bg-green-500" : "bg-amber-500"
                      }`}
                      style={{ width: `${passPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Detailed Breakdown */}
                {results && results.length > 0 && (
                  <div className="space-y-2 mt-4">
                    <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                      Test Case Details
                    </h4>
                    {results.map((r, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-lg bg-gray-950 border border-gray-800 text-xs font-mono space-y-1"
                      >
                        <div className="flex justify-between">
                          <span className="font-bold text-gray-300">
                            Testcase #{r.testIndex}
                          </span>
                          <span
                            className={r.passed ? "text-green-400 font-bold" : "text-red-400 font-bold"}
                          >
                            {r.passed ? "Passed ✓" : "Failed ✗"}
                          </span>
                        </div>
                        <div className="text-gray-400 text-[11px]">
                          Input: <span className="text-gray-200">{r.input || "(empty)"}</span>
                        </div>
                        {r.expectedOutput && (
                          <div className="text-gray-400 text-[11px]">
                            Expected: <span className="text-emerald-300">{r.expectedOutput}</span>
                          </div>
                        )}
                        <div className="text-gray-400 text-[11px]">
                          Output:{" "}
                          <span className={r.passed ? "text-green-300" : "text-red-300"}>
                            {r.actualOutput}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500 space-y-2">
                <CheckCircle className="w-8 h-8 opacity-40 text-gray-400" />
                <p className="text-sm">No execution results yet.</p>
                <p className="text-xs text-gray-600">
                  Run or submit your solution to view evaluation results.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Testcases;

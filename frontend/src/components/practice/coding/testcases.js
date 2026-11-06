import React, { useState } from "react";
import toast from "react-hot-toast";

function Testcases({ testcases, newTestcases, setNewTestcases, output }) {
  const [activeTab, setActiveTab] = useState("custom");
  const [selectedTestcase, setSelectedTestcase] = useState(0);

  const { passed = 0, failed = 0, error = false, message = "" } = output || {};
  const total = passed + failed;
  const passPercentage = total > 0 ? (passed / total) * 100 : 0;
  const MAX_CUSTOM_TESTS = 6;
  const allTestcases = [...testcases, ...newTestcases];

  const handleAddTestcase = () => {
    if (allTestcases.length >= MAX_CUSTOM_TESTS) {
      toast.error(`Maximum ${MAX_CUSTOM_TESTS} test cases allowed`);
      return;
    }
    setNewTestcases([...newTestcases, { input: "" }]);
    setSelectedTestcase(allTestcases.length);
  };

  const handleInputChange = (e) => {
    const index = selectedTestcase - testcases.length;
    setNewTestcases((prev) => {
      const updated = [...prev];
      if (updated[index]) updated[index].input = e.target.value;
      return updated;
    });
  };

  return (
    <div className="h-full flex flex-col p-4 text-gray-200  rounded-lg">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-700 mb-4">
        {[
          { id: "custom", label: "Test Cases" },
          { id: "result", label: "Results" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === tab.id
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "custom" ? (
          <div className="space-y-4">
            {/* Testcase Selector */}
            <div className="flex flex-wrap gap-2">
              {allTestcases.map((_, index) => (
                <button
                  key={index}
                  className={`px-3 py-1 rounded-md text-sm ${
                    selectedTestcase === index
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                  onClick={() => setSelectedTestcase(index)}
                >
                  Test {index + 1}
                  {index >= testcases.length && (
                    <span className="ml-1 text-xs opacity-70">(custom)</span>
                  )}
                </button>
              ))}

              <button
                className="px-3 py-1 rounded-md bg-green-600 text-white text-sm flex items-center gap-1 hover:bg-green-700"
                onClick={handleAddTestcase}
                disabled={allTestcases.length >= MAX_CUSTOM_TESTS}
              >
                <span>+ Add</span>
                <span className="text-xs opacity-80">
                  ({MAX_CUSTOM_TESTS - allTestcases.length} left)
                </span>
              </button>
            </div>

            {/* Testcase Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Input
              </label>
              <input
                disabled={selectedTestcase < testcases.length}
                className={`w-full p-2 rounded bg-gray-800 border focus:outline-none ${
                  selectedTestcase < testcases.length
                    ? "border-gray-700 text-gray-500"
                    : "border-gray-600 text-white focus:border-blue-500"
                }`}
                placeholder="Enter test case input"
                value={
                  selectedTestcase < testcases.length
                    ? testcases[selectedTestcase]?.input
                    : newTestcases[selectedTestcase - testcases.length]
                        ?.input || ""
                }
                onChange={handleInputChange}
              />
              {selectedTestcase < testcases.length && (
                <p className="text-xs text-gray-500 mt-1">
                  Default test cases cannot be modified
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {output ? (
              <>
                {error ? (
                  <div className="p-3 bg-red-900/20 rounded border border-red-700">
                    <h3 className="text-red-400 font-medium">Error</h3>
                    <p className="text-sm text-red-300 mt-1">{message}</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded bg-green-900/20 border border-green-800">
                        <p className="text-green-400 text-sm">Passed</p>
                        <p className="text-xl font-bold">{passed}</p>
                      </div>
                      <div className="p-3 rounded bg-red-900/20 border border-red-800">
                        <p className="text-red-400 text-sm">Failed</p>
                        <p className="text-xl font-bold">{failed}</p>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Success Rate</span>
                        <span>{Math.round(passPercentage)}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full bg-green-500"
                          style={{ width: `${passPercentage}%` }}
                        />
                      </div>
                    </div>

                    {message && (
                      <div className="p-3 rounded bg-gray-800 border border-gray-700">
                        <p className="text-sm text-gray-300">{message}</p>
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                <svg
                  className="w-10 h-10 mb-2 opacity-60"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-sm">No execution results yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Testcases;

import { runCode as apiRunCode, submitCode as apiSubmitCode } from "../APIs/problem";

/**
 * Sends code to the AlgoMate server, which really compiles & runs it.
 * No fake/local "simulated" results: if the server fails, the error is shown.
 */
export const executeCode = async ({
  code,
  language = "javascript",
  testcases = [],
  problemId = "",
  userId = "",
  assignmentId = "",
  isSubmit = false,
}) => {
  const fail = (message) => ({
    success: false,
    type: isSubmit ? "Submit" : "Run",
    passed: 0,
    failed: testcases.length || 1,
    total: testcases.length || 1,
    results: [],
    output: message,
    error: true,
    message,
  });

  try {
    const serverRes = isSubmit
      ? await apiSubmitCode({
          Id: userId,
          QuestionId: problemId,
          Code: code,
          Language: language,
          AssignmentId: assignmentId,
          Testcases: testcases,
        })
      : await apiRunCode({
          Language: language,
          Code: code,
          Testcases: testcases,
          QuestionId: problemId,
        });

    if (!serverRes) return fail("Could not reach the server. Is it running?");
    if (serverRes.status !== 200 || !serverRes.data) return fail(serverRes.message || "Execution failed");
    return {
      success: true,
      type: isSubmit ? "Submit" : "Run",
      ...serverRes.data,
      message: serverRes.message,
    };
  } catch (err) {
    return fail(err.message || "Execution failed");
  }
};

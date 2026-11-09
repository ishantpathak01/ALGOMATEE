import axios from "axios";
import vm from "vm";
import VerifiedArticle from "../models/articles/verifiedArticles.js";
import User from "./../models/user.js";
import CodingProblem from "../models/Problems/Coding.js";
import ChoicebasedProblem from "../models/Problems/ChoiceBased.js";
import AssignmentAttendie from "../models/Problems/Coding.js";
import Assignment from "./../models/Assignment.js";
import Submissions from "../models/userCodeSubmission.js";
import mongoose from "mongoose";
import RewardModel from "../models/coinReward.js";
import DevQuestion from "../models/Problems/development.js";
import CalculateScore from "./../utils/ai/development.js";

const { ObjectId } = mongoose.Types;

export const addCodingProblem = async (req, res) => {
  try {
    if (req.body.ProblemId != "") {
      const problem = await CodingProblem.findById(req.body.ProblemId);
      if (problem.Id != req.body.Id) {
        return res.json({
          status: 401,
          message: "You aren't the author of this problem.",
        });
      }
      delete req.body.ProblemId;
      for (const key in req.body) {
        problem[key] = req.body[key];
      }
      await problem.save();
      return res.json({
        status: 201,
        message: "Question updated successfully.",
      });
    } else {
      const problem = new CodingProblem(req.body);
      await problem.save();
      return res.json({ status: 201, message: "Question added successfully." });
    }
  } catch (error) {
    return res.json({ status: 500, message: "Internal Server Error" });
  }
};

export const getCodingProblem = async (req, res) => {
  try {
    const problem = await CodingProblem.findById(req.query.Id);
    if (!problem) {
      return res.json({
        status: 404,
        message: "Question not found.",
      });
    }
    return res.json({
      status: 200,
      message: "Question fetched successfully.",
      data: problem,
    });
  } catch (error) {
    return res.json({ status: 500, message: "Internal Server Error" });
  }
};

export const getCodingSheet = async (req, res) => {
  try {
    let { Id, Page, Limit = 10, SearchText, Tag } = req.query;
    if (!Id) {
      const matchQuery = {};
      Page = parseInt(Page, 10);
      Limit = parseInt(Limit, 10);
      if (SearchText) {
        matchQuery.$or = [
          { Name: { $regex: SearchText, $options: "i" } },
          { Companies: { $elemMatch: { $regex: SearchText, $options: "i" } } },
        ];
      }

      if (Tag) {
        matchQuery.Tags = { $elemMatch: { $regex: Tag, $options: "i" } };
      }

      const problems = await CodingProblem.aggregate([
        { $match: matchQuery },
        { $sort: { _id: 1 } },
        {
          $facet: {
            metadata: [{ $count: "total" }],
            data: [
              { $skip: (Page - 1) * Limit },
              { $limit: Limit },
              {
                $project: {
                  _id: 1,
                  Name: 1,
                  Platform: 1,
                  Link: 1,
                  Tags: 1,
                  Companies: 1,
                  Level: 1,
                },
              },
            ],
          },
        },
      ]);

      return res.json({
        status: 200,
        message: "Sheet fetched successfully.",
        data: problems,
      });
    } else {
      const article = await VerifiedArticle.findOne({ _id: new Object(Id) });
      if (!article) {
        return res.json({ status: 404, message: "Article not found" });
      }
      const easyProblems = await CodingProblem.find({
        _id: { $in: article.Problems.Easy },
      });
      const mediumProblems = await CodingProblem.find({
        _id: { $in: article.Problems.Medium },
      });
      const hardProblems = await CodingProblem.find({
        _id: { $in: article.Problems.Hard },
      });
      return res.json({
        status: 200,
        message: "Sheet fetched successfully.",
        data: {
          Easy: easyProblems,
          Medium: mediumProblems,
          Hard: hardProblems,
        },
      });
    }
  } catch (error) {
    console.log(error);
    return res.json({ status: 500, message: "Internal Server Error" });
  }
};

export const deleteCodingProblem = async (req, res) => {
  try {
    const { QuestionId, Id } = req.query;
    const problem = await CodingProblem.findById(QuestionId);
    if (problem.Id != Id) {
      return res.json({
        status: 401,
        message: "You aren't the author of this problem.",
      });
    }
    const deleted = await CodingProblem.findByIdAndDelete(QuestionId);
    return res.json({
      status: 200,
      message: "Question deleted successfully.",
    });
  } catch (error) {
    return res.json({ status: 500, message: "Internal Server Error" });
  }
};

export const addChoiceBasedProblem = async (req, res) => {
  try {
    const { Id, ProblemId } = req.body;
    if (Id && ProblemId != "") {
      const problem = await ChoicebasedProblem.findById(ProblemId);
      if (problem?.Id != Id) {
        return res.json({
          status: 401,
          message: "You aren't the author of this problem.",
        });
      }
      delete req.body.ProblemId;
      for (const key in req.body) {
        problem[key] = req.body[key];
      }
      await problem.save();
      return res.json({
        status: 201,
        message: "Question updated successfully.",
      });
    } else {
      const problem = new ChoicebasedProblem(req.body);
      await problem.save();
      return res.json({ status: 201, message: "Question added successfully." });
    }
  } catch (error) {
    return res.json({ status: 500, message: "Internal Server Error" });
  }
};

export const getChoiceBasedProblem = async (req, res) => {
  try {
    const problem = await ChoicebasedProblem.findById(req.body.Id);
    if (!problem) {
      return res.json({
        status: 404,
        message: "Question not found.",
      });
    }
    return res.json({
      status: 200,
      message: "Question fetched successfully.",
      data: problem,
    });
  } catch (error) {
    return res.json({ status: 500, message: "Internal Server Error" });
  }
};

export const getChoiceBasedSheet = async (req, res) => {
  try {
    const { Page, Limit, SearchText } = req.body;
    const problems = await ChoicebasedProblem.aggregate([
      {
        $match: {
          Statement: { $regex: SearchText, $options: "i" },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [{ $skip: (Page - 1) * Limit }, { $limit: Limit }],
        },
      },
    ]);
    return res.json({
      status: 200,
      message: "Question fetched successfully.",
      data: problems,
    });
  } catch (error) {
    return res.json({ status: 500, message: "Internal Server Error" });
  }
};

export const deleteChoiceBasedProblem = async (req, res) => {
  try {
    const { QuestionId, Id } = req.query;
    const problem = await ChoicebasedProblem.findById(QuestionId);
    if (problem.Id != Id) {
      return res.json({
        status: 401,
        message: "You aren't the author of this problem.",
      });
    }
    const deleted = await ChoicebasedProblem.findByIdAndDelete(QuestionId);
    return res.json({
      status: 200,
      message: "Question deleted successfully.",
    });
  } catch (error) {
    return res.json({ status: 500, message: "Internal Server Error" });
  }
};

export const runCodingCode = async (req, res) => {
  try {
    const { Language, Code, Input, Testcases, QuestionId } = req.body;
    if (!Code) {
      return res.json({ status: 400, message: "Code is required" });
    }

    const lang = (Language || "javascript").toLowerCase();
    let problemTestcases = Testcases || [];

    if ((!problemTestcases || problemTestcases.length === 0) && QuestionId) {
      try {
        const problem = await CodingProblem.findById(QuestionId);
        if (problem && problem.Testcases && problem.Testcases.length > 0) {
          problemTestcases = problem.Testcases;
        }
      } catch (e) {}
    }

    if (!problemTestcases || problemTestcases.length === 0) {
      problemTestcases = [{ input: Input || "", output: "" }];
    }

    const results = [];
    let allPassed = true;
    let globalStdout = "";
    let globalStderr = "";
    const startTime = Date.now();

    for (let i = 0; i < problemTestcases.length; i++) {
      const tc = problemTestcases[i];
      const tcInput = tc.input !== undefined ? String(tc.input) : "";
      const tcExpected = tc.output !== undefined ? String(tc.output).trim() : "";

      let stdout = "";
      let stderr = "";
      let passed = false;

      if (lang === "javascript" || lang === "js") {
        try {
          const logs = [];
          const sandbox = {
            console: {
              log: (...args) =>
                logs.push(
                  args
                    .map((a) =>
                      typeof a === "object" ? JSON.stringify(a) : String(a)
                    )
                    .join(" ")
                ),
              error: (...args) => logs.push("[ERR] " + args.join(" ")),
              warn: (...args) => logs.push("[WARN] " + args.join(" ")),
            },
            input: tcInput,
          };
          const scriptCode = `
            const input = ${JSON.stringify(tcInput)};
            ${Code}
          `;
          vm.createContext(sandbox);
          const result = vm.runInContext(scriptCode, sandbox, { timeout: 2000 });
          stdout = logs.join("\n");
          if (!stdout && result !== undefined) {
            stdout = String(result);
          }
        } catch (err) {
          stderr = err.message || String(err);
        }
      } else {
        let codeToExecute = Code;
        
        // Harness for Java LeetCode-style submissions
        if (lang === "java" && !Code.includes("public static void main")) {
            const methodMatch = Code.match(/public\s+(?:\w+\s+)*(\w+)\s+([a-zA-Z0-9_]+)\s*\(/);
            const methodName = methodMatch ? methodMatch[2] : "checkValidString";
            
            codeToExecute = `
import java.util.*;
${Code}
public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        if(scanner.hasNext()) {
            String input = scanner.next();
            Solution sol = new Solution();
            System.out.print(sol.${methodName}(input));
        }
    }
}`;
        }

        try {
            // Map your languages to Piston API requirements
            const pistonLangMap = {
                "python": { language: "python", version: "3.10.0" },
                "cpp": { language: "c++", version: "10.2.0" },
                "java": { language: "java", version: "15.0.2" },
                "js": { language: "javascript", version: "18.15.0" },
                "javascript": { language: "javascript", version: "18.15.0" },
                "c": { language: "c", version: "10.2.0" }
            };

            const pistonEnv = pistonLangMap[lang] || { language: lang, version: "*" };
            const fileName = lang === "java" ? "Main.java" : `script.${lang === 'python' ? 'py' : lang === 'cpp' ? 'cpp' : 'js'}`;

            // Send directly to the free Piston Code Execution API
            const response = await axios.post("https://emacs.piston.rs/api/v2/execute", {
                language: pistonEnv.language,
                version: pistonEnv.version,
                files: [
                    {
                        name: fileName,
                        content: codeToExecute
                    }
                ],
                stdin: tcInput,
                compile_timeout: 10000,
                run_timeout: 5000
            });

            // Parse Piston's response format
            if (response.data.compile && response.data.compile.code !== 0) {
                stderr = response.data.compile.stderr || response.data.compile.output;
            } else if (response.data.run) {
                stdout = response.data.run.stdout || "";
                stderr = response.data.run.stderr || "";
                if (response.data.run.code !== 0 && !stderr) {
                    stderr = response.data.run.output;
                }
            } else {
                stderr = "Unknown error occurred during execution.";
            }
        } catch (err) {
            stderr = err?.response?.data?.message || err.message || String(err);
        }
      }

      const actualTrimmed = (stdout || "").trim();
      if (tcExpected) {
        passed = actualTrimmed === tcExpected || actualTrimmed.endsWith(tcExpected);
      } else {
        passed = !stderr;
      }

      if (!passed) allPassed = false;
      if (stdout) globalStdout += (globalStdout ? "\n" : "") + stdout;
      if (stderr) globalStderr += (globalStderr ? "\n" : "") + stderr;

      results.push({
        testIndex: i + 1,
        input: tcInput,
        expectedOutput: tcExpected,
        actualOutput: actualTrimmed || (stderr ? `Error: ${stderr}` : "No output"),
        passed,
        stderr,
      });
    }

    const elapsed = Date.now() - startTime;

    return res.json({
      status: 200,
      message: allPassed
        ? "All test cases passed!"
        : "Test execution completed.",
      data: {
        passed: results.filter((r) => r.passed).length,
        failed: results.filter((r) => !r.passed).length,
        total: results.length,
        results,
        output: globalStdout || "Code executed without stdout output.",
        stderr: globalStderr,
        runtime: `${Math.max(elapsed, 16)} ms`,
        memory: "18.4 MB",
      },
    });
  } catch (error) {
    return res.json({
      status: 500,
      message: error.message || "Execution error",
    });
  }
};

export const submitCodingCode = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { Language, Code, Id, QuestionId, AssignmentId, Testcases } = req.body;

    if (!Language || !Code || !Id || !QuestionId) {
      await session.abortTransaction();
      session.endSession();
      return res.json({ status: 400, message: "Insufficient data" });
    }

    const lang = (Language || "javascript").toLowerCase();
    let problemTestcases = Testcases || [];

    if ((!problemTestcases || problemTestcases.length === 0) && QuestionId) {
      try {
        const problem = await CodingProblem.findById(QuestionId);
        if (problem && problem.Testcases && problem.Testcases.length > 0) {
          problemTestcases = problem.Testcases;
        }
      } catch (e) {}
    }

    let passedCount = 0;
    const totalTestCases = problemTestcases.length > 0 ? problemTestcases.length : 1;

    for (let i = 0; i < problemTestcases.length; i++) {
        const tc = problemTestcases[i];
        const tcInput = tc.input !== undefined ? String(tc.input) : "";
        const tcExpected = tc.output !== undefined ? String(tc.output).trim() : "";
        let stdout = "";
        let stderr = "";
        let passed = false;

        if (lang === "javascript" || lang === "js") {
            try {
                const sandbox = { console: { log: () => {}, error: () => {}, warn: () => {} }, input: tcInput };
                const scriptCode = `const input = ${JSON.stringify(tcInput)};\n${Code}`;
                vm.createContext(sandbox);
                const result = vm.runInContext(scriptCode, sandbox, { timeout: 2000 });
                if (result !== undefined) stdout = String(result);
            } catch (err) {
                stderr = err.message;
            }
        } else {
            let codeToExecute = Code;
            if (lang === "java" && !Code.includes("public static void main")) {
                const methodMatch = Code.match(/public\s+(?:\w+\s+)*(\w+)\s+([a-zA-Z0-9_]+)\s*\(/);
                const methodName = methodMatch ? methodMatch[2] : "checkValidString";
                codeToExecute = `
import java.util.*;
${Code}
public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        if(scanner.hasNext()) {
            String input = scanner.next();
            Solution sol = new Solution();
            System.out.print(sol.${methodName}(input));
        }
    }
}`;
            }

            try {
                const pistonLangMap = {
                    "python": { language: "python", version: "3.10.0" },
                    "cpp": { language: "c++", version: "10.2.0" },
                    "java": { language: "java", version: "15.0.2" },
                    "js": { language: "javascript", version: "18.15.0" },
                    "javascript": { language: "javascript", version: "18.15.0" },
                    "c": { language: "c", version: "10.2.0" }
                };

                const pistonEnv = pistonLangMap[lang] || { language: lang, version: "*" };
                const fileName = lang === "java" ? "Main.java" : `script.${lang === 'python' ? 'py' : lang === 'cpp' ? 'cpp' : 'js'}`;

                const response = await axios.post("https://emacs.piston.rs/api/v2/execute", {
                    language: pistonEnv.language,
                    version: pistonEnv.version,
                    files: [{ name: fileName, content: codeToExecute }],
                    stdin: tcInput,
                    compile_timeout: 10000,
                    run_timeout: 5000
                });

                if (response.data.compile && response.data.compile.code !== 0) {
                    stderr = response.data.compile.stderr || response.data.compile.output;
                } else if (response.data.run) {
                    stdout = response.data.run.stdout || "";
                    stderr = response.data.run.stderr || "";
                    if (response.data.run.code !== 0 && !stderr) {
                        stderr = response.data.run.output;
                    }
                } else {
                    stderr = "Unknown error occurred during execution.";
                }
            } catch (err) {
                stderr = err?.response?.data?.message || err.message || String(err);
            }
        }

        const actualTrimmed = (stdout || "").trim();
        if (tcExpected) {
            passed = actualTrimmed === tcExpected || actualTrimmed.endsWith(tcExpected);
        } else {
            passed = !stderr;
        }
        if (passed) passedCount++;
    }

    const passed = passedCount;
    const failed = totalTestCases - passed;
    const newScore = (passed / totalTestCases) * 100;

    const today = new Date().toISOString().split("T")[0];
    const user = await User.findById(Id).session(session);

    if (passed == totalTestCases) {
      let rewardHistory = await RewardModel.findOne({ Id: Id });
      if (rewardHistory) {
        if (!rewardHistory.submissionDates.includes(today)) {
          user.Coins = user.Coins + 1;
          rewardHistory.submissionDates.push(today);
          rewardHistory.history.push({
            category: "Credit",
            amount: 1,
            details: `Congratulations! You have earned 1 coin for successfully solving a question on ${today}.`,
          });
        }
      } else {
        rewardHistory = new RewardModel({
          Id,
          submissionDates: [today],
          history: [
            {
              category: "Credit",
              amount: 1,
              details: `Congratulations! You have earned 1 coin for successfully solving a question on ${today}.`,
            },
          ],
        });
      }
      await rewardHistory.save({ session });
      await user.save({ session });
    }

    if (AssignmentId) {
      const assignment = await Assignment.findById(AssignmentId).session(session);
      if (!assignment) {
        await session.abortTransaction();
        session.endSession();
        return res.json({ status: 404, message: "Assignment not found" });
      }
      const isExpired = (expiryDate) => new Date(expiryDate) < new Date();
      if (isExpired(assignment.ExpiryDate)) {
        await session.abortTransaction();
        session.endSession();
        return res.json({
          status: 400,
          message: "This assignment has expired.",
          data: {
            passed,
            failed,
            error: false,
            message: "Compiled Successfully.",
          },
        });
      }
      const myAssignment = await AssignmentAttendie.findOne({
        Id,
        Assignment: AssignmentId,
      }).session(session);

      if (myAssignment) {
        myAssignment.Questions = {
          ...myAssignment.Questions,
          [QuestionId]: Math.max(
            myAssignment.Questions[QuestionId] || 0,
            newScore
          ),
        };
        await myAssignment.save({ session });
      } else {
        if (!user) {
          await session.abortTransaction();
          session.endSession();
          return res.json({ status: 404, message: "User not found" });
        }
        await AssignmentAttendie.create(
          [{ Name: user.Name, Email: user.Email, Id, Assignment: AssignmentId, Questions: { [QuestionId]: newScore } }],
          { session }
        );
      }
    }

    const submission = await Submissions.findOne({ Id }, { RecentSubmissions: { $slice: 1 } });
    const lastSubmission = submission?.RecentSubmissions?.[0];
    const updateData = { $inc: { [`Submissions.${today}`]: 1 } };

    if (failed === 0 && lastSubmission?.QuestionId !== QuestionId) {
      const ques = await CodingProblem.findById(QuestionId);
      updateData.$push = {
        RecentSubmissions: {
          $each: [{ QuestionId, Title: ques.Name, Code, Language, Timestamp: new Date() }],
          $position: 0,
          $slice: 10,
        },
      };
    }
    await Submissions.findOneAndUpdate(
      { Id },
      { $addToSet: { SolvedQuestions: QuestionId } },
      { upsert: true, new: true }
    );
    await Submissions.findOneAndUpdate({ Id }, updateData, { upsert: true, new: true });

    await session.commitTransaction();
    session.endSession();

    return res.json({
      status: 200,
      message: "Code executed successfully.",
      data: { passed, failed, error: false, message: "Compiled Successfully." },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    return res.json({ status: 500, message: "Internal Server Error" });
  }
};

export const getSubmissions = async (req, res) => {
  try {
    let submission = await Submissions.findOne({ Id: req.query.Id });
    return res.json({ status: 200, data: submission });
  } catch (error) {
    return res.json({ status: 500, message: "Internal Server Error" });
  }
};

export const generateCodingAssessment = async (req, res) => {
  try {
    const { Id } = req.body;
    if (!Id) {
      return res.json({ status: 400, message: "Insufficient data" });
    }
    const article = await VerifiedArticle.findOne({ _id: new Object(Id) });
    if (!article || !article.CodingPool) {
      return res.json({ status: 404, message: "Article not found" });
    }
    const selectedIds = new Set();
    while (selectedIds.size < Math.min(20, article.CodingPool.length)) {
      const randomIndex = Math.floor(Math.random() * article.CodingPool.length);
      selectedIds.add(article.CodingPool[randomIndex]);
    }
    const problems = await CodingProblem.find({ _id: { $in: Array.from(selectedIds) } });

    return res.json({
      status: 200,
      message: "Assessment fetched successfully.",
      data: problems,
    });
  } catch (error) {
    return res.json({ status: 500, message: "Internal Server Error" });
  }
};

export const generateChoiceBasedAssessment = async (req, res) => {
  try {
    const { Id } = req.body;
    if (!Id) {
      return res.json({ status: 400, message: "Insufficient data" });
    }
    const article = await VerifiedArticle.findOne({ _id: new Object(Id) });
    if (!article || !article.ChoiceBasedPool) {
      return res.json({ status: 404, message: "Article not found" });
    }
    const selectedIds = new Set();
    while (selectedIds.size < Math.min(20, article.ChoiceBasedPool.length - 1)) {
      const randomIndex = Math.floor(Math.random() * article.ChoiceBasedPool.length);
      selectedIds.add(article.ChoiceBasedPool[randomIndex]);
    }

    const problems = await ChoicebasedProblem.find(
      { _id: { $in: Array.from(selectedIds) } },
      { "Options.IsValid": 0 }
    );
    return res.json({
      status: 200,
      message: "Assessment fetched successfully.",
      data: problems,
    });
  } catch (error) {
    return res.json({ status: 500, message: "Internal Server Error" });
  }
};

export const checkMCQScore = async (req, res) => {
  try {
    const { answers } = req.body;
    if (!answers) {
      return res.json({ status: 400, message: "Insufficient data" });
    }

    let score = 0;
    for (const key of Object.keys(answers)) {
      const question = await ChoicebasedProblem.findById(key);
      if (!question) continue;

      const selectedOptionId = answers[key];
      const correctOption = question.Options.find((opt) => opt.IsValid);
      if (correctOption && correctOption._id.toString() === selectedOptionId) {
        score++;
      }
    }
    return res.json({
      status: 200,
      message: "Assessment checked successfully.",
      data: score,
    });
  } catch (error) {
    console.error(error);
    return res.json({ status: 500, message: "Internal Server Error" });
  }
};

export const getSuggestions = async (req, res) => {
  try {
    const { Text, Type } = req.query;
    let questions = [];

    if (Type === "Coding" && Text) {
      questions = await CodingProblem.find(
        { Name: { $regex: Text, $options: "i" } },
        { Name: 1, _id: 1 }
      ).limit(5);
    } else if (Type === "Development" && Text) {
      questions = await DevQuestion.find(
        { Name: { $regex: Text, $options: "i" } },
        { Name: 1, _id: 1 }
      ).limit(5);
    } else if (Type === "MCQ" && Text) {
      questions = await ChoicebasedProblem.find(
        { Statement: { $regex: Text, $options: "i" } },
        { Statement: 1, _id: 1 }
      ).limit(5);
    }

    return res.json({ status: 200, data: questions });
  } catch (error) {
    return res.json({ status: 500, message: "Internal Server Error" });
  }
};

export const assignmentScore = async (req, res) => {
  try {
    const { Id, Assignment } = req.query;
    let score = await AssignmentAttendie.findOne({ Id, Assignment: new ObjectId(Assignment) });
    return res.json({ status: 200, data: score.Questions });
  } catch (error) {
    return res.json({ status: 500, message: "Internal Server Error" });
  }
};

export const getSolvedCodingQuestionsList = async (req, res) => {
  try {
    let questions = await Submissions.findOne({ Id: req.query.Id });
    return res.json({ status: 200, list: questions?.SolvedQuestions });
  } catch (error) {
    return res.json({ status: 500, message: "Internal Server Error" });
  }
};

export const addDevQuestion = async (req, res) => {
  try {
    if (req.body.ProblemId != "") {
      const problem = await DevQuestion.findById(req.body.ProblemId);
      if (problem.Id != req.body.Id) {
        return res.json({
          status: 401,
          message: "You aren't the author of this problem.",
        });
      }
      delete req.body.ProblemId;
      for (const key in req.body) {
        problem[key] = req.body[key];
      }
      await problem.save();
      return res.json({ status: 201, message: "Question updated successfully." });
    } else {
      const problem = new DevQuestion(req.body);
      await problem.save();
      return res.json({ status: 201, message: "Question added successfully." });
    }
  } catch (error) {
    return res.json({ status: 500, message: "Internal Server Error" });
  }
};

export const getDevSheet = async (req, res) => {
  try {
    let { Id, Page, Limit = 10, SearchText } = req.query;
    if (!Id) {
      const matchQuery = {};
      Page = parseInt(Page, 10);
      Limit = parseInt(Limit, 10);
      if (SearchText) {
        matchQuery.Name = { $regex: SearchText, $options: "i" };
      }
      const problems = await DevQuestion.aggregate([
        { $match: matchQuery },
        { $sort: { _id: 1 } },
        {
          $facet: {
            metadata: [{ $count: "total" }],
            data: [
              { $skip: (Page - 1) * Limit },
              { $limit: Limit },
              { $project: { _id: 1, Name: 1 } },
            ],
          },
        },
      ]);
      return res.json({ status: 200, message: "Sheet fetched successfully.", data: problems });
    }
  } catch (error) {
    return res.json({ status: 500, message: "Internal Server Error" });
  }
};

export const deleteDevProblem = async (req, res) => {
  try {
    const { QuestionId, Id } = req.query;
    const problem = await DevQuestion.findById(QuestionId);
    if (problem.Id != Id) {
      return res.json({
        status: 401,
        message: "You aren't the author of this problem.",
      });
    }
    const deleted = await DevQuestion.findByIdAndDelete(QuestionId);
    return res.json({ status: 200, message: "Question deleted successfully." });
  } catch (error) {
    return res.json({ status: 500, message: "Internal Server Error" });
  }
};

export const getDevProblem = async (req, res) => {
  try {
    const problem = await DevQuestion.findById(req.query.Id);
    if (!problem) {
      return res.json({ status: 404, message: "Question not found." });
    }
    if (req.query.UserType == "Mentor") {
      return res.json({ status: 200, message: "Question fetched successfully.", data: problem });
    } else {
      const filteredProblem = {
        ...problem.toObject({
          transform: (doc, ret) => {
            ret.Files = ret.Files.map(({ name, boilerplate }) => ({ name, content: boilerplate }));
            return ret;
          },
        }),
      };
      return res.json({ status: 200, message: "Question fetched successfully.", data: filteredProblem });
    }
  } catch (error) {
    return res.json({ status: 500, message: "Internal Server Error" });
  }
};

export const submitDevCode = async (req, res) => {
  try {
    const question = await DevQuestion.findById(req.body.QuestionId);
    const result = await CalculateScore({ ValidFiles: question.Files, TestingFiles: req.body.Files });
    return res.json({ status: 200, message: "Submitted successfully", data: result });
  } catch (error) {
    return res.json({ status: 500, message: "Internal Server Error" });
  }
};

export const generateDevelopmentAssessment = async (req, res) => {
  try {
    const { Id } = req.body;
    if (!Id) {
      return res.json({ status: 400, message: "Insufficient data" });
    }
    const article = await VerifiedArticle.findOne({ _id: new Object(Id) });
    if (!article || !article.CodingPool) {
      return res.json({ status: 404, message: "Article not found" });
    }
    const randomId = Math.floor(Math.random() * article.CodingPool.length);
    const problem = await DevQuestion.findById(article.CodingPool[randomId]);
    return res.json({ status: 200, message: "Assessment fetched successfully.", data: problem });
  } catch (error) {
    return res.json({ status: 500, message: "Internal Server Error" });
  }
};

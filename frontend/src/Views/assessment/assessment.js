import React, { useEffect, useState, useCallback, useRef } from "react";
import Header from "./header";
import Navigator from "./navigation";
import Coding from "./coding";
import Development from "./../practice/development/devPractice";
import MCQ from "./choiceBased";
import {
  generateChoiceBasedAssessment,
  generateCodingAssessment,
  generateDevelopmentAssessment,
} from "../../APIs/problem";
import { useLocation, useParams } from "react-router-dom";
import MiniScreen from "./miniScreen";
import ScoreScreen from "./score";

function Assessment() {
  const { topic } = useParams();
  const { state } = useLocation();
  const [assessmentType, setAssessmentType] = useState(
    state?.SheetType || "Coding"
  );
  const [section, setSection] = useState(true);
  const [codingQuestions, setCodingQuestions] = useState([]);
  const [developmentQuestion, setDevelopmentQuestion] = useState(null);
  const [choiceBasedQuestions, setChoiceBasedQuestions] = useState([]);
  const [currentCodingQuestion, setCurrentCodingQuestion] = useState(1);
  const [currentChoiceBasedQuestion, setCurrentChoiceBasedQuestion] =
    useState(1);
  const [MCQAnswers, setMCQAnswers] = useState({});
  const [codingAnswers, setCodingAnswers] = useState({});
  const [developmentAnswer, setDevelopmentAnswer] = useState(null);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60 * 30);
  const [fullScreen, setFullScreen] = useState(false);

  const [codingScore, setCodingScore] = useState(0);
  const [developmentScore, setDevelopmentScore] = useState(0);
  const [mcqScore, setMCQScore] = useState(0);

  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const getProblemStatements = async () => {
      try {
        const choiceBased = await generateChoiceBasedAssessment({ Id: topic });
        if (choiceBased?.data?.length) {
          setChoiceBasedQuestions(choiceBased.data);
        }
        if (assessmentType === "Coding") {
          const coding = await generateCodingAssessment({ Id: topic });
          if (coding?.data?.length) setCodingQuestions(coding.data);
        } else {
          const development = await generateDevelopmentAssessment({
            Id: topic,
          });
          if (development?.data) setDevelopmentQuestion(development.data);
        }
      } catch (error) {
        console.error("Error fetching questions:", error);
      }
    };

    if (topic) getProblemStatements();
  }, [topic, assessmentType]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error enabling fullscreen mode: ${err}`);
      });
      setFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        document
          .exitFullscreen()
          .then(() => setFullScreen(false))
          .catch((err) => console.error("Error exiting fullscreen:", err));
      }
    }
  }, []);

  const finishAssessment = useCallback(() => {
    const mcqSum = Object.values(MCQAnswers).filter(Boolean).length;

    let taskScore = 0;
    if (assessmentType === "Coding") {
      taskScore = Object.values(codingAnswers).reduce(
        (acc, val) => acc + (typeof val === "number" ? val : 0),
        0
      );
    } else {
      taskScore = developmentAnswer ? developmentAnswer.score : 0;
    }

    setMCQScore(mcqSum);
    if (assessmentType === "Coding") {
      setCodingScore(taskScore);
    } else {
      setDevelopmentScore(taskScore);
    }

    document.exitFullscreen();
    setFullScreen(false);
    setFinished(true);
  }, [codingAnswers, developmentAnswer, MCQAnswers, assessmentType]);

  const handleMiniScreen = useCallback(() => {
    setTimeLeft((prevTime) => Math.max(prevTime - 300, 0));
  }, []);

  return (
    <div>
      {fullScreen ? (
        <div>
          <Header
            timeLeft={timeLeft}
            section={section}
            setSection={setSection}
            finishAssessment={finishAssessment}
            assessmentType={assessmentType}
            hasMCQs={choiceBasedQuestions.length > 0}
          />
          <div className="flex">
            <section
              className={
                !section && assessmentType === "Coding" ? "w-4/5" : "w-full"
              }
            >
              {section ? (
                <MCQ
                  question={
                    choiceBasedQuestions[currentChoiceBasedQuestion - 1]
                  }
                  setMCQAnswers={setMCQAnswers}
                  MCQAnswers={MCQAnswers}
                />
              ) : assessmentType === "Coding" ? (
                <Coding
                  codingAnswers={codingAnswers}
                  setCodingAnswers={setCodingAnswers}
                  question={codingQuestions[currentCodingQuestion - 1]}
                />
              ) : (
                <Development
                  data={developmentQuestion}
                  setAnswer={setDevelopmentAnswer}
                  setScore={setDevelopmentScore}
                />
              )}
            </section>

            {/* Show sidebar only for Coding questions (not MCQs or Development) */}
            {!section && assessmentType === "Coding" && (
              <div className="w-1/5 fixed right-0 overflow-x-hidden shadow-lg shadow-[grey] h-screen top-0 overflow-y-auto">
                <Navigator
                  count={codingQuestions.length}
                  current={currentCodingQuestion}
                  setCurrent={setCurrentCodingQuestion}
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>
          {finished ? (
            <ScoreScreen
              mcqScore={mcqScore}
              mcqTotal={choiceBasedQuestions.length}
              taskScore={
                assessmentType === "Coding" ? codingScore : developmentScore
              }
              taskTotal={
                assessmentType === "Coding" ? codingQuestions.length * 10 : 100
              }
              setTimeLeft={() => setTimeLeft(30 * 60)}
              setFinished={() => setFinished(false)}
              setFullScreen={toggleFullscreen}
              assessmentType={assessmentType}
            />
          ) : (
            <MiniScreen
              setFullScreen={toggleFullscreen}
              handleMiniScreen={handleMiniScreen}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default Assessment;

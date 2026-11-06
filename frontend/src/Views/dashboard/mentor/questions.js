import { useState } from "react";
import AddCodingQuestionSection from "./../../../components/dashboard/mentor/questions/addCodingQuestion";
import MCQSheetSection from "./../../../components/dashboard/mentor/questions/choiceBasedSheet";
import AddMCQSection from "./../../../components/dashboard/mentor/questions/addChoiceBasedQuestion";
import CodingSheetSection from "../../../components/dashboard/mentor/questions/codingSheet";
import DevSheetSection from "../../../components/dashboard/mentor/questions/devSheet";
import AddDevQuestion from "../../../components/dashboard/mentor/questions/addDevQuestion";

import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import CodeOutlinedIcon from "@mui/icons-material/CodeOutlined";
import QuizOutlinedIcon from "@mui/icons-material/QuizOutlined";
import DeveloperModeOutlinedIcon from "@mui/icons-material/DeveloperModeOutlined";
import { useAppContext } from "../../../context/userContext";

const VIEWS = {
  CODING_SHEET: "CodingSheet",
  ADD_CODING_QUESTION: "AddCodingQuestion",
  MCQ_SHEET: "MCQSheet",
  ADD_MCQ: "addMCQ",
  DEV_SHEET: "DevSheetSection",
  ADD_DEV_QUESTION: "AddDevQuestion",
};

export default function CodingProblems() {
  const [view, setView] = useState(VIEWS.CODING_SHEET);
  const { user } = useAppContext();
  const [choiceBasedStatement, setChoiceBasedStatement] = useState(
    "Write problem statement here..."
  );
  const [choiceBasedOptions, setChoiceBasedOptions] = useState([
    { Name: "", IsValid: false },
  ]);
  const [choiceBasedTags, setChoiceBasedTags] = useState([]);
  const [choiceBasedId, setChoiceBasedId] = useState("");
  const [codingId, setCodingId] = useState("");
  const [devId, setDevId] = useState("");

  if (!user.Verified) {
    return (
      <div className="min-h-screen text-white text-lg opacity-50 flex justify-center items-center flex-col space-y-2">
        <h1>Your request has not been approved by the manager yet.</h1>
        <h1>Please contact the managers as soon as possible to proceed.</h1>
      </div>
    );
  }

  const NavButton = ({ viewKey, icon: Icon, label }) => (
    <button
      onClick={() => setView(viewKey)}
      className={`
        flex-1 py-4 px-2 transition-all duration-200
        flex flex-col md:flex-row items-center justify-center 
        space-x-0 md:space-x-2 space-y-1 md:space-y-0
        border-b-4 ${
          view === viewKey
            ? "border-blue-500 text-blue-400 bg-blue-900 bg-opacity-20"
            : "border-transparent text-gray-300 hover:bg-gray-800 hover:bg-opacity-30"
        }
        hover:text-blue-300
      `}
    >
      <Icon className="text-lg" />
      <span className="text-sm md:text-base">{label}</span>
    </button>
  );

  return (
    <div
      className="container mx-auto px-4 py-6 overflow-scroll"
      style={{ scrollbarWidth: "none" }}
    >
      <div className="mb-8">
        <div className="bg-slate-800 bg-opacity-50 rounded-lg p-1 shadow-lg">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1">
            <NavButton
              viewKey={VIEWS.CODING_SHEET}
              icon={CodeOutlinedIcon}
              label="Coding Problems"
            />
            <NavButton
              viewKey={VIEWS.ADD_CODING_QUESTION}
              icon={AddCircleOutlineOutlinedIcon}
              label="Add Coding"
            />
            <NavButton
              viewKey={VIEWS.MCQ_SHEET}
              icon={QuizOutlinedIcon}
              label="MCQ Sheet"
            />
            <NavButton
              viewKey={VIEWS.ADD_MCQ}
              icon={AddCircleOutlineOutlinedIcon}
              label="Add MCQ"
            />
            <NavButton
              viewKey={VIEWS.DEV_SHEET}
              icon={DeveloperModeOutlinedIcon}
              label="Dev Sheet"
            />
            <NavButton
              viewKey={VIEWS.ADD_DEV_QUESTION}
              icon={AddCircleOutlineOutlinedIcon}
              label="Add Dev"
            />
          </div>
        </div>
      </div>

      <div
        className="bg-gray-800 bg-opacity-15 rounded-lg p-6 shadow-lg"
        style={{ scrollbarWidth: "none" }}
      >
        {view === VIEWS.ADD_CODING_QUESTION ? (
          <AddCodingQuestionSection id={codingId} setView={setView} />
        ) : view === VIEWS.CODING_SHEET ? (
          <CodingSheetSection setView={setView} setId={setCodingId} />
        ) : view === VIEWS.MCQ_SHEET ? (
          <MCQSheetSection
            setStatement={setChoiceBasedStatement}
            setOptions={setChoiceBasedOptions}
            setTags={setChoiceBasedTags}
            setView={setView}
            setId={setChoiceBasedId}
          />
        ) : view === VIEWS.ADD_MCQ ? (
          <AddMCQSection
            statement={choiceBasedStatement}
            options={choiceBasedOptions}
            tags={choiceBasedTags}
            setStatement={setChoiceBasedStatement}
            setOptions={setChoiceBasedOptions}
            setTags={setChoiceBasedTags}
            id={choiceBasedId}
            setView={setView}
          />
        ) : view === VIEWS.DEV_SHEET ? (
          <DevSheetSection setView={setView} setId={setDevId} />
        ) : (
          <AddDevQuestion setView={setView} id={devId} />
        )}
      </div>
    </div>
  );
}

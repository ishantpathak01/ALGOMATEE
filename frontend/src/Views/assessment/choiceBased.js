import React, { useEffect, useState } from "react";

function ChoiceBased({ question, MCQAnswers, setMCQAnswers }) {
  const [selectedOption, setSelectedOption] = useState(
    MCQAnswers?.[question?._id] || null
  );

  useEffect(() => {
    setSelectedOption(MCQAnswers?.[question?._id] || null);
  }, [MCQAnswers, question?._id]);

  const handleMCQAnswer = (questionId, optionId) => {
    const updatedAnswers = { ...MCQAnswers, [questionId]: optionId };
    setMCQAnswers(updatedAnswers);
    setSelectedOption(optionId);
  };
  return (
    <div className="flex flex-col m-6">
      <h2 className="text-xl font-semibold tracking-wide text-slate-700">
        {question?.Statement}
      </h2>
      <div className="flex flex-col m-4">
        {question?.Options.map((opt) => (
          <button
            onClick={() => handleMCQAnswer(question._id, opt._id)}
            className={`hover:bg-blue-400 duration-300 ${
              selectedOption == opt._id && "bg-blue-400"
            } border border-slate-600 border-opacity-45 text-left pl-4 m-2 p-3 rounded-md w-2/3`}
          >
            {opt.Name}
          </button>
        ))}
      </div>
    </div>
  );
}

export default ChoiceBased;

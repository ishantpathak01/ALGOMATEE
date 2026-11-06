import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import QuizIcon from "@mui/icons-material/Quiz";
import CodeIcon from "@mui/icons-material/Code";

function TestHeader({ timeLeft, section, setSection, finishAssessment }) {
  const [questionType, setQuestionType] = useState("mcq");

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleSectionChange = (event, newType) => {
    if (newType !== null) {
      setQuestionType(newType);
      setSection(!section);
    }
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        background: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(10px)",
        color: "black",
        boxShadow: "0px 4px 4px rgba(0,0,0,0.1)",
        borderBottom: "1px solid rgba(0,0,0,0.1)",
      }}
    >
      <Toolbar className="flex justify-between items-center px-6">
        {/* Left: Toggle Between MCQ / Coding */}
        <ToggleButtonGroup
          value={questionType}
          exclusive
          onChange={handleSectionChange}
          sx={{
            background: "rgba(0, 0, 0, 0.05)",
            borderRadius: "8px",
          }}
        >
          <ToggleButton value="mcq" sx={{ px: 2 }}>
            <QuizIcon className="text-blue-500" />
            <Typography variant="body1" className="ml-2">
              MCQ
            </Typography>
          </ToggleButton>
          <ToggleButton value="coding" sx={{ px: 2 }}>
            <CodeIcon className="text-purple-500" />
            <Typography variant="body1" className="ml-2">
              Coding
            </Typography>
          </ToggleButton>
        </ToggleButtonGroup>

        {/* Center: Timer */}
        <div className="flex items-center space-x-2 bg-gray-200 px-4 py-2 rounded-lg">
          <AccessTimeIcon className="text-blue-500" />
          <Typography variant="h6" fontWeight="bold">
            {formatTime(timeLeft)}
          </Typography>
        </div>

        {/* Right: Finish Button */}
        <button
          className="w-40 h-10 rounded-md shadow-md shadow-[grey] text-white font-teko text-xl tracking-wider flex  justify-center items-center flex-row space-x-1 bg-gradient-to-r from-blue-400 hover:scale-95 to-blue-600 border"
          onClick={finishAssessment}
        >
          <CheckCircleOutlineIcon />
          <p className="mt-1">Finish Test</p>
        </button>
      </Toolbar>
    </AppBar>
  );
}

export default TestHeader;

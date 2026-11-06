import React, { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { getSingletonHighlighter } from "shiki";
import Wave from "../../animations/wave.js";
import Aurora from "../../animations/aurora.js";

import "./styling.css";
import { getArticle } from "../../APIs/mentor.js";

function CourseTopic() {
  const { state } = useLocation();
  const [highlightedContent, setHighlightedContent] = useState("");

  useEffect(() => {
    if (!state || !state.data || !state.data.Content) return;
    const processContent = async () => {
      try {
        const highlighter = await getSingletonHighlighter({
          themes: ["dracula"],
          langs: ["javascript", "python", "cpp", "java", "html", "css"],
        });
        let processedContent = state.data.Content;

        const codeBlocks = processedContent.match(
          /<pre(?:\s+[^>]*)?>[\s\S]*?<\/pre>/gi
        );

        if (codeBlocks) {
          for (const block of codeBlocks) {
            const classMatch = block.match(/class=["']([^"']+)["']/);
            const className = classMatch ? classMatch[1] : "";
            let language = "javascript";

            if (className.match(/language-(\w+)/)) {
              language = className.match(/language-(\w+)/)[1];
            } else if (className.includes("ql-syntax")) {
              language = "java";
            }
            const rawCode = block
              .replace(/<pre(?:\s+[^>]*)?>/, "")
              .replace(/<\/pre>/, "")
              .trim();

            const highlighted = highlighter.codeToHtml(rawCode, {
              lang: language,
              theme: "dracula",
            });

            // Wrap highlighted code in terminal-like structure
            const terminalWrapped = `
              <div class="terminal-container">
                <div class="terminal-header">
                  <span class="terminal-dot red"></span>
                  <span class="terminal-dot yellow"></span>
                  <span class="terminal-dot green"></span>
                  <span class="terminal-title">${language.toUpperCase()} Terminal</span>
                </div>
                <div class="terminal-body">
                  ${highlighted}
                </div>
              </div>
            `;

            processedContent = processedContent.replace(block, terminalWrapped);
          }
        }
        setHighlightedContent(processedContent);
      } catch (error) {
        setHighlightedContent(state.data.Content);
      }
    };

    processContent();
  }, [state]);

  const [data, setData] = useState(state?.data);

  const lightColors = [
    "bg-yellow-100",
    "bg-green-100",
    "bg-blue-100",
    "bg-red-100",
    "bg-purple-100",
    "bg-pink-100",
    "bg-indigo-100",
  ];

  const [randomColor, setRandomColor] = useState("");

  useEffect(() => {
    setRandomColor(lightColors[Math.floor(Math.random() * lightColors.length)]);
  }, []);

  if (!state || !state.data) {
    return (
      <div className="h-screen w-full text-white text-lg tracking-wider font-serif opacity-50 flex justify-center items-center">
        <h1>This topic-Id is not valid.</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-8 relative pb-20">
      <Aurora></Aurora>
      <h1 className="text-3xl text-center text-white border-b-2 pb-3 ml-4 mr-4 border-opacity-15 border-slate-400 font-sans font-semibold tracking-wide">
        {data.Name}
      </h1>
      <div
        className={`text-white mt-4 p-3 ml-4 mr-4 ${randomColor} bg-opacity-20 font-serif italic tracking-wide`}
      >
        <p>{data.Description}</p>
      </div>
      <div
        className="text-white m-6 text-opacity-90 scoped-styles"
        dangerouslySetInnerHTML={{ __html: highlightedContent }}
      ></div>
      <Wave></Wave>
    </div>
  );
}

export default CourseTopic;

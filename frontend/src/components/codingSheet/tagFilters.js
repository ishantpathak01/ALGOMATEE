import React from "react";
import CARD_BG_SVG from "./../../assets/Illustrations/card01.svg";

function TagFilters({ codingProblemTags, setSelectedTag, selectedTag }) {
  return (
    <div
      className="bg-gray-800 rounded-xl shadow-lg p-6"
      style={{
        backgroundImage: `url(${CARD_BG_SVG})`,
        backgroundSize: "auto",
        backgroundPosition: "center",
      }}
    >
      <h2 className="text-xl font-semibold mb-4 text-gray-300 text-center">
        Select a Tag
      </h2>
      <div className="flex flex-wrap gap-2 justify-center items-center">
        {codingProblemTags.map((tag) => (
          <span
            key={tag}
            className={`px-4 py-1.5 text-sm text-slate-900 rounded-full cursor-pointer ${
              selectedTag === tag
                ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white border"
                : "bg-gray-400"
            }`}
            onClick={() => setSelectedTag(tag)}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

export default TagFilters;

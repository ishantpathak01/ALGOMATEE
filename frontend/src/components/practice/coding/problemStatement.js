import React from "react";

function ProblemStatement({ name, data }) {
  return (
    <div className="text-white p-4 ">
      <h1 className="text-2xl font-semibold">{name}</h1>
      <div
        className="m-4 mt-2"
        dangerouslySetInnerHTML={{ __html: data }}
      ></div>
    </div>
  );
}

export default ProblemStatement;

import React from "react";

function mentorData({ data }) {
  return (
    <div className="bg-slate-400 rounded-s-3xl text-slate-900 m-14  p-10 flex flex-col justify-center items-center">
      <div>
        <img
          src={data?.Picture}
          className="rounded-3xl h-40 w-40 border-2 p-1 border-slate-800"
        ></img>
      </div>
      <div className="flex flex-col items-center">
        <h1 className="text-3xl font-sans font-semibold  m-4 ml-0 text-left w-full">
          {data?.Name}
        </h1>
        <h2 className="text-lg ml-4 mb-3">{data?.About}</h2>
        <div
          className="flex flex-row overflow-x-scroll w-96 cursor-pointer"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {Object.keys(data?.Expertise || {}).map((skill) => (
            <h2
              className="p-2 border-2 m-2 rounded-md border-slate-900 text-nowrap hover:bg-slate-100 duration-300"
              key={skill}
            >
              {skill}
            </h2>
          ))}
        </div>
        <div className="w-full flex justify-center items-center p-2 flex-row">
          {data?.Languages.map((lang, i) => (
            <>
              {i > 0 && <p className="font-bold">|</p>}
              <p
                key={i}
                className="text-sm font-sans font-semibold w-min text-nowrap p-1"
              >
                {lang}
              </p>
            </>
          ))}
        </div>
      </div>
    </div>
  );
}

export default mentorData;

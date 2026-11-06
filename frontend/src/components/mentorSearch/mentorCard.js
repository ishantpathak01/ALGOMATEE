import React from "react";
import { Link } from "react-router-dom";

function mentorCard({ mentor }) {
  return (
    <div className="bg-white hover:bg-black_A duration-500 hover:text-white  h-50 w-120 m-10 flex flex-row pr-4 text-slate-800">
      <section className="relative ">
        <img src={mentor.Picture} className="h-60 w-60 p-4"></img>
        {mentor?.Rating?.Count > 0 && (
          <p className="absolute bottom-6 right-6 text-xsm bg-black_B text-white text-center p-1 rounded-full font-semibold pl-2 pr-2">
            ⭐ {(mentor.Rating.Score / mentor.Rating.Count).toFixed(1)}
          </p>
        )}
      </section>
      <section className="mt-4 mb-4 relative">
        <h1 className="text-xl ml-2  font-semibold ">{mentor.Name}</h1>
        <div
          className=" flex flex-row overflow-scroll w-80 ml-4"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {Object.keys(mentor?.Expertise || {}).map((skill) => (
            <h2
              className="text-xsm bg-slate-900 bg-opacity-10 text-nowrap p-1 pl-2 pr-2 font-serif border-2 rounded-full text-center m-1"
              key={skill}
            >
              {skill}
            </h2>
          ))}
        </div>
        <div className="w-80 text-xsm m-2 ml-4 h-20 overflow-hidden opacity-70 font-serif tracking-wide">
          {mentor.About}
        </div>
        <Link to={`/mentorSearch/${mentor._id}`}>
          <button className="bg-gradient-to-r absolute right-0 bottom-2 from-slate-800 to-slate-700 text-slate-50 text-sm font-sans py-2 px-4 mr-4 rounded font-semibold hover:shadow-md hover:shadow-slate-600 hover:scale-95 hover:duration-300 hover:border-2 hover:border-slate-300">
            Ask Doubt
          </button>
        </Link>
      </section>
    </div>
  );
}

export default mentorCard;

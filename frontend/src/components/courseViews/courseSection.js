import React from "react";
import Card from "./card";
function developement({ data }) {
  return (
    <div>
      <h2 className="text-xl text-center font-semibold">{data?.Name}</h2>
      <p className="text-sm p-4 opacity-75 text-center">{data?.Description}</p>
      <div className="flex flex-col flex-wrap md:flex-row md:space-y-0 space-y-10 justify-around mt-6">
        {data?.Courses.map((course) => (
          <Card
            image={course?.image}
            topic={course?.name}
            info={course?.info}
            id={course?.key}
          ></Card>
        ))}
      </div>
    </div>
  );
}

export default developement;

import React from "react";
import PAGE_NOT_FOUND_IMG from "./../../assets/Illustrations/Not_Found_02.svg";
import SnowEffect from "../../animations/snow";
import WaveEffect from "../../animations/wave";
function PageNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black_B to-black flex flex-col justify-center items-center">

      <SnowEffect></SnowEffect>
      <img src={PAGE_NOT_FOUND_IMG} className="w-1/4"></img>
      <h1 className="text-white text-3xl font-serif text-opacity-55">
        Page Not Found
      </h1>
      <WaveEffect></WaveEffect>
    </div>
  );
}

export default PageNotFound;

import React from "react";
import Logo from "./../../assets/Logos/AlgoMate.png";
import { Link } from "react-router-dom";
import Youtube from "./../../assets/Icons/youtube.svg";
import Instagram from "./../../assets/Icons/instagram.svg";
import Linkedin from "./../../assets/Icons/linkedin.svg";
import Facebook from "./../../assets/Icons/facebook.svg";

function Footer() {
  return (
    <div className=" w-full bottom-0 bg-black_B flex flex-col text-white">
      <section className="flex md:flex-row flex-col justify-between pl-10 pr-10 p-6">
        <div className="md:w-1/3 w-full p-10">
          <div className=" flex flex-row justify-start items-center space-x-1">
            <img src={Logo} className="h-12 opacity-85" />
            <h1 className="text-3xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 font-teko tracking-wide">
              AlgoMate
            </h1>
          </div>
          <p className="text-sm font-light p-2 md:w-2/3">
            Enhance your coding journey with hands-on challenges, real-world
            problem-solving, and an interactive learning experience.
          </p>
          <div className="flex flex-row p-2 rounded-md border bg-white bg-opacity-10 space-x-4 m-3 md:w-1/2 justify-center group">
            <img
              className="h-8 w-8 cursor-pointer hover:scale-110 duration-200"
              alt="Facebook"
              src={Facebook}
            ></img>
            <img
              className="h-8 w-8 cursor-pointer hover:scale-110 duration-200"
              alt="Instagram"
              src={Instagram}
            ></img>
            <img
              className="h-8 w-8 cursor-pointer hover:scale-110 duration-200"
              alt="Linkedin"
              src={Linkedin}
            ></img>
            <img
              className="h-8 w-8 cursor-pointer hover:scale-110 duration-200"
              alt="Youtube"
              src={Youtube}
            ></img>
          </div>
        </div>
        <div className=" md:w-1/3 flex md:flex-row flex-col justify-around items-center">
          <div className="pb-10 md:0">
            <h2 className="text-lg font-semibold text-center p-2">Company</h2>
            <ul className="text-center flex flex-col justify-center items-center">
              <Link
                to="/aboutUs"
                className="hover:opacity-80 hover:scale-105 cursor-pointer duration-200 p-1"
              >
                About Us
              </Link>
              <Link
                to="/contactUs"
                className="hover:opacity-80 hover:scale-105 cursor-pointer duration-200 p-1"
              >
                Contact Us
              </Link>
              <Link
                to="/privacyPolicy"
                className="hover:opacity-80 hover:scale-105 cursor-pointer duration-200 p-1"
              >
                Privacy Policy
              </Link>
              <Link
                to="/termsAndConditions"
                className="hover:opacity-80 hover:scale-105 cursor-pointer duration-200 p-1"
              >
                Terms & Conditions
              </Link>
            </ul>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-center p-2">
              Quick access
            </h2>
            <div className="text-center flex flex-col justify-center items-center">
              <Link
                to="/course/dsa_in_cpp"
                className="hover:opacity-80 hover:scale-105 cursor-pointer duration-200 p-1"
              >
                C++ Course
              </Link>
              <Link
                to="/course/dsa_in_java"
                className="hover:opacity-80 hover:scale-105 cursor-pointer duration-200 p-1"
              >
                Java course
              </Link>
              <Link
                to="/course/dsa_in_python"
                className="hover:opacity-80 hover:scale-105 cursor-pointer duration-200 p-1"
              >
                Python Course
              </Link>

              <Link
                to="/course/system_design"
                className="hover:opacity-80 hover:scale-105 cursor-pointer duration-200 p-1"
              >
                System Design
              </Link>
              <Link
                to="/course/fullstack"
                className="hover:opacity-80 hover:scale-105 cursor-pointer duration-200 p-1"
              >
                Full Stack
              </Link>
            </div>
          </div>
        </div>
        <div className="md:w-1/3 md:mt-0 mt-16 flex flex-col justify-center  items-center ">
          <img
            src="https://img.icons8.com/?size=100&id=17030&format=png&color=ffffff"
            className="h-8 w-8 mr-48"
          ></img>
          <div className="m-4 ">
            <p className=" opacity-80 text-sm font-semibold ">
              GLA University,
            </p>
            <p className=" opacity-80 text-sm font-semibold ">
              17km Stone, NH-2,
            </p>
            <p className=" opacity-80 text-sm font-semibold ">
              Mathura-Delhi Road, P.O. Chaumuhan,
            </p>
            <p className=" opacity-80 text-sm font-semibold ">
              Mathura, Uttar Pradesh, 281406, India.
            </p>
          </div>
        </div>
      </section>
      <section className="border-t-2">
        <p className="p-2 w-full text-center text-sm">
          © 2025 AlgoMate. All Rights Reserved.
        </p>
      </section>
    </div>
  );
}

export default Footer;

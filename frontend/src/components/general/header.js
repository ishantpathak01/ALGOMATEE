import React, { useState } from "react";
import Logo from "./../../assets/Logos/AlgoMate.png";
import { Link, useLocation } from "react-router-dom";
import HeaderBanner from "./../courseViews/headerBanner";
import { useAppContext } from "../../context/userContext";
import { Login } from "@mui/icons-material";
import "./logo.css";
function Header() {
  const [showBanner, setShowBanner] = useState(false);
  const { user } = useAppContext();
  const location = useLocation();

  const shouldHideHeader =
    location.pathname.startsWith("/user/assessment/") ||
    location.pathname.startsWith("/notesEditor");

  return (
    <header
      id="header"
      className={`fixed z-50 w-full h-[70px] ${
        shouldHideHeader ? "hidden" : "flex"
      } justify-between items-center bg-black_B p-8 border-b border-slate-600 shadow-md shadow-slate-900`}
    >
      {/* Logo */}
      <section>
        <Link
          to="/"
          className="flex flex-row justify-center items-center space-x-2"
        >
          <img
            src={Logo}
            alt="Logo"
            className="logo h-12 w-12 cursor-pointer border-[4px] p-1 bg-clip-text border-opacity-60 border-white rounded-full"
          />
          <h1 className="text-3xl font-semibold mt-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 font-teko tracking-wide">
            AlgoMate
          </h1>
        </Link>
      </section>

      {/* Navigation & Actions */}
      <section className="hidden sm:flex flex-row space-x-6">
        {/* Home */}
        <div
          onMouseEnter={() => setShowBanner(true)}
          onMouseLeave={() => setShowBanner(false)}
        >
          <Link to="/">
            <button className="text-white hover:bg-slate-800 px-8 py-2 rounded-md transition-all duration-500 flex flex-col items-center">
              <img
                alt="icon"
                className="w-5 h-5 opacity-80"
                src="https://img.icons8.com/?size=100&id=14096&format=png&color=ffffff"
              />
              <h2 className="text-sm">Home</h2>
            </button>
          </Link>

          {showBanner && (
            <>
              <div className="absolute w-full h-20 left-0"></div>
              <div className="mt-0">
                <HeaderBanner hide={setShowBanner} />
              </div>
            </>
          )}
        </div>

        {/* Jobs */}
        <Link to="/jobs">
          <button className="text-white hover:bg-slate-800 px-8 py-2 rounded-md transition-all duration-500 flex flex-col items-center">
            <img
              alt="icon"
              className="w-5 h-5 opacity-80"
              src="https://img.icons8.com/?size=100&id=85073&format=png&color=ffffff"
            />
            <h2 className="text-sm">Jobs</h2>
          </button>
        </Link>

        <Link to="/sheet">
          <button className="text-white hover:bg-slate-800 px-8 py-2 rounded-md transition-all duration-500 flex flex-col items-center">
            <img
              alt="icon"
              className="w-5 h-5 opacity-80"
              src="https://img.icons8.com/?size=100&id=11260&format=png&color=ffffff"
            />
            <h2 className="text-sm">Practice</h2>
          </button>
        </Link>

        {/* Contests */}
        <Link to="/contests">
          <button className="text-white hover:bg-slate-800 px-8 py-2 rounded-md transition-all duration-500 flex flex-col items-center relative">
            <img
              alt="icon"
              className="w-5 h-5 opacity-80"
              src="https://img.icons8.com/?size=100&id=11562&format=png&color=ffffff"
            />
            <h2 className="text-sm flex items-center gap-1">
              <span>Contests</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            </h2>
          </button>
        </Link>

        {/* Mentor */}
        <Link to="/mentorSearch">
          <button className="text-white hover:bg-slate-800 px-8 py-2 rounded-md transition-all duration-500 flex flex-col items-center">
            <img
              alt="icon"
              className="w-5 h-5 opacity-80"
              src="https://img.icons8.com/?size=100&id=h6K7nHsVjMMU&format=png&color=ffffff"
            />
            <h2 className="text-sm">Mentor</h2>
          </button>
        </Link>

        <Link to="/resumeAnalyzer">
          <button className="text-white hover:bg-slate-800 px-8 py-2 rounded-md transition-all duration-500 flex flex-col items-center">
            <img
              alt="icon"
              className="w-5 h-5 opacity-80"
              src="https://img.icons8.com/?size=100&id=GVghUo9qfGPW&format=png&color=ffffff"
            />
            <h2 className="text-sm">Resume AI</h2>
          </button>
        </Link>

        {/* Profile/Login */}
        <div>
          {user ? (
            <Link
              to={
                user?.Type === "Mentor"
                  ? "/dashboard/mentor/profile"
                  : "/dashboard/user/profile"
              }
            >
              <button className="bg-slate-600 justify-center w-40 bg-opacity-20 hover:bg-opacity-100 hover:scale-90 text-white font-serif tracking-wider px-4 py-2 scale-[85%] rounded-md transition-all duration-200 flex items-center space-x-4 mt-1">
                <h2 className="truncate">{user.Name.split(" ")[0]}</h2>
                <img
                  src={user?.Picture}
                  alt="profile_picture"
                  className="w-8 h-8 p-1 border-2 border-opacity-50 border-white rounded-full"
                />
              </button>
            </Link>
          ) : (
            <Link to="/auth/user">
              <button className="bg-slate-700 w-36 mt-2 bg-opacity-40 hover:bg-opacity-100 hover:scale-95 justify-center text-white font-serif tracking-wider px-4 py-2 rounded-md transition-all duration-200 flex items-center space-x-2 ">
                <h2 className="truncate">Login</h2>
                <Login className="w-8 h-8 text-white" />
              </button>
            </Link>
          )}
        </div>
      </section>
    </header>
  );
}

export default Header;

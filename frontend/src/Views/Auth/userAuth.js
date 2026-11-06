import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  logIn,
  signUp,
  verificationCode,
  resetPassword,
} from "../../APIs/user";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/userContext";
import toast from "react-hot-toast";
import SnowEffect from "../../animations/snow";
function UserAuth() {
  const [signIn, setSignIn] = useState(true);
  const [name, setName] = useState("");
  const [verification, setVerification] = useState(false);
  const [forgetPassword, setForgetPassword] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const redirectPath = location.state?.redirect;
  const { setUser } = useAppContext();
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(120);

  const disabledButton = () => {
    document.querySelectorAll(".btn").forEach((btn) => {
      btn.disabled = true;
      btn.style.cursor = "not-allowed";
      btn.style.opacity = "50%";
    });
  };

  const enableButton = () => {
    document.querySelectorAll(".btn").forEach((btn) => {
      if (btn) {
        btn.disabled = false;
        btn.style.cursor = "pointer";
        btn.style.opacity = "100%";
      }
    });
  };

  const handleLogin = async (e) => {
    disabledButton();
    let res = await logIn({ Email: email.toLowerCase(), Password: password });
    if (res.status == 200) {
      toast.success(res.message);
      setUser(res.user);
      if (redirectPath) {
        navigate(redirectPath);
      } else {
        navigate("/dashboard/user/profile");
      }
    } else toast.error(res.message);
    enableButton();
  };

  const handleSignup = async () => {
    disabledButton();
    if (otp.length != 4) {
      toast.error("OTP should be 4 digit long");
      return;
    }
    if (isValidPassword(password)) {
      let res = await signUp({
        Name: name,
        Email: email.toLowerCase(),
        Password: password,
        Type: "User",
        Otp: otp,
      });
      if (res.status == 201) {
        toast.success(res.message);
        setUser(res.user);
        if (redirectPath) {
          navigate(redirectPath);
        } else {
          navigate("/dashboard/user/profile");
        }
      } else toast.error(res.message);
    } else {
      toast.error(
        "Weak password. Use 8+ chars with symbols, numbers, and letters."
      );
    }
    enableButton();
  };

  useEffect(() => {
    setTimeout(() => {
      if (verification) setTimer(timer - 1);
      else setTimer(120);
    }, 1000);
  }, [timer, verification]);

  const convertTimer = (time) => {
    let min = Math.floor(time / 60);
    let seconds = time % 60;
    return min + ":" + (seconds < 10 ? "0" + seconds : seconds);
  };

  const sendVerificationCode = async (e, type) => {
    disabledButton();
    if (type == "Reset") {
      if (email.trim() != "") {
        let res = await verificationCode({
          Email: email.toLowerCase(),
          Type: type,
        });
        if (res.status == 200) {
          setForgetPassword(true);
          setVerification(true);
          toast.success(res.message);
        } else toast.error(res.message);
      } else {
        toast.error("Please enter your email to reset your password.");
      }
    } else {
      if (isValidPassword(password)) {
        setVerification(true);
        await verificationCode({
          Email: email.toLowerCase(),
          Type: type,
        });
      } else {
        toast.error(
          "Weak password. Use 8+ chars with symbols, numbers, and letters."
        );
      }
    }
    enableButton();
  };

  const handleResetPassword = async () => {
    disabledButton();

    if (otp.length !== 4) {
      toast.error("OTP should be 4 digits long");
      enableButton(); // Enable buttons after validation fails
      return;
    }

    if (!isValidPassword(password)) {
      toast.error(
        "Weak password. Use 8+ chars with symbols, numbers, and letters."
      );
      enableButton();
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords didn't match");
      enableButton();
      return;
    }

    let res = await resetPassword({
      Email: email.toLowerCase(),
      Password: password,
      Type: "User",
      Otp: otp,
    });

    if (res.status === 200) {
      toast.success(res.message);
      setVerification(false);
      setForgetPassword(false);
    } else {
      toast.error(res.message);
    }

    enableButton();
  };

  const handleResendCode = async (type) => {
    disabledButton();
    let res = await verificationCode({
      Email: email.toLowerCase(),
      Type: type,
    });
    if (res.status == 200) toast.success(res.message);
    else toast.error(res.message);
    enableButton();
  };

  const isValidPassword = (password) => {
    if (password.length < 8) {
      return false;
    }
    if (!/[A-Z]/.test(password)) {
      return false;
    }
    if (!/[a-z]/.test(password)) {
      return false;
    }
    if (!/[0-9]/.test(password)) {
      return false;
    }
    if (!/[!@#$%^&*]/.test(password)) {
      return false;
    }
    return true;
  };

  return (
    <div className="flex  flex-col justify-center items-center h-screen bg-gradient-to-b from-gray-900 to-black  w-full">
      <SnowEffect></SnowEffect>
      {verification ? (
        <div>
          {forgetPassword ? (
            <div className="flex justify-center flex-col bg-slate-400 bg-opacity-15 w-96 p-8 pt-4 rounded-xl items-center text-white">
              <h1 className="text-lg m-4 font-semibold ">
                - Reset your password -
              </h1>
              <input
                type="text"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-transparent border-2 focus:outline-none tracking-widest border-slate-400 rounded-md  p-3 my-2 w-full"
              />
              <input
                type="text"
                value={confirmPassword}
                placeholder="Confirm New Password"
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-transparent border-2 focus:outline-none tracking-widest border-slate-400 rounded-md  p-3 my-2 w-full"
              />
              <input
                type="text"
                placeholder="OTP"
                onChange={(e) => setOtp(e.target.value)}
                className="bg-transparent border-2 focus:outline-none tracking-widest border-slate-400 rounded-md  p-3 my-2 w-full"
              />
              <button
                onClick={handleResetPassword}
                className="btn rounded-full w-full bg-gradient-to-r mt-6  from-[#858f8f] to-[#d3dbdb] hover:from-[#d3dbdb] hover:to-[#858f8f] hover:scale-95 duration-100 text-black_B py-3 px-8 uppercase font-bold text-sm"
              >
                Reset Password
              </button>
              <button
                disabled={timer > 0}
                onClick={() => handleResendCode("Reset")}
                className="mt-6 font-serif cursor-pointer"
              >
                {timer > 0
                  ? `Resend code in ${convertTimer(timer)} minutes`
                  : "Resend code"}
              </button>
              <button
                onClick={() => {
                  setVerification(false);
                  setForgetPassword(false);
                }}
                className="btn font-serif cursor-pointer mt-2"
              >
                Change email
              </button>
            </div>
          ) : (
            <div className="flex justify-center flex-col bg-slate-400 bg-opacity-15 w-96 p-8 pt-4 rounded-xl items-center text-white">
              <h1 className="text-lg m-4 font-semibold ">
                - Enter your OTP to verify -
              </h1>
              <input
                type="text"
                placeholder="OTP"
                onChange={(e) => setOtp(e.target.value)}
                className="bg-transparent border-2 focus:outline-none tracking-widest border-slate-400 rounded-md  p-3 my-2 w-full"
              />
              <button
                onClick={handleSignup}
                className="btn rounded-full w-full bg-gradient-to-r mt-6  from-[#858f8f] to-[#d3dbdb] hover:from-[#d3dbdb] hover:to-[#858f8f] hover:scale-95 duration-100 text-black_B py-3 px-8 uppercase font-bold text-sm"
              >
                Verify
              </button>
              <button
                disabled={timer > 0}
                onClick={() => handleResendCode("Verify")}
                className="mt-6 font-serif cursor-pointer"
              >
                {timer > 0
                  ? `Resend code in ${convertTimer(timer)} minutes`
                  : "Resend code"}
              </button>
              <button
                onClick={() => {
                  setVerification(false);
                }}
                className="btn font-serif cursor-pointer mt-2"
              >
                Change email
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full">
          <div className="flex  flex-col justify-center items-center">
            <div className="bg-black_B mt-20 shadow-lg rounded-lg overflow-hidden w-full max-w-2xl min-h-[400px] relative">
              {/* Sign Up Container */}
              <div
                className={`absolute top-0 right-0 h-full w-1/2 transition-all duration-500 ${
                  signIn ? "opacity-0 translate-x-full" : "opacity-100 z-30"
                }`}
              >
                <div className="flex flex-col items-center justify-center h-full p-12 text-center">
                  <h1 className="font-bold text-3xl m-2 text-slate-100">
                    Create Account
                  </h1>
                  <input
                    type="text"
                    placeholder="Name"
                    onChange={(e) => setName(e.target.value)}
                    className="bg-transparent border-2 focus:outline-none text-white tracking-widest border-slate-400 rounded-md  p-3 my-2 w-full"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-transparent border-2 focus:outline-none text-white tracking-widest border-slate-400 rounded-md p-3 my-2 w-full"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-transparent border-2 focus:outline-none text-white tracking-widest border-slate-400 rounded-md p-3 my-2 w-full"
                  />
                  <button
                    onClick={(e) => sendVerificationCode(e, "Verify")}
                    className="btn rounded-full bg-gradient-to-r mt-4 from-[#858f8f] to-[#d3dbdb] hover:from-[#d3dbdb] hover:to-[#858f8f] hover:scale-95 duration-100 text-black_B py-3 px-8 uppercase font-bold text-sm"
                  >
                    Sign Up
                  </button>
                </div>
              </div>

              {/* Sign In Container */}
              <div
                className={`absolute top-0 h-full w-1/2 transition-all duration-500 ${
                  signIn ? "opacity-100 z-10" : "opacity-0 translate-x-full"
                }`}
              >
                <div className="flex flex-col items-center justify-center h-full p-12 text-center">
                  <h1 className="font-bold m-2 text-3xl text-slate-100">
                    Sign in
                  </h1>
                  <input
                    type="email"
                    placeholder="Email"
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-transparent border-2 focus:outline-none text-white tracking-widest border-slate-500 rounded-md text-sm p-3 my-2 w-full"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-transparent border-2 focus:outline-none text-white tracking-widest rounded-md border-slate-500 text-sm p-3 my-2 w-full"
                  />
                  <button
                    onClick={(e) => sendVerificationCode(e, "Reset")}
                    className="btn text-gray-600 my-4 text-sm"
                  >
                    Forgot your password?
                  </button>
                  <button
                    onClick={handleLogin}
                    className="btn rounded-full bg-gradient-to-r from-[#858f8f] to-[#d3dbdb] hover:from-[#d3dbdb] hover:to-[#858f8f] hover:scale-95 duration-100 text-black_B py-3 px-8 uppercase font-bold text-sm"
                  >
                    Sign In
                  </button>
                </div>
              </div>

              {/* Overlay Container */}
              <div
                className={`absolute z-40 top-0 left-1/2 w-1/2 h-full transition-transform duration-500 ${
                  signIn ? "" : "-translate-x-full"
                }`}
              >
                {signIn ? (
                  <div className="bg-gradient-to-r from-[#4d6169] to-[#698691] text-black_B h-full flex flex-col items-center justify-center p-12 text-center">
                    <h1 className="text-2xl font-bold">Hello, User!👋🏻</h1>
                    <p className="my-4">
                      Enter your details and start your coding journey with us
                    </p>
                    <button
                      className="btn rounded-full border border-black_B py-3 px-8 uppercase font-bold text-sm"
                      onClick={() => setSignIn(false)}
                    >
                      Sign Up
                    </button>
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-[#4d6169] to-[#698691] text-black_B h-full flex flex-col items-center justify-center p-12 text-center">
                    <h1 className="text-2xl font-bold">Welcome Back!</h1>
                    <p className="my-4">
                      To keep connected with us please login with your email Id
                    </p>
                    <button
                      className="btn rounded-full border border-black_B py-3 px-8 uppercase font-bold text-sm"
                      onClick={() => setSignIn(true)}
                    >
                      Sign In
                    </button>
                  </div>
                )}
              </div>
            </div>
            <Link to="/auth/mentor">
              <h3 className="text-center cursor-pointer hover:opacity-100 transition-all duration-400 text-white opacity-50 mt-5">
                Interested in becoming a Mentor ?
              </h3>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserAuth;

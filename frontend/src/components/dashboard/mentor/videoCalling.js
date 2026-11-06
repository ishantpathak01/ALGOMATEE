import React, { useState } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import VideocamOffOutlinedIcon from "@mui/icons-material/VideocamOffOutlined";
import MicOffOutlinedIcon from "@mui/icons-material/MicOffOutlined";
import MicNoneOutlinedIcon from "@mui/icons-material/MicNoneOutlined";
import PhoneDisabledOutlinedIcon from "@mui/icons-material/PhoneDisabledOutlined";
import ScreenShareOutlinedIcon from "@mui/icons-material/ScreenShareOutlined";
import StopScreenShareOutlinedIcon from "@mui/icons-material/StopScreenShareOutlined";
import ProfilePicture from "../../../assets/Icons/profile_picture.svg";

function VideoCalling({
  LocalUser,
  localCameraTrack,
  cameraOn,
  micOn,
  remoteUsers,
  RemoteUser,
  localMicrophoneTrack,
  setMic,
  setCamera,
  setCalling,
}) {
  const [isSharing, setIsSharing] = useState(false);

  const startScreenShare = async () => {
    alert("This feature will be implemented soon.");
  };

  const stopScreenShare = async () => {};

  return (
    <div className="w-full h-screen">
      <div className="flex w-full justify-center items-center flex-col h-full">
        <h1 className="text-3xl border-b border-slate-500 border-opacity-50 pb-2 w-11/12 text-center mt-[-70px] mb-2">
          Doubt Session
        </h1>

        {/* Local Video Preview */}
        <div className="fixed w-80 z-40 border-2 border-slate-400 border-opacity-40 bottom-10 right-10 h-52 bg-gray-400 rounded-lg overflow-hidden flex justify-center items-center">
          <LocalUser
            audioTrack={localMicrophoneTrack}
            cameraOn={cameraOn}
            micOn={micOn}
            videoTrack={localCameraTrack}
            cover={ProfilePicture}
          />
        </div>

        {/* Remote User Display */}
        <div className="w-11/12 z-10 h-5/6 border-2 border-slate-400 border-opacity-40 bg-black_B bg-opacity-50 rounded-lg overflow-hidden flex justify-center items-center">
          {remoteUsers.length > 0 ? (
            <RemoteUser cover={ProfilePicture} user={remoteUsers[0]} />
          ) : (
            <h1 className="text-xl opacity-50 font-sans">
              Waiting for the student to join...
            </h1>
          )}
        </div>

        {/* Control Buttons */}
        <div className="bg-black_A bg-opacity-80 fixed z-40 bottom-10 rounded-md w-120 h-20 left-96 flex flex-row justify-around items-center">
          {/* Mic Control */}
          <div className="border-2 rounded-full p-2 hover:bg-slate-500 hover:bg-opacity-10 transition-all">
            {micOn ? (
              <button onClick={() => setMic(false)}>
                <MicNoneOutlinedIcon />
              </button>
            ) : (
              <button onClick={() => setMic(true)}>
                <MicOffOutlinedIcon />
              </button>
            )}
          </div>

          {/* Camera Control */}
          <div className="border-2 rounded-full p-2 hover:bg-slate-500 hover:bg-opacity-10 transition-all">
            {cameraOn ? (
              <button onClick={() => setCamera(false)}>
                <VideocamOutlinedIcon />
              </button>
            ) : (
              <button onClick={() => setCamera(true)}>
                <VideocamOffOutlinedIcon />
              </button>
            )}
          </div>

          {/* Screen Share Control */}
          <div className="border-2 rounded-full p-2 hover:bg-slate-500 hover:bg-opacity-10 transition-all">
            {isSharing ? (
              <button onClick={stopScreenShare}>
                <StopScreenShareOutlinedIcon />
              </button>
            ) : (
              <button onClick={startScreenShare}>
                <ScreenShareOutlinedIcon />
              </button>
            )}
          </div>

          {/* End Call */}
          <button
            onClick={() => setCalling(false)}
            className="border-2 rounded-lg px-6 bg-red-600 hover:scale-95 duration-200 cursor-pointer p-2"
          >
            <PhoneDisabledOutlinedIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

export default VideoCalling;

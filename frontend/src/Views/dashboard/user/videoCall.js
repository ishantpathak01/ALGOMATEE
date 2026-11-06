import {
  LocalUser,
  RemoteUser,
  useIsConnected,
  useJoin,
  useLocalMicrophoneTrack,
  useLocalCameraTrack,
  usePublish,
  useRemoteUsers,
} from "agora-rtc-react";
import React, { useState } from "react";
import AccessAlarmsIcon from "@mui/icons-material/AccessAlarms";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { Mic, MicOff, Videocam, VideocamOff } from "@mui/icons-material";

import Calling from "../../../components/dashboard/mentor/videoCalling";
import { useLocation, useNavigate } from "react-router-dom";

export const VideoCall = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  if (!state) {
    navigate("/dashboard/user/chats");
  }

  const [calling, setCalling] = useState(false);
  const isConnected = useIsConnected();
  const [appId, setAppId] = useState("1f87e51e470e4fb5ae3fd151cfc35c74");
  const [channel, setChannel] = useState("doubt-session");
  const [token, setToken] = useState(state?.token);

  useJoin(
    { appid: appId, channel: channel, token: token ? token : null },
    calling
  );
  const [micOn, setMic] = useState(true);
  const [cameraOn, setCamera] = useState(true);
  const { localMicrophoneTrack } = useLocalMicrophoneTrack(micOn);
  const { localCameraTrack } = useLocalCameraTrack(cameraOn);
  usePublish([localMicrophoneTrack, localCameraTrack]);
  const remoteUsers = useRemoteUsers();
  return (
    <div className="min-h-screen bg-black_A text-white flex items-center justify-center">
      {isConnected ? (
        <Calling
          LocalUser={LocalUser}
          localCameraTrack={localCameraTrack}
          cameraOn={cameraOn}
          micOn={micOn}
          remoteUsers={remoteUsers}
          RemoteUser={RemoteUser}
          localMicrophoneTrack={localMicrophoneTrack}
          setMic={setMic}
          setCamera={setCamera}
          setCalling={setCalling}
        ></Calling>
      ) : (
        <div className="w-full rounded-md border-2 bg-slate-700 bg-opacity-15 mt-[-100px] max-w-4xl p-4">
          <div className="mt-6 flex justify-center gap-4">
            <div className="text-center pb-6">
              <h2 className="text-2xl font-semibold text-purple-100">
                Join Doubt Session
              </h2>
              <div className="p-4 opacity-50 text-blue-300 flex flex-row space-x-6">
                <h3 className="flex justify-center items-center space-x-2">
                  <AccessAlarmsIcon /> <p>30 minutes</p>
                </h3>{" "}
                <p>|</p>{" "}
                <h3 className="flex justify-center items-center space-x-2">
                  <CalendarMonthIcon /> <p>{state?.doubt.Date}</p>
                </h3>
                <p>|</p>{" "}
                <h3 className="flex justify-center items-center space-x-2">
                  <AccessTimeIcon></AccessTimeIcon> <p>{state?.doubt.Slot}</p>
                </h3>
              </div>
              <div>
                <p className="text-sm opacity-45 p-4 pb-6">
                  " {state?.doubt.Message} "
                </p>
              </div>
              <div className="flex justify-center gap-6 mb-6 ">
                <button
                  onClick={() => setMic(!micOn)}
                  className="hover:scale-110 transition-all text-white border-2 p-2 rounded-full border-opacity-50 border-slate-300 text-opacity-90"
                >
                  {micOn ? <Mic /> : <MicOff></MicOff>}
                </button>
                <button
                  onClick={() => setCamera(!cameraOn)}
                  className="hover:scale-110 transition-all text-white border-2 p-2 rounded-full border-opacity-50 border-slate-300 text-opacity-90"
                >
                  {cameraOn ? <Videocam /> : <VideocamOff />}
                </button>
              </div>

              <button
                variant="contained"
                color="primary"
                onClick={() => setCalling(true)}
                disabled={!appId || !channel}
                className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-md shadow-lg hover:scale-95 duration-200 px-10 py-2"
              >
                Join Channel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCall;

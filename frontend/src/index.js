import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { AppProvider } from "./context/userContext";
import AgoraRTC, { AgoraRTCProvider } from "agora-rtc-react";
const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AppProvider>
      <AgoraRTCProvider client={client}>
        <App />
      </AgoraRTCProvider>
    </AppProvider>
  </React.StrictMode>
);

import pkg from "agora-access-token";
const { RtcTokenBuilder, RtcRole } = pkg;
import dotenv from "dotenv";
dotenv.config();
const APP_ID = process.env.AGORA_APP_ID;
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;
const CHANNEL_NAME = "doubt-session";
const UID = 0;
const ROLE = RtcRole.PUBLISHER;

const privilegeExpiredTs = 0;

export const generateToken = async () => {
  const token = RtcTokenBuilder.buildTokenWithUid(
    APP_ID,
    APP_CERTIFICATE,
    CHANNEL_NAME,
    UID,
    ROLE,
    privilegeExpiredTs
  );
  return token;
};

export default generateToken();

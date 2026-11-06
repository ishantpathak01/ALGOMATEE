import nodemailer from "nodemailer";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

// Render's free tier blocks SMTP ports, so when BREVO_API_KEY is set the
// email goes out over HTTPS instead. Without it, Gmail SMTP is used (local dev).
const sendViaBrevo = async ({ to, subject, text, html }) => {
  await axios.post(
    "https://api.brevo.com/v3/smtp/email",
    {
      sender: { name: "AlgoMate", email: process.env.EMAIL_USER },
      to: [{ email: to }],
      subject,
      htmlContent: html,
      textContent: text,
    },
    {
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json",
        accept: "application/json",
      },
      timeout: 15000,
    }
  );
};

const sendViaGmail = (mailOptions) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  return transporter.sendMail(mailOptions);
};

const sendMail = async (mailOptions) => {
  try {
    if (process.env.BREVO_API_KEY) return await sendViaBrevo(mailOptions);
    return await sendViaGmail(mailOptions);
  } catch (error) {
    console.error("Email send failed:", error.response?.data || error.message);
    throw error;
  }
};

export default sendMail;

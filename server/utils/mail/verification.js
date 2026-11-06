import sendMail from "./transport.js";

const sendVerificationOTP = async ({ email, OTP }) => {
  const mailOptions = {
    from: `AlgoMate <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `OTP Authentication for AlgoMate`,
    text: "Please verify your email address using the OTP.",
    html: `
                <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP Authentication - myOffice</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            background-color: #f9f9f9;
            margin: 0;
            padding: 20px;
        }
        .container {
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            padding: 20px;
            max-width: 600px;
            margin: auto;
        }
        h2 {
            color: #4CAF50;
            margin-top: 0;
        }
        p {
            color: #555555;
            line-height: 1.6;
        }
        .otp {
            display: inline-block;
            background-color: #4CAF50;
            color: white;
            padding: 12px 25px;
            text-align: center;
            text-decoration: none;
            border-radius: 5px;
            font-size: 20px;
            font-weight: bold;
        }
        .footer {
            margin-top: 20px;
            font-size: 0.9em;
            color: #777777;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>OTP Authentication for AlgoMate</h2>
        <p>Hello User 👋,</p>
        <p>We’ve received a request to verify your email address for your account on AlgoMate. To complete the verification process, please use the OTP (One-Time Password) below:</p>
        <p><span class="otp">${OTP}</span></p>
        <p>The OTP is valid for the next 10 minutes. Please do not share this code with anyone.</p>
        <p>If you did not request this, please ignore this email or contact support.</p>
        <p class="footer">Thank you for using AlgoMate!</p>
    </div>
</body>
</html>
            `,
  };

  try {
    const info = await sendMail(mailOptions);
    return { status: 1 };
  } catch (error) {
    return { status: -1 };
  }
};

export default sendVerificationOTP;

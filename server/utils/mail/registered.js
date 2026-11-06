import sendMail from "./transport.js";

const sendVerificationOTP = async ({ email }) => {
  const mailOptions = {
    from: `AlgoMate <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Registration Pending Approval - AlgoMate`,
    text: "Your account has been created successfully and is awaiting approval from the managers.",
    html: `
                <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Approval Pending - AlgoMate</title>
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
        .footer {
            margin-top: 20px;
            font-size: 0.9em;
            color: #777777;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Account Created - Pending Approval</h2>
        <p>Hello,</p>
        <p>Thank you for registering on <b>AlgoMate</b>. Your account has been successfully created but is currently pending approval from our managers (verified mentors).</p>
        <p>Once your request is approved, you will receive a confirmation email, and you can start using the platform.</p>
        <p>If you have any questions or need assistance, feel free to contact our support team.</p>
        <p class="footer">Thank you for choosing AlgoMate!</p>
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

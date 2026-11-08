import sendMail from "./transport.js";

const esc = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );

const siteUrl = () =>
  (process.env.FRONTEND_URL || "http://localhost:3000")
    .split(",")[0]
    .trim()
    .replace(/\/$/, "");

const page = (heading, color, body) => `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 20px;">
  <div style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); padding: 20px; max-width: 600px; margin: auto;">
    <h2 style="color: ${color}; margin-top: 0;">${heading}</h2>
    ${body}
    <p style="color: #999999; font-size: 12px; margin-top: 24px;">AlgoMate</p>
  </div>
</body>
</html>`;

// Never throws: a failed email must not break the approval itself.
const safeSend = async (options) => {
  try {
    await sendMail({
      from: `AlgoMate <${process.env.EMAIL_USER}>`,
      ...options,
    });
    return true;
  } catch (error) {
    return false;
  }
};

export const sendMentorApproved = ({ email, name }) =>
  safeSend({
    to: email,
    subject: "Your AlgoMate mentor application is approved",
    text: `Hi ${name}, your mentor account has been approved. You can now log in at ${siteUrl()}/auth/mentor`,
    html: page(
      "You&rsquo;re approved!",
      "#4CAF50",
      `<p style="color:#555555;line-height:1.6;">Hi ${esc(name)},</p>
       <p style="color:#555555;line-height:1.6;">Your mentor application has been verified. You now have full access to your mentor dashboard.</p>
       <p><a href="${siteUrl()}/auth/mentor" style="background:#4CAF50;color:#ffffff;padding:10px 18px;border-radius:4px;text-decoration:none;">Log in</a></p>`
    ),
  });

export const sendMentorRejected = ({ email, name, reason }) =>
  safeSend({
    to: email,
    subject: "Update on your AlgoMate mentor application",
    text: `Hi ${name}, we could not approve your mentor application. Reason: ${reason}`,
    html: page(
      "Application not approved",
      "#d9534f",
      `<p style="color:#555555;line-height:1.6;">Hi ${esc(name)},</p>
       <p style="color:#555555;line-height:1.6;">We could not approve your mentor application this time.</p>
       <p style="color:#555555;line-height:1.6;"><strong>Reason:</strong> ${esc(reason)}</p>
       <p style="color:#555555;line-height:1.6;">You can update your profile and contact the admin to be reviewed again.</p>`
    ),
  });

export const notifyAdminNewMentor = ({ name, email }) => {
  if (!process.env.ADMIN_EMAIL) return Promise.resolve(false);
  return safeSend({
    to: process.env.ADMIN_EMAIL,
    subject: "New mentor application on AlgoMate",
    text: `${name} (${email}) has applied to become a mentor. Review it at ${siteUrl()}/admin`,
    html: page(
      "New mentor application",
      "#2d6cdf",
      `<p style="color:#555555;line-height:1.6;"><strong>${esc(name)}</strong> (${esc(email)}) has applied to become a mentor.</p>
       <p><a href="${siteUrl()}/admin" style="background:#2d6cdf;color:#ffffff;padding:10px 18px;border-radius:4px;text-decoration:none;">Review application</a></p>`
    ),
  });
};

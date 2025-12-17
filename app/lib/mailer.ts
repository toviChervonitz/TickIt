import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.FROM_EMAIL!,
    pass: process.env.APP_PASSWORD!,
  },
});

const LOGO_URL = "https://tick-it-eight.vercel.app/logo.png";
const LOGIN_URL = "https://tick-it-eight.vercel.app/pages/login";

export async function sendPasswordEmail(
  to: string,
  password: string,
  manager: string
) {
  return transporter.sendMail({
    from: process.env.FROM_EMAIL!,
    to,
    subject: "Your Temporary Password",
    html: emailWrapper(`
      <h2 style="margin:0;color:#1d486a;font-size:22px;font-weight:700;">Your Account Details</h2>

      <p>Hello,</p>

      <p>An account has been created for you in the Account Management System.</p>

      <p>Your project manager is: <strong>${manager}</strong></p>

      <div style="
        background:#f0fbfa;
        border:1px solid #3dd2cc;
        padding:12px 16px;
        margin:20px 0;
        border-radius:10px;
        text-align:center;
      ">
        <div style="color:#1d486a;font-size:14px;">Your temporary password</div>
        <div style="font-size:22px;font-weight:700;margin-top:5px;color:#3bbcb7;">
          ${password}
        </div>
      </div>

      <p>When you first log in, you will be asked to update your details.</p>

      ${loginButton()}
    `),
  });
}

export async function sendExistMail(to: string, manager: string) {
  return transporter.sendMail({
    from: process.env.FROM_EMAIL!,
    to,
    subject: "You Have Been Added to a New Project",
    html: emailWrapper(`
      <h2 style="margin:0;color:#1d486a;font-size:22px;font-weight:700;">You've Been Added to a Project</h2>

      <p>Hello,</p>

      <p>You’ve been added to a new project in the <strong>Account Management System</strong>.</p>

      <p>Your project manager is <strong>${manager}</strong>.</p>

      <p>You can now log in to view the project details and start collaborating with your team.</p>

      ${loginButton()}
    `),
  });
}

export async function sendResetCodeEmail(to: string, code: string) {
  return transporter.sendMail({
    from: process.env.FROM_EMAIL!,
    to,
    subject: "Your Password Reset Code",
    html: emailWrapper(`
      <h2 style="margin:0;color:#1d486a;font-size:22px;font-weight:700;">Password Reset Request</h2>

      <p>Hello,</p>

      <p>You have requested to reset your password. Please use the following code to proceed:</p> 

      <div style="
        background:#fff3f3;
        border:1px solid #e57373;
        padding:14px;
        border-radius:10px;
        margin:20px 0;
        text-align:center;
      ">
        <span style="font-size:26px;color:#d32f2f;font-weight:700;">${code}</span>
      </div>

      <p>This code is valid for the next 10 minutes.</p>

      <p>If you did not request a password reset, please ignore this email.</p>

      ${loginButton()}
    `),
  });
}


function emailWrapper(content: string): string {
  return `
  <div style="
    background:#f4f6f8;
    padding:40px 0;
    font-family: Arial, sans-serif;
    direction:ltr;
    text-align:left;
  ">
    <div style="
      max-width:480px;
      margin:auto;
      background:white;
      padding:30px;
      border-radius:16px;
      box-shadow:0 6px 20px rgba(0,0,0,0.10);
      border-top:6px solid #3dd2cc;
    ">
      <div style="text-align:center;margin-bottom:20px;">
        <img src="${LOGO_URL}" alt="System Logo" style="width:85px;height:auto;" />
      </div>

      <div style="font-size:15px;color:#444;line-height:1.6;">
        ${content}
      </div>

      <p style="font-size:12px;color:#aaa;margin-top:30px;text-align:center;">
        This is an automated message — please do not reply.
      </p>
    </div>
  </div>
  `;
}

function loginButton() {
  return `
    <div style="text-align:center;margin-top:25px;">
      <a href="${LOGIN_URL}"
        style="
          background:#3dd2cc;
          color:white;
          text-decoration:none;
          padding:12px 28px;
          border-radius:10px;
          display:inline-block;
          font-size:15px;
          font-weight:600;
        ">
        Login to System
      </a>
    </div>
  `;
}

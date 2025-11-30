import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure:false,
  auth: {
    user: process.env.FROM_EMAIL!,
    pass: process.env.APP_PASSWORD!,
  },
});
export async function sendPasswordEmail(
  to: string,
  password: string,
  manager: string
) {
  console.log("sending password");
  return transporter.sendMail({
    from: process.env.FROM_EMAIL!,
    to,
    subject: "Your Temporary Password",
    html: `
       <div style="font-family:Arial;direction:rtl;">
         <p>Hello,</p>
         <p>An account has been created for you in the Account Management System.</p>
         <p>Your project manager is: ${manager}</p>
         <p>Your temporary password is:</p>
         <p style="font-weight:bold;font-size:18px;">${password}</p>
         <p>When you first log in, you will be asked to update your details.</p>
       </div>
     `,
  });
}

export async function sendExistMail(to: string, manager: string) {
  console.log("send email");
  return transporter.sendMail({
    from: process.env.FROM_EMAIL!,
    to,
    subject: "You Have Been Added to a New Project",
    html: `
       <div style="font-family: Arial, sans-serif;">
         <p>Hello,</p>
         <p>You’ve been added to a new project in the <strong>Account Management System</strong>.</p>
         <p>You can now log in to view the project details and start collaborating with your team.</p>
         <p>Best regards,<br/>The Project Management Team</p>
       </div>
     `,
  });
}

export async function sendResetCodeEmail(to: string, code: string) {
  console.log("sending reset code email");
  return transporter.sendMail({
    from: process.env.FROM_EMAIL!,
    to,
    subject: "Your Password Reset Code",
    html: `
       <div style="font-family: Arial, sans-serif;">
         <p>Hello,</p>
          <p>You have requested to reset your password. Please use the following code to proceed:</p> 
          <h2 style="color: #2e6c80;">${code}</h2>
          <p>This code is valid for the next 10 minutes.</p>
          <p>If you did not request a password reset, please ignore this email.</p>
          <p>Best regards,<br/>The Support Team</p>
       </div>
     `,
  });
}

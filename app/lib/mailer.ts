// import sgMail from "@sendgrid/mail";

// sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

// export async function sendPasswordEmail(
//   to: string,
//   password: string,
//   manager: string
// ) {
//   const msg = {
//     to,
//     from: process.env.FROM_EMAIL!,
//     subject: "Your Temporary Password",
//     html: `
//       <div style="font-family:Arial;direction:rtl;">
//         <p>Hello,</p>
//         <p>An account has been created for you in the Account Management System.</p>
//         <p>Your project manager is: ${manager}</p>
//         <p>Your temporary password is:</p>
//         <p style="font-weight:bold;font-size:18px;">${password}</p>
//         <p>When you first log in, you will be asked to update your details.</p>
//       </div>
//     `,
//   };
//   await sgMail.send(msg);
// }

// export async function sendExistMail(to: string, manager: string) {
//   const msg = {
//     to,
//     from: process.env.FROM_EMAIL!,
//     subject: "You Have Been Added to a New Project",
//     html: `
//       <div style="font-family: Arial, sans-serif;">
//         <p>Hello,</p>
//         <p>You’ve been added to a new project in the <strong>Account Management System</strong>.</p>
//         <p>You can now log in to view the project details and start collaborating with your team.</p>
//         <p>Best regards,<br/>The Project Management Team</p>
//       </div>
//     `,
//   };
//   await sgMail.send(msg);
// }

// export async function sendResetCodeEmail(to: string, code: string) {
//   try {
//     const msg = {
//       to,
//       from: process.env.FROM_EMAIL!,
//       subject: "Password Reset Code",
//       html: `
//         <div style="font-family:Arial;direction:rtl;">
//           <p>Hello,</p>
//           <p>Your password reset code is:</p>
//           <p style="font-weight:bold;font-size:24px;">${code}</p>
//           <p>This code will expire in 10 minutes.</p>
//         </div>
//       `,
//     };

//     const res = await sgMail.send(msg);
//     console.log("Email sent:", res);
//   } catch (err: any) {
//     console.error("SendGrid error:", err.response?.body || err);
//   }
// }
// export async function sendReminderEmail(to: string, title: string) {
//   try {
//     const msg = {
//       to,
//       from: process.env.FROM_EMAIL!,
//       subject: "Task Reminder",
//       html: `
//         <div style="font-family:Arial;direction:rtl;">
//           <p>Hello,</p>
//           <p>This is a reminder for your to complete your upcoming task: <strong>${title}</strong></p>
//           <p>It's due tomorrow. Please make sure to complete it on time.</p>
//         </div>
//       `,
//     };

//     const res = await sgMail.send(msg);
//     console.log("Email sent:", res);
//   } catch (err: any) {
//     console.error("SendGrid error:", err.response?.body || err);
//   }
// }
import nodemailer from "nodemailer";

// Configure transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,      // e.g., smtp.gmail.com
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,                     // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,     // your email
    pass: process.env.SMTP_PASS,     // your app password or SMTP password
  },
});

// Send temporary password email
export async function sendPasswordEmail(to: string, password: string, manager: string) {
  const mailOptions = {
    from: process.env.FROM_EMAIL,
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
  };

  await transporter.sendMail(mailOptions);
}

// Send "added to new project" email
export async function sendExistMail(to: string, manager: string) {
  const mailOptions = {
    from: process.env.FROM_EMAIL,
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
  };

  await transporter.sendMail(mailOptions);
}

// Send password reset code
export async function sendResetCodeEmail(to: string, code: string) {
  try {
    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to,
      subject: "Password Reset Code",
      html: `
        <div style="font-family:Arial;direction:rtl;">
          <p>Hello,</p>
          <p>Your password reset code is:</p>
          <p style="font-weight:bold;font-size:24px;">${code}</p>
          <p>This code will expire in 10 minutes.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
  } catch (err: any) {
    console.error("Nodemailer error:", err);
  }
}

// Send task reminder email
export async function sendReminderEmail(to: string, title: string) {
  try {
    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to,
      subject: "Task Reminder",
      html: `
        <div style="font-family:Arial;direction:rtl;">
          <p>Hello,</p>
          <p>This is a reminder to complete your upcoming task: <strong>${title}</strong></p>
          <p>It's due tomorrow. Please make sure to complete it on time.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
  } catch (err: any) {
    console.error("Nodemailer error:", err);
  }
}

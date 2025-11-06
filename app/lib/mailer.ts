import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendPasswordEmail(
  to: string,
  password: string,
  manger: string
) {
  const msg = {
    to,
    from: process.env.FROM_EMAIL!,
    subject: "Your Temporary Password",
    html: `
      <div style="font-family:Arial;direction:rtl;">
        <p>Hello,</p>
        <p>Account Management Systems Created for You</p>
        <p>Your project manger is ${manger}</p>
        <p>your temporary password is:</p>
        <p style="font-weight:bold;font-size:18px;">${password}</p>
        <p>When you first log in, you will be asked to update your details.</p>
      </div>
    `,
  };

  await sgMail.send(msg);
}

export async function sendExistMail(to: string, manger: string) {
  const msg = {
    to,
    from: process.env.FROM_EMAIL!,
    subject: "You Have Been Added to a New Project",
    html: `
     <div style="font-family: Arial, sans-serif;">
  <p>Hello,</p>
  <p>You’ve been added to a new project in the <strong>Account Management System</strong>.</p>
  <p>You can now log in to view the project details and start collaborating with your team.</p>
  <p>Best regards,<br/>The Project Management Team</p>
</div>`,
  };

  await sgMail.send(msg);
}

import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendPasswordEmail(to: string, password: string, manger:string) {
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

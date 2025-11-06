import { hashPassword } from "@/app/lib/bcrypt";
import { sendExistMail, sendPasswordEmail } from "@/app/lib/mailer";
import { generatePassword } from "@/utils/generatePassword";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import User from "@/app/models/UserModel";
import ProjectUser from "@/app/models/ProjectUserModel";

export async function POST(req: Request) {
  try {
    const { name, email, manger, projectId } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    //לבדוק אם המשתמש קיים בDB
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      //אם קיים לשלוח מייל ולעדכן בPROJECTUSERS
      sendExistMail(email, manger.name);
      createProjectUser(existingUser._id, projectId, "viewer");
    } else {
      //אם לא קיים  לגנרט סיסמה לשמור בDB לשלוח מייל ולעדכן בPROJECTUSERS

      const tempPassword = generatePassword(8);

      const hashedPassword = hashPassword(tempPassword);

      // TODO store email and password in db

      const newUser = await User.create({
        name: email.split("@")[0],
        email: email,
        password: hashedPassword,
      });

      await sendPasswordEmail(email, tempPassword, manger.name);

      createProjectUser(newUser._id, projectId, "viewer");
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

async function createProjectUser(userId: any, projectId: any, role: string) {
  await ProjectUser.create({
    userId: userId,
    projectId: projectId,
    role: role,
  });
}

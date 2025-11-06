import { sendExistMail, sendPasswordEmail } from "@/app/lib/mailer";
import { generatePassword } from "@/utils/generatePassword";
import { NextResponse } from "next/server";
import User from "@/app/models/UserModel";
import ProjectUser from "@/app/models/ProjectUserModel";
import { hashPassword } from "@/app/lib/bcrypt";

export async function POST(req: Request) {
  try {
    const manager = "manager";
    const { email, projectId } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let user;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      await sendExistMail(email, manager);
      await createProjectUser(existingUser._id, projectId, "viewer");
      user = existingUser;
    } else {
      const tempPassword = generatePassword(8);
      const hashedPassword = await hashPassword(tempPassword);

      const newUser = await User.create({
        name: email.split("@")[0],
        email,
        password: hashedPassword,
      });

      await sendPasswordEmail(email, tempPassword, manager);
      await createProjectUser(newUser._id, projectId, "viewer");
      user = newUser;
    }

    return NextResponse.json({
      name: user.name,
      email: user.email,
      message: "User added successfully",
    });

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
    userId,
    projectId,
    role,
  });
}

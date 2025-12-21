// /app/api/users/addMembers/route.ts
import { generatePassword } from "@/utils/generatePassword";
import { NextResponse } from "next/server";
import User from "@/app/models/UserModel";
import ProjectUser from "@/app/models/ProjectUserModel";
import { hashPassword } from "@/app/lib/bcrypt";
import { getAuthenticatedUser, verifyToken } from "@/app/lib/jwt";
import { sendExistMail, sendPasswordEmail } from "@/app/lib/mailer";
import mongoose from "mongoose";
import { dbConnect } from "@/app/lib/DB";

interface AddMemberBody {
  email?: string;
  projectId: string;
  role?: "viewer" | "manager";
}

export async function POST(req: Request) {
  await dbConnect();
  try {
    const body: AddMemberBody = await req.json();
    const { email, projectId, role = "viewer" } = body;

    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    const currentUser = await getAuthenticatedUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const callerId = currentUser.id;

    const existingManagers = await ProjectUser.find({ projectId, role: "manager" });
    if (existingManagers.length > 0) {
      const caller = await ProjectUser.findOne({ projectId, userId: callerId });
      if (!caller || caller.role !== "manager") {
        return NextResponse.json({ error: "You must be a manager to add members" }, { status: 403 });
      }
    }

    if (role === "manager" && !email) {

      const exists = await ProjectUser.findOne({
        userId: callerId,
        projectId,
        role: "manager"
      });

      if (!exists) {
        await assignUserToProject(callerId, projectId, "manager");
      }

      const user = await User.findById(callerId).select("_id name email");

      return NextResponse.json({
        _id: user!._id,
        name: user!.name,
        email: user!.email,
        message: "Manager added successfully (or already existed)",
      });
    }

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    let user = await User.findOne({ email });

    if (user) {
      const existsInProject = await ProjectUser.findOne({
        projectId,
        userId: user._id,
      });

      if (existsInProject) {
        return NextResponse.json(
          { error: "UserAlreadyExists" },
          { status: 409 }
        );
      }

      await assignUserToProject(user._id as string, projectId, "viewer");
      await sendExistMail(email, role);

      return NextResponse.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        message: "Existing user added to project",
      });
    }

    const tempPassword = generatePassword(8);
    const hashedPassword = await hashPassword(tempPassword);

    user = await User.create({
      name: email.split("@")[0],
      email,
      password: hashedPassword,
    });

    await assignUserToProject(user._id as string, projectId, "viewer");
    await sendPasswordEmail(email, tempPassword, role);

    return NextResponse.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      message: "New user created and added to project",
    });

  } catch (err: any) {
    console.error("AddMembers Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Server error" },
      { status: 500 }
    );
  }
}


async function assignUserToProject(
  userId: string,
  projectId: string,
  role: "viewer" | "manager"
) {
  await ProjectUser.create({ userId, projectId, role });
  return await User.findById(userId).select("_id name email");
}

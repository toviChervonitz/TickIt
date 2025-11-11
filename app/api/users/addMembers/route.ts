// /app/api/users/addMembers/route.ts
import { sendExistMail, sendPasswordEmail } from "@/app/lib/mailer";
import { generatePassword } from "@/utils/generatePassword";
import { NextResponse } from "next/server";
import User from "@/app/models/UserModel";
import ProjectUser from "@/app/models/ProjectUserModel";
import { hashPassword } from "@/app/lib/bcrypt";

interface AddMemberBody {
  email?: string;
  projectId: string;
  role?: "viewer" | "manager";
  userId?: string; // optional, used for manager
}

export async function POST(req: Request) {
  try {
    const body: AddMemberBody = (await req.json()) as AddMemberBody;
    const { email, projectId, role, userId } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let user;
    let assignedRole: "viewer" | "manager" = role || "viewer";

    // If userId is provided (for manager), assign directly
    if (assignedRole === "manager" && userId) {
      await createProjectUser(userId, projectId, "manager");
      const managerUser = await User.findById(userId).select("_id name email");
      if (!managerUser) throw new Error("Manager user not found");
      user = managerUser;
    } else {
      // Normal flow for adding members by email
      if (!email) {
        return NextResponse.json(
          { error: "Email is required" },
          { status: 400 }
        );
      }

      const existingUser = await User.findOne({ email });

      if (existingUser) {
        await sendExistMail(email, assignedRole);
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

        await sendPasswordEmail(email, tempPassword, assignedRole);
        await createProjectUser(newUser._id, projectId, "viewer");
        user = newUser;
      }
    }

    return NextResponse.json({
      name: user.name,
      email: user.email,
      message: `User added successfully as ${assignedRole}`,
      _id: user._id,
    });

  } catch (err: any) {
    console.error("AddMembers Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Server error" },
      { status: 500 }
    );
  }
}

// helper to create ProjectUser
async function createProjectUser(
  userId: string | any,
  projectId: string,
  role: "viewer" | "manager"
) {
  await ProjectUser.create({ userId, projectId, role });
}

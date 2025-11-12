// // /app/api/users/addMembers/route.ts
// import { sendExistMail, sendPasswordEmail } from "@/app/lib/mailer";
// import { generatePassword } from "@/utils/generatePassword";
// import { NextResponse } from "next/server";
// import User from "@/app/models/UserModel";
// import ProjectUser from "@/app/models/ProjectUserModel";
// import { hashPassword } from "@/app/lib/bcrypt";
// import { compareToken } from "@/app/lib/jwt";

// interface AddMemberBody {
//   email?: string;
//   projectId: string;
//   role?: "viewer" | "manager";
//   userId?: string; // optional, used for manager
// }

// export async function POST(req: Request) {
//   try {
//     const body: AddMemberBody = (await req.json()) as AddMemberBody;
//     const { email, projectId, role, userId } = body;

//     if (!projectId) {
//       return NextResponse.json(
//         { error: "Project ID is required" },
//         { status: 400 }
//       );
//     }

//     const authHeader = req.headers.get("authorization");
//     const compareTokenResult = compareToken(userId!, authHeader!);
//     if (!authHeader || !authHeader.startsWith("Bearer ") || !compareTokenResult) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     let user;
//     let assignedRole: "viewer" | "manager" = role || "viewer";

//     // If userId is provided (for manager), assign directly
//     if (assignedRole === "manager" && userId) {
//       await createProjectUser(userId, projectId, "manager");
//       const managerUser = await User.findById(userId).select("_id name email");
//       if (!managerUser) throw new Error("Manager user not found");
//       user = managerUser;
//     } 
//     else {
//       // Normal flow for adding members by email
//       if (!email) {
//         return NextResponse.json(
//           { error: "Email is required" },
//           { status: 400 }
//         );
//       }

//       const existingUser = await User.findOne({ email });

//       if (existingUser) {
//         await sendExistMail(email, assignedRole);
//         await createProjectUser(existingUser._id, projectId, "viewer");
//         user = existingUser;
//       } else {
//         const tempPassword = generatePassword(8);
//         const hashedPassword = await hashPassword(tempPassword);

//         const newUser = await User.create({
//           name: email.split("@")[0],
//           email,
//           password: hashedPassword,
//         });

//         await sendPasswordEmail(email, tempPassword, assignedRole);
//         await createProjectUser(newUser._id, projectId, "viewer");
//         user = newUser;
//       }
//     }

//     return NextResponse.json({
//       name: user.name,
//       email: user.email,
//       message: `User added successfully as ${assignedRole}`,
//       _id: user._id,
//     });

//   } catch (err: any) {
//     console.error("AddMembers Error:", err);
//     return NextResponse.json(
//       { success: false, error: err.message || "Server error" },
//       { status: 500 }
//     );
//   }
// }

// // helper to create ProjectUser
// async function createProjectUser(
//   userId: string | any,
//   projectId: string,
//   role: "viewer" | "manager"
// ) {
//   await ProjectUser.create({ userId, projectId, role });
// }
// /app/api/users/addMembers/route.ts
// /app/api/users/addMembers/route.ts
// /app/api/users/addMembers/route.ts
import { NextResponse } from "next/server";
import User, { IUserDoc } from "@/app/models/UserModel";
import ProjectUser from "@/app/models/ProjectUserModel";
import { sendExistMail, sendPasswordEmail } from "@/app/lib/mailer";
import { generatePassword } from "@/utils/generatePassword";
import { hashPassword } from "@/app/lib/bcrypt";
import { compareToken, getTokenPayload } from "@/app/lib/jwt";
import { dbConnect } from "@/app/lib/DB";

interface AddMemberBody {
  email?: string;
  projectId: string;
  role?: "viewer" | "manager";
  userId?: string; // optional, used for manager addition
}

export async function POST(req: Request) {
  await dbConnect();

  try {
    const body: AddMemberBody = (await req.json()) as AddMemberBody;
    const { email, projectId, role, userId } = body;

    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = getTokenPayload(authHeader);
    if (!payload?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Check that caller is a manager
    const callerRole = await ProjectUser.findOne({
      userId: payload.id,
      projectId,
    });

    if (!callerRole || callerRole.role !== "manager") {
      return NextResponse.json(
        { error: "You must be a manager to add members" },
        { status: 403 }
      );
    }

    let newUser;
    let assignedRole: "viewer" | "manager" = role || "viewer";

    // If adding a manager by userId (direct assignment)
    if (assignedRole === "manager" && userId) {
      await createProjectUser(userId, projectId, "manager");
      newUser = await User.findById(userId).select("_id name email");
      if (!newUser) throw new Error("Manager user not found");
    } else {
      // Adding by email
      if (!email) {
        return NextResponse.json({ error: "Email is required" }, { status: 400 });
      }

      const existingUser = await User.findOne({ email });

      if (existingUser) {
        // User exists
        await sendExistMail(email, assignedRole);
        await createProjectUser(existingUser._id as string, projectId, "viewer");
        newUser = existingUser;
      } else {
        // New user
        const tempPassword = generatePassword(8);
        const hashedPassword = await hashPassword(tempPassword);

        const createdUser = await User.create({
          name: email.split("@")[0],
          email,
          password: hashedPassword,
        });

        await sendPasswordEmail(email, tempPassword, assignedRole);
        await createProjectUser(createdUser._id as string, projectId, "viewer");
        newUser = createdUser;
      }
    }

    return NextResponse.json({
      _id: newUser._id as string,
      name: newUser.name,
      email: newUser.email,
      message: `User added successfully as ${assignedRole}`,
    });

  } catch (err: any) {
    console.error("AddMembers Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Server error" },
      { status: 500 }
    );
  }
}

// Helper: create ProjectUser record
async function createProjectUser(
  userId: string,
  projectId: string,
  role: "viewer" | "manager"
) {
  await ProjectUser.create({ userId, projectId, role });
}

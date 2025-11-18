// // /app/api/users/addMembers/route.ts
// import { sendExistMail, sendPasswordEmail } from "@/app/lib/mailer";
// import { generatePassword } from "@/utils/generatePassword";
// import { NextResponse } from "next/server";
// import User from "@/app/models/UserModel";
// import ProjectUser from "@/app/models/ProjectUserModel";
// import { hashPassword } from "@/app/lib/bcrypt";
// import { compareToken, getTokenPayload } from "@/app/lib/jwt";

// interface AddMemberBody {
//   email?: string;
//   projectId: string;
//   role?: "viewer" | "manager";
// }

// export async function POST(req: Request) {
//   try {
//     const body: AddMemberBody = await req.json();
//     const { email, projectId, role = "viewer" } = body;

//     if (!projectId) {
//       return NextResponse.json(
//         { error: "Project ID is required" },
//         { status: 400 }
//       );
//     }

//     // Verify caller token
//     const authHeader = req.headers.get("authorization");
//     const payload = getTokenPayload(authHeader || "");
//     if (!authHeader || !authHeader.startsWith("Bearer ") || !payload?.id) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     // Check if project already has managers
//     const existingManagers = await ProjectUser.find({
//       projectId,
//       role: "manager",
//     });

//     const userId = payload.id;
//     // If there are managers, caller must be a manager
//     if (existingManagers.length > 0) {
//       const caller = await ProjectUser.findOne({
//         userId: userId,
//         projectId,
//       });
//       if (!caller || caller.role !== "manager") {
//         return NextResponse.json(
//           { error: "You must be a manager to add members" },
//           { status: 403 }
//         );
//       }
//     }

//     const userIdToAdd = await User.findOne({ email }).then((u) => u?._id);
//     if (userIdToAdd) {
//       console.log("check if user exist in this project");

//       const userInProject = await ProjectUser.findOne({ projectId,userIdToAdd });
//       console.log("usr in project", userInProject);

//       if (userInProject) {
//         console.log("user isssssssssss");

//         return NextResponse.json(
//           { error: "UserAlreadyExists" },
//           { status: 409 }
//         );
//       }
//     }

//     let user;

//     // Assign role for this new member
//     const assignedRole = role === "manager" ? "manager" : "viewer";

//     if (assignedRole === "manager" && userId) {
//       // Adding a manager directly via userId (first manager or special case)
//       await createProjectUser(userId, projectId, "manager");
//       user = await User.findById(userId).select("_id name email");
//       if (!user) throw new Error("Manager user not found");
//     } else {
//       // Adding a member by email
//       if (!email) {
//         return NextResponse.json(
//           { error: "Email is required" },
//           { status: 400 }
//         );
//       }

//       const existingUser = await User.findOne({ email });

//       if (existingUser) {
//         // Existing user: assign to project and notify
//         await createProjectUser(
//           existingUser._id as string,
//           projectId,
//           "viewer"
//         );
//         await sendExistMail(email, assignedRole);
//         user = existingUser;
//       } else {
//         // New user: create user, assign password, add to project
//         const tempPassword = generatePassword(8);
//         const hashedPassword = await hashPassword(tempPassword);

//         const newUser = await User.create({
//           name: email.split("@")[0],
//           email,
//           password: hashedPassword,
//         });

//         await createProjectUser(newUser._id as string, projectId, "viewer");
//         await sendPasswordEmail(email, tempPassword, assignedRole);
//         user = newUser;
//       }
//     }

//     return NextResponse.json({
//       _id: user._id as string,
//       name: user.name,
//       email: user.email,
//       message: `User added successfully as ${assignedRole}`,
//     });
//   } catch (err: any) {
//     console.error("AddMembers Error:", err);
//     return NextResponse.json(
//       { success: false, error: err.message || "Server error" },
//       { status: 500 }
//     );
//   }
// }

// // Helper to create ProjectUser
// async function createProjectUser(
//   userId: string,
//   projectId: string,
//   role: "viewer" | "manager"
// ) {
//   await ProjectUser.create({ userId, projectId, role });
// }
// /app/api/users/addMembers/route.ts
import { sendExistMail, sendPasswordEmail } from "@/app/lib/mailer";
import { generatePassword } from "@/utils/generatePassword";
import { NextResponse } from "next/server";
import User from "@/app/models/UserModel";
import ProjectUser from "@/app/models/ProjectUserModel";
import { hashPassword } from "@/app/lib/bcrypt";
import { getTokenPayload } from "@/app/lib/jwt";

interface AddMemberBody {
  email?: string;
  projectId: string;
  role?: "viewer" | "manager";
}

export async function POST(req: Request) {
  try {
    const body: AddMemberBody = await req.json();
    const { email, projectId, role = "viewer" } = body;

    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    const authHeader = req.headers.get("authorization");
    const payload = getTokenPayload(authHeader || "");
    const callerId = payload?.id;

    if (!authHeader || !authHeader.startsWith("Bearer ") || !callerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existingManagers = await ProjectUser.find({ projectId, role: "manager" });
    if (existingManagers.length > 0) {
      const caller = await ProjectUser.findOne({ projectId, userId: callerId });
      if (!caller || caller.role !== "manager") {
        return NextResponse.json({ error: "You must be a manager to add members" }, { status: 403 });
      }
    }

    if (role === "manager" && !email) {
      const user = await assignUserToProject(callerId, projectId, "manager");
      return NextResponse.json({
        _id: user!._id,
        name: user!.name,
        email: user!.email,
        message: "Manager added successfully",
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

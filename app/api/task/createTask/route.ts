// import { NextResponse } from "next/server";
// import { dbConnect } from "@/app/lib/DB";
// import Task from "@/app/models/TaskModel";
// import Project from "@/app/models/ProjectModel";
// import { taskSchema } from "@/app/lib/validation"; // adjust path if needed
// import { compareToken } from "@/app/lib/jwt";

// export async function POST(req: Request) {
//   await dbConnect();

//   try {
//     const body = await req.json();

//     // ✅ Validate input
//     const { error } = taskSchema.validate(body);
//     if (error) {
//       return NextResponse.json({ error: error.message }, { status: 400 });
//     }

//     const { title, content, dueDate, projectId, userId } = body;

//     const authHeader = req.headers.get("authorization");
//     const compareTokenResult = compareToken(userId, authHeader!);
//     if (!authHeader || !authHeader.startsWith("Bearer ") || !compareTokenResult) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     // ✅ Ensure project exists
//     const project = await Project.findById(projectId);
//     if (!project) {
//       return NextResponse.json(
//         { error: "Project not found" },
//         { status: 404 }
//       );
//     }

//     // ✅ Create new task
//     const newTask = await Task.create({
//       title,
//       content,
//       dueDate: dueDate ? new Date(dueDate) : undefined,
//       projectId,
//       userId,
//       status: "todo",
//       createdAt: new Date(),
//     });

//     return NextResponse.json(
//       {
//         message: "Task created successfully",
//         task: newTask,
//       },
//       { status: 200 }
//     );
//   } catch (err: any) {
//     console.error("❌ Task creation error:", err);
//     return NextResponse.json(
//       { error: "Failed to create task", details: err.message },
//       { status: 500 }
//     );
//   }
// }
import { NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/DB";
import Task from "@/app/models/TaskModel";
import Project from "@/app/models/ProjectModel";
import ProjectUser from "@/app/models/ProjectUserModel";
import { taskSchema } from "@/app/lib/validation";
import { compareToken } from "@/app/lib/jwt";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const body = await req.json();
    const { title, content, dueDate, projectId, userId } = body;

    // Validate input
    const { error } = taskSchema.validate(body);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    // Auth check
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ") || !compareToken(userId, authHeader)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure project exists
    const project = await Project.findById(projectId);
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    // ✅ Check manager role via ProjectUser
    const projectUser = await ProjectUser.findOne({ userId, projectId });
    if (!projectUser || projectUser.role !== "manager") {
      return NextResponse.json({ error: "You are not the manager of this project" }, { status: 403 });
    }

    // Create task
    const newTask = await Task.create({
      title,
      content,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      projectId,
      userId,
      status: "todo",
      createdAt: new Date(),
    });

    return NextResponse.json({ message: "Task created successfully", task: newTask }, { status: 200 });

  } catch (err: any) {
    console.error("❌ Task creation error:", err);
    return NextResponse.json({ error: "Failed to create task", details: err.message }, { status: 500 });
  }
}

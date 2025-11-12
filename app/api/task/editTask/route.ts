import { NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/DB";
import Task from "@/app/models/TaskModel";
import Project from "@/app/models/ProjectModel";
import { taskSchema } from "@/app/lib/validation"; // adjust path if needed
import { compareToken, getTokenPayload } from "@/app/lib/jwt"; // assuming you have JWT auth

export async function PUT(req: Request, { params }: { params: { taskId: string } }) {
  await dbConnect();

  try {
    const { taskId } = params;
    const body = await req.json();
    const { content, userId, dueDate, projectId } = body;

    // ✅ Validate input (we can validate only editable fields)
    const { error } = taskSchema.validate({ content, userId, dueDate }, { presence: "optional" });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const authHeader = req.headers.get("authorization");
    const compareTokenResult = compareToken(userId, authHeader!);
    if (!authHeader || !authHeader.startsWith("Bearer ") || !compareTokenResult) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Ensure task exists
    const task = await Task.findById(taskId);
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // ✅ Ensure project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // ✅ Check manager role
    const payload = getTokenPayload();
    if (!payload || !payload.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isManager = project.managers?.includes(payload.id); // adjust according to your schema
    if (!isManager) {
      return NextResponse.json({ error: "You are not authorized to edit this task" }, { status: 403 });
    }

    // ✅ Update allowed fields
    if (content !== undefined) task.content = content;
    if (userId !== undefined) task.userId = userId;
    if (dueDate !== undefined) task.dueDate = new Date(dueDate);

    await task.save();

    return NextResponse.json(
      { message: "Task updated successfully", task },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("❌ Task update error:", err);
    return NextResponse.json(
      { error: "Failed to update task", details: err.message },
      { status: 500 }
    );
  }
}

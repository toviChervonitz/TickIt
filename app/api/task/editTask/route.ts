import { NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/DB";
import Task from "@/app/models/TaskModel";
import Project from "@/app/models/ProjectModel";
import ProjectUser from "@/app/models/ProjectUserModel";
import { taskSchema } from "@/app/lib/validation";
import { compareToken } from "@/app/lib/jwt";

export async function PUT(req: Request, { params }: { params: { taskId: string } }) {
  await dbConnect();

  try {
    const { taskId } = params;
    const body = await req.json();
    const { content, userId, dueDate, projectId } = body;

    // Auth check
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ") || !compareToken(userId, authHeader)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate optional fields
    const { error } = taskSchema.validate({ content, userId, dueDate }, { presence: "optional" });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    const task = await Task.findById(taskId);
    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    const project = await Project.findById(projectId);
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    // ✅ Check manager role
    const projectUser = await ProjectUser.findOne({ userId, projectId });
    if (!projectUser || projectUser.role !== "manager") {
      return NextResponse.json({ error: "You are not authorized to edit this task" }, { status: 403 });
    }

    // Update allowed fields
    if (content !== undefined) task.content = content;
    if (userId !== undefined) task.userId = userId;
    if (dueDate !== undefined) task.dueDate = new Date(dueDate);

    await task.save();

    return NextResponse.json({ message: "Task updated successfully", task }, { status: 200 });

  } catch (err: any) {
    console.error("❌ Task update error:", err);
    return NextResponse.json({ error: "Failed to update task", details: err.message }, { status: 500 });
  }
}

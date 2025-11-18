import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/DB";
import Task from "@/app/models/TaskModel";
import ProjectUser from "@/app/models/ProjectUserModel";

export async function PUT(req: NextRequest, context: { params: any }) {
  await dbConnect();

  // Unwrap params first
  const params = await context.params;
  const { taskId } = params;

  if (!taskId) {
    return NextResponse.json({ error: "Missing taskId" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { content, userId, dueDate, projectId } = body;

    if (!userId || !projectId) {
      return NextResponse.json({ error: "Missing userId or projectId" }, { status: 400 });
    }

    const task = await Task.findById(taskId);
    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    const projectUser = await ProjectUser.findOne({ userId, projectId });
    if (!projectUser || (projectUser.role !== "manager" && task.userId.toString() !== userId)) {
      return NextResponse.json({ error: "You are not authorized to edit this task" }, { status: 403 });
    }

    if (content !== undefined) task.content = content;
    if (dueDate !== undefined) task.dueDate = new Date(dueDate);
    if (userId !== undefined) task.userId = userId;

    await task.save();

    return NextResponse.json({ message: "Task updated successfully", task }, { status: 200 });
  } catch (err: any) {
    console.error("❌ Task update error:", err);
    return NextResponse.json({ error: "Failed to update task", details: err.message }, { status: 500 });
  }
}

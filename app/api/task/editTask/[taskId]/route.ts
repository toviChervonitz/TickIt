import { NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/DB";
import Task from "@/app/models/TaskModel";

export async function PUT(
  req: Request,
  context: { params: Promise<{ taskId: string }> }
) {
  await dbConnect();

  // ✅ FIX: params is a Promise in Next.js 15 — MUST await it
  const { taskId } = await context.params;

  if (!taskId) {
    return NextResponse.json(
      { error: "Missing taskId" },
      { status: 400 }
    );
  }

  const updates = await req.json();

  const updatedTask = await Task.findByIdAndUpdate(taskId, updates, {
    new: true,
  });

  if (!updatedTask) {
    return NextResponse.json(
      { error: "Task not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    message: "Task updated",
    task: updatedTask,
  });
}

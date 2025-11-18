import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/DB";
import Task from "@/app/models/TaskModel";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ taskId: string }> }
) {
  await dbConnect();

  // ⚡ Unwrap params
  const params = await context.params;
  const taskId = params.taskId;

  if (!taskId) {
    return NextResponse.json(
      { error: "Missing taskId" },
      { status: 400 }
    );
  }

  try {
    const task = await Task.findById(taskId);
    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    await task.deleteOne();

    return NextResponse.json(
      { message: "Task deleted successfully" },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("❌ Delete task error:", err);
    return NextResponse.json(
      { error: "Failed to delete task", details: err.message },
      { status: 500 }
    );
  }
}

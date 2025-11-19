import { NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/DB";
import Task from "@/app/models/TaskModel";
import { getAuthenticatedUser } from "@/app/lib/jwt";
import ProjectUser from "@/app/models/ProjectUserModel";

export async function PUT(
  req: Request,
  context: { params: Promise<{ taskId: string }> }
) {
  await dbConnect();

  const currentUser = await getAuthenticatedUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { taskId } = await context.params;

  if (!taskId) {
    return NextResponse.json(
      { error: "Missing taskId" },
      { status: 400 }
    );
  }

  const task = await Task.findById(taskId).select("projectId");

  if (!task) {
    return NextResponse.json(
      { error: "Task not found" },
      { status: 404 }
    );
  }

  const projectId = task.projectId.toString();

  const isManager = await ProjectUser.findOne({
    userId: currentUser.id,
    projectId,
    role: "manager",
  });

  if (!isManager) {
    return NextResponse.json(
      { error: "Forbidden - Only managers can edit tasks" },
      { status: 403 }
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

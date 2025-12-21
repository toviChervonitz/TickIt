import { NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/DB";
import Task from "@/app/models/TaskModel";
import "@/app/models/ProjectModel";
import "@/app/models/UserModel";
import { getAuthenticatedUser } from "@/app/lib/jwt";
import ProjectUser from "@/app/models/ProjectUserModel";
import Pusher from "pusher";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

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

  const taskToUpdate: any = await Task.findById(taskId).select("projectId userId").lean();

  if (!taskToUpdate) {
    return NextResponse.json(
      { error: "Task not found" },
      { status: 404 }
    );
  }

  const oldAssigneeId = taskToUpdate.userId.toString();
  const projectId = taskToUpdate.projectId.toString();

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

  const updatedTaskRaw = await Task.findByIdAndUpdate(taskId, updates, {
    new: true, 
  });

  if (!updatedTaskRaw) {
    return NextResponse.json(
      { error: "Task not found after update" },
      { status: 404 }
    );
  }

  const updatedTaskPopulated: any = await Task.findById(taskId)
    .populate("userId", "name")
    .populate("projectId", "name color")
    .lean();

  if (!updatedTaskPopulated) {
    return NextResponse.json(
      { error: "Failed to populate updated task" },
      { status: 500 }
    );
  }


  const newAssigneeId = updatedTaskPopulated.userId._id.toString();

  try {
    if (oldAssigneeId && oldAssigneeId !== newAssigneeId) {
      await pusher.trigger(
        `private-user-${oldAssigneeId}`,
        "task-updated",
        {
          action: "DELETE", 
          taskId: taskId
        }
      );
    }

    await pusher.trigger(
      `private-user-${newAssigneeId}`,
      "task-updated",
      {
        action: "UPDATE",
        task: updatedTaskPopulated 
      }
    );
  } catch (pusherError) {
    console.error("Pusher error on task update:", pusherError);
  }

  return NextResponse.json({
    message: "Task updated successfully",
    task: updatedTaskPopulated, 
  });
}
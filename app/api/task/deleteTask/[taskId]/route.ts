import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/DB";
import Task from "@/app/models/TaskModel";
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

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ taskId: string }> }
) {
  await dbConnect();

  const params = await context.params;
  const taskId = params.taskId;

  if (!taskId) {
    return NextResponse.json(
      { error: "Missing taskId" },
      { status: 400 }
    );
  }

  try {

    const currentUser = await getAuthenticatedUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    const projectUser = await ProjectUser.findOne({
      projectId: task.projectId,
      userId: currentUser.id,
      role: "manager"
    });

    const isManager = !!projectUser;

    if (!isManager) {
      return NextResponse.json(
        { error: "Forbidden - You cannot delete this task" },
        { status: 403 }
      );
    }

    const assigneeIdToDelete = task.userId.toString();

    try {
      await pusher.trigger(
        `private-user-${assigneeIdToDelete}`,
        "task-updated",
        {
          action: "DELETE",
          taskId: taskId 
        }
      );
      console.log(`Pusher trigger sent to assignee ${assigneeIdToDelete} for task deletion.`);
    } catch (pusherError) {
      console.error("Pusher error on task deletion:", pusherError);
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

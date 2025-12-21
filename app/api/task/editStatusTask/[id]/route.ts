import { dbConnect } from "@/app/lib/DB";
import {getAuthenticatedUser } from "@/app/lib/jwt";
import ProjectUser from "@/app/models/ProjectUserModel";
import Task from "@/app/models/TaskModel";
import { NextResponse } from "next/server";
import "@/app/models/UserModel";
import "@/app/models/ProjectModel";
import Pusher from "pusher";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {

  await dbConnect();

  try {
    const { id: taskId } = await context.params;
    var { status } = await req.json();

    status = status?.toLowerCase();

    if (!status) return NextResponse.json({ error: "Missing status field" }, { status: 400 });

    const currentUser = await getAuthenticatedUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const task = await Task.findById(taskId);
    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    const projectUser = await ProjectUser.findOne({ userId: currentUser.id, projectId: task.projectId });
    if (!projectUser) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const role = projectUser.role;
    const isOwner = task.userId.toString() === currentUser.id;

    if (!isOwner && role !== "manager") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const oldStatus = task.status.toLowerCase();

    task.status = status;

    if(status === 'done' && oldStatus !== 'done') {
      task.completedDate = new Date();
    } 
    else if(status !== 'done' && oldStatus === 'done') {
      task.completedDate = null;
    }

    task.status = status;

    const updatedTaskRaw = await task.save();

    const updatedTaskPopulated = await Task.findById(updatedTaskRaw._id)
      .populate("userId", "name")
      .populate("projectId", "name color")
      .lean();

    if (!updatedTaskPopulated) {
      throw new Error("Failed to populate task after status update");
    }

    const assigneeId = task.userId.toString();

    try {
      await pusher.trigger(
        `private-user-${assigneeId}`,
        "task-updated",
        {
          action: "UPDATE",
          task: updatedTaskPopulated
        }
      );
    } catch (pusherError) {
      console.error("Pusher error on status update:", pusherError);
    }

    //check if this work (update status task in projectTask...)
    try {
      await pusher.trigger(
        `private-project-${task.projectId}`,
        "task-updated",
        {
          action: "UPDATE",
          task: updatedTaskPopulated,
        }
      );
    } catch (pusherError) {
      console.error("Pusher error on status update:", pusherError);
    }

    return NextResponse.json({ status: "success", message: "Task status updated successfully", task: updatedTaskPopulated }, { status: 200 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Server error", details: err.message }, { status: 500 });
  }
}

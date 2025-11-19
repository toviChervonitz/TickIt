import { dbConnect } from "@/app/lib/DB";
import { compareToken, getAuthenticatedUser } from "@/app/lib/jwt";
import ProjectUser from "@/app/models/ProjectUserModel";
import Task from "@/app/models/TaskModel";
import { NextResponse } from "next/server";

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  console.log("🟦 PUT /editStatusTask started");

  await dbConnect();

  try {
    const { id: taskId } = await context.params;
    const { status } = await req.json();

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


    if (status.toLowerCase() === "done") {
      task.completedDate = new Date();
    } else if (role === "manager") {
      task.completedDate = undefined;
    }

    task.status = status;

    await task.save();

    return NextResponse.json({ status: "success", message: "Task status updated successfully", task }, { status: 200 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Server error", details: err.message }, { status: 500 });
  }
}

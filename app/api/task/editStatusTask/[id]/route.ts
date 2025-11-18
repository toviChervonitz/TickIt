import { dbConnect } from "@/app/lib/DB";
import { compareToken, getTokenPayload } from "@/app/lib/jwt";
import ProjectUser from "@/app/models/ProjectUserModel";
import Task from "@/app/models/TaskModel";
import { NextResponse } from "next/server";

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  console.log("🟦 PUT /editStatusTask started");

  await dbConnect();

  try {
    const { id: taskId } = await context.params;
    const body = await req.json();
    const { id, status } = body;

    if (!status) return NextResponse.json({ error: "Missing status field" }, { status: 400 });

    const task = await Task.findById(taskId);
    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    const authHeader = req.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const logId = getTokenPayload(authHeader);

    const projectUser = await ProjectUser.findOne({ userId: logId.id, projectId: task.projectId });
    if (!projectUser) {
      return NextResponse.json({ status: "success", message: "No role found", role: null }, { status: 200 });
    }

    const role = projectUser.role;
    const compareTokenResult = compareToken(id, authHeader);

    if (!authHeader.startsWith("Bearer ") || !compareTokenResult) {
      // Only allow managers
      if (role !== "manager") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    // ✅ At this point:
    // Managers can do anything
    // Viewers will be allowed to update status (completedDate)
    if (status.toLowerCase() === "done") {
      task.completedDate = new Date();
    } else if (role === "manager") {
      // Only managers can clear completedDate if they want
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

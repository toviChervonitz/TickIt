import { NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/DB";
import "@/app/models/ProjectModel";
import "@/app/models/UserModel";
import Task from "@/app/models/TaskModel";
import { getAuthenticatedUser } from "@/app/lib/jwt";
import ProjectUser from "@/app/models/ProjectUserModel";

export async function GET() {
  await dbConnect();

  try {
    const currentUser = await getAuthenticatedUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const archivedLinks = await ProjectUser.find({
      userId: currentUser.id,
      isArchived: true,
    }).select("projectId");

    const archivedProjectIds = archivedLinks.map((l) => l.projectId);

    const tasks = await Task.find({
      userId: currentUser.id,
      projectId: { $nin: archivedProjectIds },
    })
      .populate("userId", "name")
      .populate("projectId", "name color");

    if (!tasks || tasks.length === 0) {
      return NextResponse.json(
        { status: "success", message: "No tasks found", tasks: [] },
        { status: 200 }
      );
    }
    return NextResponse.json(
      {
        status: "success",
        message: "Tasks fetched successfully",
        count: tasks.length,
        tasks,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Get Tasks Error:", err);
    return NextResponse.json(
      { status: "error", message: "Server error" },
      { status: 500 }
    );
  }
}

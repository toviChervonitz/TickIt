import { NextResponse } from "next/server";
import TaskModel from "@/app/models/TaskModel";
import "@/app/models/ProjectModel";
import ProjectUserModel from "@/app/models/ProjectUserModel";
import { dbConnect } from "@/app/lib/DB";
import { getAuthenticatedUser } from "@/app/lib/jwt";
import { Types } from "mongoose";

export async function GET(req: Request) {
  await dbConnect();

  try {
    const currentUser = await getAuthenticatedUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const days = Number(url.searchParams.get("days") || 2);

    const pastDate = new Date();
    pastDate.setDate(new Date().getDate() - days);

    const userObjectId = new Types.ObjectId(currentUser.id);

    const tasks = await TaskModel.find({
      userId: userObjectId,
      createdAt: { $gte: pastDate },
    }).populate("projectId", "name");

    const filteredTasks: typeof tasks = [];

    for (const task of tasks) {
      if (!task.projectId) {
        filteredTasks.push(task);
        continue;
      }

      const userProject = await ProjectUserModel.findOne({
        userId: userObjectId,
        projectId: task.projectId._id,
      });

      if (!userProject || userProject.role !== "manager") {
        filteredTasks.push(task);
      }
    }

    return NextResponse.json(filteredTasks);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch recent tasks", details: err.message }, { status: 500 });
  }
}

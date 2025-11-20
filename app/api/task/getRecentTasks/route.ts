// import { NextResponse } from "next/server";
// import TaskModel from "@/app/models/TaskModel";
// import { Types } from "mongoose";

// export async function GET(req: Request) {
//   try {
//     const url = new URL(req.url);
//     const userId = url.searchParams.get("userId");
//     const days = Number(url.searchParams.get("days") || 2);

//     if (!userId) {
//       return NextResponse.json({ error: "Missing userId" }, { status: 400 });
//     }

//     const now = new Date();
//     const pastDate = new Date();
//     pastDate.setDate(now.getDate() - days);

//     // Query: tasks created in the last `days` and user is not the project manager
//     const tasks = await TaskModel.find({
//       userId: new Types.ObjectId(userId),
//       createdAt: { $gte: pastDate },
//       $expr: { $ne: ["$userId", "$projectId"] },
//     }).populate("projectId", "name"); // populate project name

//     return NextResponse.json(tasks);
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json({ error: "Failed to fetch recent tasks" }, { status: 500 });
//   }
// }
import { NextResponse } from "next/server";
import TaskModel from "@/app/models/TaskModel";
import { Types } from "mongoose";
import ProjectUserModel from "@/app/models/ProjectUserModel";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    const days = Number(url.searchParams.get("days") || 2);

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const pastDate = new Date();
    pastDate.setDate(new Date().getDate() - days);

    const userObjectId = new Types.ObjectId(userId);

    // 1️⃣ Fetch tasks assigned to this user in last `days` days
    let tasks = await TaskModel.find({
      userId: userObjectId,
      createdAt: { $gte: pastDate },
    }).populate("projectId", "name");

    // 2️⃣ Filter out tasks where user is the manager
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
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch recent tasks" }, { status: 500 });
  }
}

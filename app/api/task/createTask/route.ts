import { NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/DB";
import Task from "@/app/models/TaskModel";
import Project from "@/app/models/ProjectModel";
import { taskSchema } from "@/app/lib/validation"; // adjust path if needed

export async function POST(req: Request) {
  await dbConnect();

  try {
    const body = await req.json();

    // ✅ Validate input
    const { error } = taskSchema.validate(body);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const { title, content, dueDate, projectId, userId } = body;

    // ✅ Ensure project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // ✅ Create new task
    const newTask = await Task.create({
      title,
      content,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      projectId,
      userId,
      status: "todo",
      createdAt: new Date(),
    });

    return NextResponse.json(
      {
        message: "Task created successfully",
        task: newTask,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("❌ Task creation error:", err);
    return NextResponse.json(
      { error: "Failed to create task", details: err.message },
      { status: 500 }
    );
  }
}

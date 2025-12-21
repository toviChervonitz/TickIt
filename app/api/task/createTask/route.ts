import { NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/DB";
import Task from "@/app/models/TaskModel";
import Project from "@/app/models/ProjectModel";
import "@/app/models/UserModel";
import ProjectUser from "@/app/models/ProjectUserModel";
import { taskSchema } from "@/app/lib/validation";
import Pusher from "pusher";
import { getAuthenticatedUser } from "@/app/lib/jwt";


const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

export async function POST(req: Request) {
  await dbConnect();

  try {
    const body = await req.json();
    const { title, content, dueDate, projectId, userId } = body;

    // Validate input
    const { error } = taskSchema.validate(body);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const currentUser = await getAuthenticatedUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const loggedInUserId = currentUser.id;

    // Ensure project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // ✅ Check that logged-in user is manager of the project
    const projectUser = await ProjectUser.findOne({ userId: loggedInUserId, projectId });
    if (!projectUser || projectUser.role !== "manager") {
      return NextResponse.json({ error: "You are not the manager of this project" }, { status: 403 });
    }

    // Create task (assigned to userId from body)
    const newTask = await Task.create({
      title,
      content,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      projectId,
      userId, // task assignee
      status: "todo",
      createdAt: new Date(),
    });

    const populatedTask = await Task.findById(newTask._id)
      .populate('userId', 'name') 
      .populate('projectId', 'name color') 
      .lean();

    await pusher.trigger(
      `private-user-${userId}`, 
      "task-updated",          
      {
        action: "ADD",         
        task: populatedTask         
      }
    );

    return NextResponse.json({ message: "Task created successfully", task: populatedTask }, { status: 200 });

  } catch (err: any) {
    console.error("❌ Task creation error:", err);
    return NextResponse.json({ error: "Failed to create task", details: err.message }, { status: 500 });
  }
}


import { NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/DB";
import Pusher from "pusher";
import { getAuthenticatedUser } from "@/app/lib/jwt";
import Project from "@/app/models/ProjectModel";
import ChatMessage from "@/app/models/ChatMessageModel";

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
    const { userId, projectId, message } = body;

    const currentUser = await getAuthenticatedUser();
    if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const project = await Project.findById(projectId);
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    // Create the chat message
    const newMessage = await ChatMessage.create({
      userId,
      projectId,
      message,
      createdAt: new Date(),
    });

    // Populate the user info
    await newMessage.populate("userId", "_id name image");

    // Convert to plain object and reformat
    const messageObj = newMessage.toObject();
    messageObj.user = messageObj.userId
      ? {
          _id: messageObj.userId._id,
          name: messageObj.userId.name,
          image: messageObj.userId.image,
        }
      : { _id: "unknown", name: "Unknown", image: undefined };
    delete messageObj.userId;

    // Trigger Pusher to **project channel** so all members get the update
    await pusher.trigger(`private-project-${projectId}`, "chatMessage-updated", {
      action: "ADD",
      chatMessage: messageObj,
    });

    return NextResponse.json({ chatMessage: messageObj }, { status: 200 });
  } catch (err: any) {
    console.error("❌ Chat Message creation error:", err);
    return NextResponse.json(
      { error: "Failed to create chat message", details: err.message },
      { status: 500 }
    );
  }
}

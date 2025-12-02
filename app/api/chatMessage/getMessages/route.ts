import { dbConnect } from "@/app/lib/DB";
import { getAuthenticatedUser } from "@/app/lib/jwt";
import ProjectUser from "@/app/models/ProjectUserModel";
import ChatMessage from "@/app/models/ChatMessageModel";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { status: "error", message: "projectId is required" },
        { status: 400 }
      );
    }

    // Authenticate user
    const currentUser = await getAuthenticatedUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure user belongs to the project
    const membership = await ProjectUser.findOne({
      projectId,
      userId: currentUser.id,
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Forbidden - You do not belong to this project" },
        { status: 403 }
      );
    }

    // Fetch chat messages
    const messages = await ChatMessage.find({ projectId })
      .populate("userId", "name image")
      .sort({ createdAt: 1 });

    return NextResponse.json(
      {
        status: "success",
        message: "Chat fetched successfully",
        chat: messages.map((msg) => ({
          id: msg._id,
          user: msg.userId,
          message: msg.message,
          createdAt: msg.createdAt,
        })),
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Get Chat Error:", err);
    return NextResponse.json(
      { status: "error", message: "Server error" },
      { status: 500 }
    );
  }
}

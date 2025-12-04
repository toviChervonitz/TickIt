
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
    const skip = parseInt(searchParams.get("skip") ?? "0");
    const limit = parseInt(searchParams.get("limit") ?? "30");

    if (!projectId) {
      return NextResponse.json(
        { status: "error", message: "projectId is required" },
        { status: 400 }
      );
    }

    const currentUser = await getAuthenticatedUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    const rawMessages = await ChatMessage.find({ projectId })
      .populate("userId", "_id name image")
      .sort({ createdAt: -1 }) // newest first
      .skip(skip)
      .limit(limit);

    // re-sort oldest → newest for the UI
    const ordered = rawMessages.reverse();

    const messages = ordered.map((msg) => {
      const obj = msg.toObject();
      return {
        id: obj._id,
        message: obj.message,
        createdAt: obj.createdAt,
        user: obj.userId ?? {
          _id: "unknown",
          name: "Unknown",
          image: undefined,
        },
      };
    });

    return NextResponse.json(
      {
        status: "success",
        chat: messages,
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

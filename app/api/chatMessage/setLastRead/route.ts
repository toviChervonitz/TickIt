import { NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/DB";
import { getAuthenticatedUser } from "@/app/lib/jwt";
import ChatRead from "@/app/models/ChatReadModel";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const currentUser = await getAuthenticatedUser();
    if (!currentUser) {
      return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { projectId, lastReadMessageId } = body;

    if (!projectId || !lastReadMessageId) {
      return NextResponse.json(
        { status: "error", message: "projectId and lastReadMessageId are required" },
        { status: 400 }
      );
    }

    // Upsert: create or update
    const chatRead = await ChatRead.findOneAndUpdate(
      { userId: currentUser.id, projectId },
      { lastReadMessageId },
      { new: true, upsert: true }
    );

    return NextResponse.json({
      status: "success",
      lastReadMessageId: chatRead.lastReadMessageId,
    }, { status: 200 });
  } catch (err: any) {
    console.error("Set ChatRead Error:", err);
    return NextResponse.json({ status: "error", message: "Server error" }, { status: 500 });
  }
}

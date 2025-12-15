import { NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/DB";
import { getAuthenticatedUser } from "@/app/lib/jwt";
import ChatRead from "@/app/models/ChatReadModel";

export async function GET(req: Request) {
  await dbConnect();

  try {
    const currentUser = await getAuthenticatedUser();
    if (!currentUser) {
      return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const projectId = url.searchParams.get("projectId");
    if (!projectId) {
      return NextResponse.json({ status: "error", message: "projectId is required" }, { status: 400 });
    }

    const chatRead = await ChatRead.findOne({ userId: currentUser.id, projectId });

    return NextResponse.json({
      status: "success",
      lastReadMessageId: chatRead?.lastReadMessageId || null,
    }, { status: 200 });
  } catch (err: any) {
    console.error("Get ChatRead Error:", err);
    return NextResponse.json({ status: "error", message: "Server error" }, { status: 500 });
  }
}

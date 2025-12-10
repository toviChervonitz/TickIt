import { dbConnect } from "@/app/lib/DB";
import ProjectUser from "@/app/models/ProjectUserModel";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await dbConnect();
  const { userId, projectId } = await req.json();
  try {
    await ProjectUser.findOneAndUpdate(
      { userId, projectId },
      { $set: { lastOpenedAt: new Date() } }
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Get Projects Error:", err);
    return NextResponse.json(
      { status: "error", message: "Server error" },
      { status: 500 }
    );
  }
}

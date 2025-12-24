import { dbConnect } from "@/app/lib/DB";
import { getAuthenticatedUser } from "@/app/lib/jwt";
import ProjectUser from "@/app/models/ProjectUserModel";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await dbConnect();
  const { projectId } = await req.json();
  const currentUser = await getAuthenticatedUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await ProjectUser.findOneAndUpdate(
      { userId:currentUser.id, projectId },
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

import { dbConnect } from "@/app/lib/DB";
import ProjectUser from "@/app/models/ProjectUserModel";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  await dbConnect();
  const { userId, projectId, isArchive } = await req.json();
  try {
    await ProjectUser.findOneAndUpdate(
      { userId, projectId },
      { $set: { isArchived: isArchive } }
    );
    console.log("in archive route");

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Get Projects Error:", err);
    return NextResponse.json(
      { status: "error", message: "Server error" },
      { status: 500 }
    );
  }
}

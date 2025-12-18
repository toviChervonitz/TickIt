import { dbConnect } from "@/app/lib/DB";
import { getAuthenticatedUser } from "@/app/lib/jwt";
import ProjectUser from "@/app/models/ProjectUserModel";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  await dbConnect();
  const { projectId, isArchive } = await req.json();

  try {
    const currentUser = await getAuthenticatedUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await ProjectUser.findOneAndUpdate(
      { userId: currentUser.id, projectId },
      { $set: { isArchived: isArchive } }
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("patch archived Error:", err);
    return NextResponse.json(
      { status: "error", message: "Server error" },
      { status: 500 }
    );
  }
}

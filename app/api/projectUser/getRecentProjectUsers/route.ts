import { dbConnect } from "@/app/lib/DB";
import { getAuthenticatedUser } from "@/app/lib/jwt";
import ProjectUser from "@/app/models/ProjectUserModel";
import '@/app/models/ProjectModel'
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  await dbConnect();

  try {
    const currentUser = await getAuthenticatedUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(now.getDate() - 2);

    
    const recentProjectUsers = await ProjectUser.find({
      userId: currentUser.id,
      role: { $ne: "manager" },
      createdAt: { $gte: twoDaysAgo },
    }).populate("projectId", "name"); 

    return NextResponse.json({
      status: "success",
      message: "Recent projects fetched successfully",
      projects: recentProjectUsers.map((pu) => pu.projectId),
    }, { status: 200 });

  } catch (err: any) {
    console.error("Get Recent ProjectUsers Error:", err);
    return NextResponse.json(
      { status: "error", message: "Server error" },
      { status: 500 }
    );
  }
}

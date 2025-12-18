// app/api/projectUsers/recent/route.ts
import { dbConnect } from "@/app/lib/DB";
import { getAuthenticatedUser } from "@/app/lib/jwt";
import ProjectUser from "@/app/models/ProjectUserModel";
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

    // Find projectUser entries for the current user created in last 2 days
    // AND role is NOT 'manager'
    const recentProjectUsers = await ProjectUser.find({
      userId: currentUser.id,
      role: { $ne: "manager" },
      createdAt: { $gte: twoDaysAgo },
    }).populate("projectId", "name"); // optional: populate project name

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

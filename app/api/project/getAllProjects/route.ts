import { dbConnect } from "@/app/lib/DB";
import { compareToken, getTokenPayload, verifyToken } from "@/app/lib/jwt";
import Project from "@/app/models/ProjectModel";
import ProjectUser from "@/app/models/ProjectUserModel";
import useAppStore from "@/app/store/useAppStore";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
 

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  await dbConnect();
  try {

    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")||compareToken(userId, authHeader)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { status: "error", message: "userId is required" },
        { status: 400 }
      );
    }

    const projectLinks = await ProjectUser.find({ userId }).select("projectId");

    if (!projectLinks.length) {
      return NextResponse.json(
        { status: "success", message: "No projects found", projects: [] },
        { status: 200 }
      );
    }

    const projectIds = projectLinks.map((link) => link.projectId);

    const projects = await Project.find({ _id: { $in: projectIds } });

    return NextResponse.json(
      {
        status: "success",
        message: "Projects fetched successfully",
        count: projects.length,
        projects,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Get Projects Error:", err);
    return NextResponse.json(
      { status: "error", message: "Server error" },
      { status: 500 }
    );
  }
}

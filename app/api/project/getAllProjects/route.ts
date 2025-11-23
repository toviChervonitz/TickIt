import { dbConnect } from "@/app/lib/DB";
import { compareToken, getAuthenticatedUser } from "@/app/lib/jwt";
import Project from "@/app/models/ProjectModel";
import ProjectUser from "@/app/models/ProjectUserModel";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  await dbConnect();

  try {
    const currentUser = await getAuthenticatedUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = currentUser.id;

    const projectLinks = await ProjectUser.find({ userId })
      .populate("projectId")
      .select("projectId role");

    if (!projectLinks.length) {
      return NextResponse.json(
        {
          status: "success",
          message: "No projects found",
          count: 0,
          projects: [],
        },
        { status: 200 }
      );
    }

    console.log("projects link in router", projectLinks);
    const projectsWithRoles = projectLinks.map((link) => ({
      project: link.projectId,
      role: link.role,
    }));

    return NextResponse.json(
      {
        status: "success",
        message: "Projects fetched successfully",
        count: projectsWithRoles.length,
        projects: projectsWithRoles,
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

import { dbConnect } from "@/app/lib/DB";
import { getAuthenticatedUser } from "@/app/lib/jwt";
import "@/app/models/ProjectModel";
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

    // const projectLinks = await ProjectUser.find({ userId, isArchive: false })
    const projectLinks = await ProjectUser.find({ userId})
      .populate("projectId")
      .select("projectId role")
      .select("lastOpenedAt")
      .select("isArchived")
      .sort({ lastOpenedAt: -1 });
    console.log("projectLink", projectLinks);

    const projectsWithRoles = projectLinks.map((link) => ({
      project: link.projectId,
      role: link.role,
      lastOpenedAt: link.lastOpenedAt,
      isArchived:link.isArchived
    }));

    if (!projectsWithRoles.length) {
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

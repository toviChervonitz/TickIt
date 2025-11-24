import { dbConnect } from "@/app/lib/DB";
import ProjectUserModel from "@/app/models/ProjectUserModel";
import Project from "@/app/models/ProjectModel";
import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/app/lib/jwt";

export async function PUT(
  req: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  await dbConnect();
    const currentUser = await getAuthenticatedUser();
    if (!currentUser) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { projectId } = await context.params;

    if (!projectId) {
        return NextResponse.json(
            { error: "Missing projectId" },
            { status: 400 }
        );
    }
    const project = await Project.findById(projectId);
    if (!project) {
        return NextResponse.json(
            { error: "Project not found" },
            { status: 404 }
        );
    }
    const isManager = await ProjectUserModel.findOne({
        userId: currentUser.id,
        projectId,
        role: "manager",
    }); 
    if (!isManager) {
        return NextResponse.json(
            { error: "Forbidden - Only managers can edit projects" },
            { status: 403 }
        );
    }const updates = await req.json();

    const updatedProject = await Project.findByIdAndUpdate(
        projectId,
        updates,
        { new: true }
    );
    if (!updatedProject) {
        return NextResponse.json(
            { error: "Project not found" },
            { status: 404 }
        );
    }
    return NextResponse.json(
        { message: "Project updated successfully", project: updatedProject },
        { status: 200 }
    );
}
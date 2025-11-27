import { dbConnect } from "@/app/lib/DB";
import ProjectUserModel from "@/app/models/ProjectUserModel";
import Project from "@/app/models/ProjectModel";
import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/app/lib/jwt";
import Pusher from "pusher";

const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID!,
    key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
    secret: process.env.PUSHER_SECRET!,
    cluster: process.env.PUSHER_CLUSTER!,
    useTLS: true,
});

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
    } const updates = await req.json();

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

    const updatedProjectObject = updatedProject.toObject();

    try {
        const projectUsers = await ProjectUserModel.find({ projectId }).select('userId').lean();
        const userIds = projectUsers.map(pu => pu.userId.toString());

        const userChannels = userIds.map(id => `private-user-${id}`);

        await pusher.trigger(
            userChannels,                      
            "project-list-updated",             
            { project: updatedProjectObject }   
        );
        console.log(`Global Pusher trigger sent to ${userChannels.length} users for project list update.`);
    } catch (globalPusherError) {
        console.error("Pusher error on global project list update:", globalPusherError);
    }

    try {
        await pusher.trigger(
            `private-project-${projectId}`,
            "project-updated",
            {
                action: "UPDATE",
                project: updatedProjectObject
            }
        );
        console.log(`Pusher trigger sent to project ${projectId} for update.`);
    } catch (pusherError) {
        console.error("Pusher error on project update:", pusherError);
    }

    return NextResponse.json(
        { message: "Project updated successfully", project: updatedProjectObject },
        { status: 200 }
    );
}


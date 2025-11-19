import { NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/DB";
import Project from "@/app/models/ProjectModel";
import { projectSchema } from "@/app/lib/validation";
import { getAuthenticatedUser } from "@/app/lib/jwt";
import ProjectUser from "@/app/models/ProjectUserModel";

export async function POST(req: Request) {
    await dbConnect();

    try {

        const body = await req.json();
        delete body.userId;

        const currentUser = await getAuthenticatedUser();
        if (!currentUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { error } = projectSchema.validate(body);
        if (error) {
            return NextResponse.json(
                { status: "error", message: error.message },
                { status: 400 }
            );
        }

        const project = await Project.create({
            name: body.name,
            description: body.description,
        });

        await ProjectUser.create({
            userId: currentUser.id,
            projectId: project._id,
            role: "manager",
        });

        return NextResponse.json(
            {
                status: "success",
                message: "Project created successfully",
                project,
            },
            { status: 201 }
        );

    } catch (err: any) {
        console.error("Login Error:", err);
        return NextResponse.json(
            { status: "error", message: "Server error" },
            { status: 500 }
        );
    }
}

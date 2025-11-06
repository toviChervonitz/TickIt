import { NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/DB";
import Project from "@/app/models/ProjectModel";
import { projectSchema } from "@/app/lib/validation";
import { log } from "console";

export async function POST(req: Request) {
    await dbConnect();
    try {
        const body = await req.json();
        console.log("Body received in createProject:", body);
        const { error } = projectSchema.validate(body);
        if (error) {
            return NextResponse.json(
                { status: "error", message: error.message },
                { status: 400 }
            );
        }
        const authHeader = req.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const project = await Project.create({
            name: body.name,
            description: body.description,
        });
        console.log("Project created with ID:", project);
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

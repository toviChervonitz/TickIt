import { NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/DB";
import Project from "@/app/models/ProjectModel";
import { projectSchema } from "@/app/lib/validation";
import { compareToken } from "@/app/lib/jwt";

export async function POST(req: Request) {
    await dbConnect();
    console.log("123456789");
    
    try {
        
        const body = await req.json();
        const { userId } = body;
        delete body.userId;
        console.log(body);

        const { error } = projectSchema.validate(body);
        if (error) {
            return NextResponse.json(
                { status: "error", message: error.message },
                { status: 400 }
            );
        }

        const authHeader = req.headers.get("authorization");
        const compareTokenResult = compareToken(userId, authHeader!);
        if (!authHeader || !authHeader.startsWith("Bearer ") || !compareTokenResult) {
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

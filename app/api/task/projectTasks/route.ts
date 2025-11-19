import { NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/DB";
import "@/app/models/ProjectModel";
import "@/app/models/UserModel";
import Task from "@/app/models/TaskModel";
import mongoose from "mongoose";
import { compareToken, getAuthenticatedUser } from "@/app/lib/jwt";
import ProjectUserModel from "@/app/models/ProjectUserModel";

export async function GET(req: Request) {
    await dbConnect();


    try {

        const { searchParams } = new URL(req.url);
        const projectId = searchParams.get("projectId");
        const userId = searchParams.get("userId");

        if (!projectId) {
            return NextResponse.json(
                { status: "error", message: "projectId is required" },
                { status: 400 }
            );
        }

        const currentUser = await getAuthenticatedUser();
        if (!currentUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
//לבדוק שזה טוב
        const isMember = await ProjectUserModel.findOne({
            userId: currentUser.id,
            projectId
        });

        if (!isMember) {
            return NextResponse.json(
                { error: "Forbidden - You are not part of this project" },
                { status: 403 }
            );
        }

        const tasks = await Task.find({ projectId })
            .populate("userId", "name")
            .populate("projectId", "name");

        if (!tasks || tasks.length === 0) {
            return NextResponse.json(
                { status: "success", message: "No tasks found", tasks: [] },
                { status: 200 }
            );
        }
        return NextResponse.json(
            {
                status: "success",
                message: "Tasks fetched successfully",
                count: tasks.length,
                tasks,
            },
            { status: 200 }
        );
    } catch (err: any) {
        console.error("Get Tasks Error:", err);
        return NextResponse.json(
            { status: "error", message: "Server error" },
            { status: 500 }
        );
    }
}


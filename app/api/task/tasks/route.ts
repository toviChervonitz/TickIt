import { NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/DB";
import "@/app/models/ProjectModel";
import "@/app/models/UserModel";
import Task from "@/app/models/TaskModel";
import mongoose from "mongoose";
import { compareToken, getAuthenticatedUser } from "@/app/lib/jwt";

export async function GET(req: Request) {
    await dbConnect();


    try {

        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");
        if (!userId) {
            return NextResponse.json(
                { status: "error", message: "userId is required" },
                { status: 400 }
            );
        }

        const isSameUser = await compareToken(userId);

        if (!isSameUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }
        

        const tasks = await Task.find({ userId })
            .populate("userId", "name")
            .populate("projectId", "name color"); 

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


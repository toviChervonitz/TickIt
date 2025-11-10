import { NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/DB";
import "@/app/models/ProjectModel";
import "@/app/models/UserModel";
import Task from "@/app/models/TaskModel";
import mongoose from "mongoose";

export async function GET(req: Request) {
    await dbConnect();


    try {

        const authHeader = req.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
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

        const userObjectId = new mongoose.Types.ObjectId(userId);

        const tasks = await Task.find({ userId })
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


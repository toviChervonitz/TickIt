import { dbConnect } from "@/app/lib/DB";
import { compareToken, getTokenPayload, getTokenPayloadFromHeader } from "@/app/lib/jwt";
import Task from "@/app/models/TaskModel";
import { NextResponse } from "next/server";


export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
    await dbConnect();

    try {
        const { id: taskId } = await context.params;
        const body = await req.json();
        const { id, status } = body;

        if (!status) {
            return NextResponse.json(
                { error: "Missing status field" },
                { status: 400 }
            );
        }

        const authHeader = req.headers.get("authorization");
        const compareTokenResult = compareToken(id, authHeader!);
        if (!authHeader || !authHeader.startsWith("Bearer ") || !compareTokenResult) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const token = authHeader.split(" ")[1];
        const payload = getTokenPayloadFromHeader(token) as any;
        if (!payload || !payload.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const task = await Task.findById(taskId);
        if (!task) {
            return NextResponse.json(
                { error: "Task not found" },
                { status: 404 }
            );
        }

        if (task.userId.toString() !== payload.id) {
            return NextResponse.json(
                { error: "You are not authorized to update this task" },
                { status: 403 }
            );
        }
        task.status = status;
        await task.save();

        return NextResponse.json(
            {
                status: "success",
                message: "Task status updated successfully",
                task,
            },
            { status: 200 }
        );
    } catch (err: any) {
        console.error("Update task status error:", err);
        return NextResponse.json(
            { error: "Server error", details: err.message },
            { status: 500 }
        );
    }
}

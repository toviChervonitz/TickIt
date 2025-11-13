import { dbConnect } from "@/app/lib/DB";
import { compareToken, getTokenPayload } from "@/app/lib/jwt";
import ProjectUser from "@/app/models/ProjectUserModel";
import Task from "@/app/models/TaskModel";
import { NextResponse } from "next/server";

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
    console.log("🟦 [1] PUT /editStatusTask התחיל");

    await dbConnect();
    console.log("🟩 [2] התחבר למסד נתונים");

    try {
        const { id: taskId } = await context.params;
        console.log("🟦 [3] taskId מה־URL:", taskId);

        const body = await req.json();
        console.log("🟦 [4] גוף בקשה:", body);

        const { id, status } = body;

        if (!status) {
            console.log("🟥 [5] חסר status בבקשה");
            return NextResponse.json(
                { error: "Missing status field" },
                { status: 400 }
            );
        }

        const task = await Task.findById(taskId);
        console.log("🟦 [6] תוצאת Find Task:", task);

        if (!task) {
            console.log("🟥 [7] משימה לא נמצאה");
            return NextResponse.json(
                { error: "Task not found" },
                { status: 404 }
            );
        }

        const authHeader = req.headers.get("authorization");
        console.log("🟦 [8] Authorization Header:", authHeader);

        if (!authHeader) {
            console.log("🟥 [9] אין Authorization Header");
        }

        const logId = getTokenPayload(authHeader!);
        console.log("🟦 [10] Payload מהטוקן:", logId);

        const res = await ProjectUser.findOne({ userId: logId.id, projectId: task.projectId });
        console.log("🟦 [11] תוצאת חיפוש ProjectUser:", res);

        if (!res) {
            console.log("🟨 [12] לא נמצא תפקיד בפרויקט — role = null");
            return NextResponse.json(
                { status: "success", message: "No role found", role: null },
                { status: 200 }
            );
        }

        const roll = res.role;
        console.log("🟦 [13] role מה־DB:", roll);

        const compareTokenResult = compareToken(id, authHeader!);
        console.log("🟦 [14] compareTokenResult:", compareTokenResult);

        if (!authHeader || !authHeader.startsWith("Bearer ") || !compareTokenResult) {
            console.log("🟥 [15] טוקן לא תקין או חסר");

            if (roll !== "manager") {
                console.log("🟥 [16] המשתמש לא מנהל — גישה נדחתה");
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }

            console.log("🟩 [17] המשתמש מנהל — מאושר");
        }

        task.status = status;
        await task.save();
        console.log("🟩 [18] סטטוס עודכן ונשמר בהצלחה");

        return NextResponse.json(
            {
                status: "success",
                message: "Task status updated successfully",
                task,
            },
            { status: 200 }
        );

    } catch (err: any) {
        console.log("🟥 [19] CATCH ERROR — פירוט שגיאה:");
        console.error(err);

        return NextResponse.json(
            { error: "Server error", details: err.message },
            { status: 500 }
        );
    }
}

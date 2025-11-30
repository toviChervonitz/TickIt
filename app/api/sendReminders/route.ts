// /app/api/tasks/sendReminders/route.ts
import { NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/DB";
import { sendReminderEmail } from "@/app/lib/mailer";
import { ITask, IUser } from "@/app/models/types";
import Task from "@/app/models/TaskModel";

export async function GET() {
  try {
    await dbConnect();

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(tomorrow.getDate() + 1);

    // Find tasks due tomorrow that are not done
    const tasks = await Task.find({
      dueDate: { $gte: tomorrow, $lt: dayAfter },
      status: { $ne: "done" },
    }).populate("userId");

    let sentCount = 0;

    for (const task of tasks) {
      const user = task.userId as IUser | null;
      if (!user?.email) continue;

      await sendReminderEmail(user.email, task.title);
      console.log(`Sent reminder for task "${task.title}" to ${user.email}`);
      sentCount++;
    }

    console.log(`Total reminders sent: ${sentCount}`);
    return NextResponse.json({ status: "success", sentCount });
  } catch (err: any) {
    console.error("SendReminders Error:", err);
    return NextResponse.json({ status: "error", message: err.message }, { status: 500 });
  }
}

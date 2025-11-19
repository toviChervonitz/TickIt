import cron from "node-cron";
import Task from "@/app/models/TaskModel";
import User from "@/app/models/UserModel";
import { sendReminderEmail } from "./mailer"; // your existing mailer
import mongoose from "mongoose";

// Schedule: run every day at 8 AM
cron.schedule("49 12 * * *", async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    const tasks = await Task.find({
      dueDate: { $gte: tomorrow, $lt: dayAfter },
    //   status: { $ne: "done" },
    }).populate("userId");

    console.log(`Found ${tasks.length} tasks due tomorrow.`);

    for (const task of tasks) {
      const user = task.userId as any;
      if (!user?.email) continue;

      console.log(`Sending reminder for task "${task.title}" to ${user.email}`);
      await sendReminderEmail(user.email, task.title);
    }

    console.log("Reminder job finished.");
  } catch (err) {
    console.error("Error sending task reminders:", err);
  }
});

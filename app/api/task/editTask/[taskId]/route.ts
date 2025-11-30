// import { NextResponse } from "next/server";
// import { dbConnect } from "@/app/lib/DB";
// import Task from "@/app/models/TaskModel";
// import { getAuthenticatedUser } from "@/app/lib/jwt";
// import ProjectUser from "@/app/models/ProjectUserModel";
// import Pusher from "pusher";
// import { TaskForm } from "@/app/components/editTask";
// import { ITask } from "@/app/models/types";

// const pusher = new Pusher({
//   appId: process.env.PUSHER_APP_ID!,
//   key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
//   secret: process.env.PUSHER_SECRET!,
//   cluster: process.env.PUSHER_CLUSTER!,
//   useTLS: true,
// });

// export async function PUT(
//   req: Request,
//   context: { params: Promise<{ taskId: string }> }
// ) {
//   await dbConnect();

//   const currentUser = await getAuthenticatedUser();
//   if (!currentUser) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const { taskId } = await context.params;

//   if (!taskId) {
//     return NextResponse.json(
//       { error: "Missing taskId" },
//       { status: 400 }
//     );
//   }

//   const task = await Task.findById(taskId).select("projectId");

//   if (!task) {
//     return NextResponse.json(
//       { error: "Task not found" },
//       { status: 404 }
//     );
//   }

//   const projectId = task.projectId.toString();

//   const isManager = await ProjectUser.findOne({
//     userId: currentUser.id,
//     projectId,
//     role: "manager",
//   });

//   if (!isManager) {
//     return NextResponse.json(
//       { error: "Forbidden - Only managers can edit tasks" },
//       { status: 403 }
//     );
//   }


//   const updates = await req.json();

//   const updatedTask = await Task.findByIdAndUpdate(taskId, updates, {
//     new: true,
//   });

//   if (!updatedTask) {
//     return NextResponse.json(
//       { error: "Task not found" },
//       { status: 404 }
//     );
//   }

//   const updatedTaskPopulated : any= await Task.findById(taskId)
//     .populate("userId", "name")
//     .populate("projectId", "name")
//     .lean();

//   if (!updatedTaskPopulated) {
//     return NextResponse.json(
//       { error: "Failed to populate updated task" },
//       { status: 500 }
//     );
//   }

//   const assigneeId = updatedTaskPopulated.userId._id.toString();

//   try {
//     await pusher.trigger(
//       `private-user-${assigneeId}`,
//       "task-updated",
//       { task: updatedTaskPopulated }
//     );
//   } catch (pusherError) {
//     console.error("Pusher error on task update:", pusherError);
//   }

//   return NextResponse.json({
//     message: "Task updated",
//     task: updatedTaskPopulated,
//   });
// }
import { NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/DB";
import Task from "@/app/models/TaskModel";
import { getAuthenticatedUser } from "@/app/lib/jwt";
import ProjectUser from "@/app/models/ProjectUserModel";
import Pusher from "pusher";
import { ITask } from "@/app/models/types"; // ודא ש-ITask מיובא נכון

// ----------------------------------------------------
// 1. אתחול PUSHER
// ----------------------------------------------------
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

// ----------------------------------------------------
// 2. פונקציית PUT
// ----------------------------------------------------
export async function PUT(
  req: Request,
  context: { params: Promise<{ taskId: string }> } // הסרנו את ה-Promise לטובת בהירות
) {
  await dbConnect();

  const currentUser = await getAuthenticatedUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { taskId } = await context.params;

  if (!taskId) {
    return NextResponse.json(
      { error: "Missing taskId" },
      { status: 400 }
    );
  }

  // ⭐ שלב 1: אחזור המשימה הנוכחית כדי לקבל את ה-Assignee הישן וה-projectId ⭐
  // .select() מבטיח יעילות
  const taskToUpdate: any = await Task.findById(taskId).select("projectId userId").lean();

  if (!taskToUpdate) {
    return NextResponse.json(
      { error: "Task not found" },
      { status: 404 }
    );
  }

  const oldAssigneeId = taskToUpdate.userId.toString();
  const projectId = taskToUpdate.projectId.toString();

  // ⭐ שלב 2: בדיקת מנהל (הרשאות) ⭐
  const isManager = await ProjectUser.findOne({
    userId: currentUser.id,
    projectId,
    role: "manager",
  });

  if (!isManager) {
    return NextResponse.json(
      { error: "Forbidden - Only managers can edit tasks" },
      { status: 403 }
    );
  }

  const updates = await req.json();

  // ⭐ שלב 3: עדכון בבסיס הנתונים ⭐
  const updatedTaskRaw = await Task.findByIdAndUpdate(taskId, updates, {
    new: true, // מחזיר את האובייקט המעודכן
  });

  if (!updatedTaskRaw) {
    return NextResponse.json(
      { error: "Task not found after update" },
      { status: 404 }
    );
  }

  // ⭐ שלב 4: Populate - אחזור האובייקט המעודכן עם פרטי משתמש/פרויקט ⭐
  // נשתמש ב-"as ITask" ו-"as { _id: string }" כדי לפתור את שגיאות TypeScript
  const updatedTaskPopulated: any = await Task.findById(taskId)
    .populate("userId", "name")
    .populate("projectId", "name")
    .lean();

  if (!updatedTaskPopulated) {
    return NextResponse.json(
      { error: "Failed to populate updated task" },
      { status: 500 }
    );
  }

  // ----------------------------------------------------
  // ⭐ שלב 5: לוגיקת PUSHER (טיפול ב-Assignee החדש והקודם) ⭐
  // ----------------------------------------------------
  const newAssigneeId = updatedTaskPopulated.userId._id.toString();

  try {
    // 5.1: שידור ל-Assignee הקודם אם ה-userId השתנה
    if (oldAssigneeId && oldAssigneeId !== newAssigneeId) {
      await pusher.trigger(
        `private-user-${oldAssigneeId}`,
        "task-updated",
        {
          action: "DELETE", // פקודה ל-Store להסיר את המשימה
          taskId: taskId
        }
      );
    }

    // 5.2: שידור ל-Assignee החדש (או הנוכחי) עם המשימה המלאה
    await pusher.trigger(
      `private-user-${newAssigneeId}`,
      "task-updated",
      {
        action: "UPDATE",
        task: updatedTaskPopulated // המשימה המלאה והמעודכנת
      }
    );
  } catch (pusherError) {
    console.error("Pusher error on task update:", pusherError);
  }

  // ⭐ שלב 6: החזרת המשימה המאוכלסת ללקוח ⭐
  return NextResponse.json({
    message: "Task updated successfully",
    task: updatedTaskPopulated, // חשוב להחזיר את האובייקט המאוכלס
  });
}
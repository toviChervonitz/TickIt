import { getAuthenticatedUser } from "../jwt";
import { taskSchema } from "../validation";
import { getUserRoleInProject } from "./projectServer";

export async function CreateTask(form: any) {
  // Validate form
  const { error } = taskSchema.validate(form);
  if (error) {
    throw new Error(error.message);
  }

  const role = await getUserRoleInProject(form.managerId, form.projectId);

  if (role !== "manager") {
    throw new Error("You are not the manager of this project");
  }

  // Create task
  const res = await fetch("/api/task/createTask", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(form),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || "Task creation failed");
  }

  return { status: res.status, ...data };
}

export async function GetTasksByUserId(userId: string | undefined) {
  try {
    const res = await fetch(`/api/task/tasks?userId=${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to fetch tasks");
    }

    return data.tasks;
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }
}

export async function GetTasksByProjectId(
  id: string,
  projectId: string | null,
  isArchived?: boolean
) {
  if (!projectId) {
    throw new Error("Missing projectdId.");
  }
  try {
    const res = await fetch(
      `/api/task/projectTasks?projectId=${projectId}&&userId=${id}&&archive=${isArchived}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to fetch tasks");
    }

    return data.tasks;
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }
}

export async function UpdateTask(taskId: string, updates: any) {
  const res = await fetch(`/api/task/editTask/${taskId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to update task");

  return data;
}

export async function UpdateTaskStatus(
  taskId: string,
  userId: string,
  newStatus: "todo" | "doing" | "done"
) {
  const res = await fetch(`/api/task/editStatusTask/${taskId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status: newStatus, id: userId }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to update task status.");
  }

  return { status: res.status, ...data };
}
export async function DeleteTask(taskId: string) {
  const res = await fetch(`/api/task/deleteTask/${taskId}`, {
    method: "DELETE",
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to delete task");
  return data;
}

import { taskSchema } from "../validation";
import { getTokenPayload, getAuthToken } from "../jwt";
import { getUserRoleInProject } from "./projectServer";

export async function CreateTask(form: any) {
  // Validate form
  const { error } = taskSchema.validate(form);
  if (error) {
    throw new Error(error.message);
  }

  // Get payload from token
  const payload = getTokenPayload();
  if (!payload || !payload.id) {
    throw new Error("Missing authentication token.");
  }


   const role = await getUserRoleInProject(payload.id, form.projectId);
      if (role !== "manager") {
        throw new Error("You are not the manager of this project");
      }
  
  // Create task
  const res = await fetch("/api/task/createTask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Task creation failed");
  }

  return { status: res.status, ...data };
}

export async function GetTasksByUserId(userId: string|undefined) {
  try {
    const token = getAuthToken();

    if (!token) {
      throw new Error("Missing authentication token. Please log in again.");
    }

    const res = await fetch(`/api/task/tasks?userId=${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

export async function GetTasksByProjectId(projectId: string|null) {
  if (!projectId) {
    throw new Error("Missing projectdId.");
  }
  try {
    const token = getAuthToken();

    if (!token) {
      throw new Error("Missing authentication token. Please log in again.");
    }

    const res = await fetch(`/api/task/projectTasks?projectId=${projectId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

/* ✅ NEW: UpdateTask function */
export async function UpdateTask(taskId: string, updates: any) {
  // Get token and payload
  const token = getAuthToken();
  const payload = getTokenPayload();
  console.log(updates);


  if (!token || !payload?.id) {
    throw new Error("Missing authentication token. Please log in again.");
  }

  // Require projectId in updates for manager verification
  if (!updates.projectId) {
    throw new Error("Missing projectId for permission verification.");
  }

  // Verify manager role
 

const role = await getUserRoleInProject(payload.id, updates.projectId);
      if (role !== "manager") {
        throw new Error("You are not the manager of this project");
      }
  

  // Perform update
  const res = await fetch(`/api/task/updateTask/${taskId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(updates),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to update task.");
  }

  return { status: res.status, ...data };
}


export async function UpdateTaskStatus(taskId: string, userId: string, newStatus: "todo" | "doing" | "done") {
  const token = getAuthToken();
  const payload = getTokenPayload();

  if (!token || !payload?.id) {
    throw new Error("Missing authentication token. Please log in again.");
  }

  if (payload.id !== userId) {
    throw new Error("You are not authorized to update this task.");
  }

  const res = await fetch(`/api/task/editStatusTask/${taskId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status: newStatus }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to update task status.");
  }
  return { status: res.status, ...data };
}
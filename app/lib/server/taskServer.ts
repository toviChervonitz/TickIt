import { taskSchema } from "../validation";
import { getTokenPayload, getAuthToken } from "../jwt";

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

  // Verify manager role on project
  const res1 = await fetch("/api/projectUser/verifyManager", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: payload.id,
      projectId: form.projectId,
      role: "manager",
    }),
  });
  const data1 = await res1.json();
  if (!res1.ok) {
    throw new Error(data1.error || "You are not the manager of this project");
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

  if (!token || !payload?.id) {
    throw new Error("Missing authentication token. Please log in again.");
  }

  // Require projectId in updates for manager verification
  if (!updates.projectId) {
    throw new Error("Missing projectId for permission verification.");
  }

  // Verify manager role
  const res1 = await fetch("/api/projectUser/verifyManager", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: payload.id,
      projectId: updates.projectId,
      role: "manager",
    }),
  });

  const data1 = await res1.json();
  if (!res1.ok) {
    throw new Error(data1.error || "You are not authorized to edit this task.");
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

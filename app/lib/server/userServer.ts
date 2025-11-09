import { getAuthToken } from "../jwt";

export async function AddUserToProject(projectId: string, email: string) {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Missing authentication token. Please log in again.");
  }

  const res = await fetch("/api/users/addMembers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ projectId, email }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Adding users to project failed");
  }

  return { status: res.status, ...data };
}

export async function GetUserId(email: string) {
  const res = await fetch("/api/users/user/getId", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const data = await res.json();

  if (res.ok) {
    return data.userId;
  } else {
    throw new Error(data.message);
  }
}

export async function UpdateUser(email: string, updates: Record<string, any>) {
  if (!email) throw new Error("User email is required");

  const filteredUpdates: Record<string, any> = {};
  Object.entries(updates).forEach(([key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      filteredUpdates[key] = value;
    }
  });

  const res = await fetch("/api/users/user", {  // <-- use correct route
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, ...filteredUpdates }),
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Invalid response from server: ${text}`);
  }

  if (!res.ok) {
    throw new Error(data.message || "Failed to update user");
  }

  return data;
}
import { getTokenPayload } from "../jwt";

export async function AddManagerToProject(projectId: string) {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Missing authentication token. Please log in again.");
  }

  // Get current user info from token
  const payload = getTokenPayload(token);
  if (!payload?.id) {
    throw new Error("Invalid authentication token.");
  }

  const res = await fetch("/api/users/addMembers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      projectId,
      userId: payload.id, // send the manager's userId
      role: "manager",    // force role to manager
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Adding manager to project failed");
  }

  return { status: res.status, ...data };
}



import { getAuthToken } from "../jwt";

export async function AddUserToProject(userId:string,projectId: string, email: string) {
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
    body: JSON.stringify({ userId,projectId, email, role: "viewer" }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Adding users to project failed");
  }

  return { status: res.status, ...data };
}


export async function UpdateUser(userId:string,email: string, updates: Record<string, any>) {

  if (!email) throw new Error("User email is required");

  const token = getAuthToken();

  if (!token) {
    throw new Error("Missing authentication token. Please log in again.");
  }

  const res = await fetch("/api/users/user", {  // <-- use correct route
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({userId, email, ...updates }),
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

export async function AddManagerToProject(userId:string,projectId: string) {
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
    body: JSON.stringify({
      projectId,
      userId: userId, // send the manager's userId
      role: "manager",    // force role to manager
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Adding manager to project failed");
  }

  return { status: res.status, ...data };
}



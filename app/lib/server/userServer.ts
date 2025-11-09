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
  const res = await fetch("/api/users/user/getId", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, ...updates }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to update user");
  }

  return data; // contains { status, message, user }
}


export async function AddUserToProject(
  projectId: string,
  email: string
) {

  const res = await fetch("/api/users/addMembers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ projectId, email, role: "viewer" }),
  });

  const data = await res.json();
  if (res.status === 409) {
    throw new Error("UserAlreadyExists");
  }
  if (!res.ok) {
    throw new Error(data.message || data.error || "Adding users to project failed");
  }

  return { status: res.status, ...data };
}

export async function UpdateUser(
  userId: string,
  email: string,
  updates: Record<string, any>
) {
  if (!email) throw new Error("User email is required");


  const res = await fetch("/api/users/user", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId, email, ...updates }),
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Invalid response from server: ${text}`);
  }

  if (!res.ok) {
    throw new Error(data.message || data.error || "Failed to update user");
  }

  return data;
}

export async function AddManagerToProject(userId: string, projectId: string) {

  const res = await fetch("/api/users/addMembers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      projectId,
      userId: userId, 
      role: "manager", 
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || "Adding manager to project failed");
  }

  return { status: res.status, ...data };
}

export async function getAllUsersByProjectId(projectId: string | null) {
  try {

    const res = await fetch(
      `/api/projectUser/getAllUsers?projectId=${projectId}`,
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
      throw new Error(data.message || data.error || "Fetching users failed");
    }
    return data;
  } catch (err: any) {
    console.error("Get Users Error:", err);
    return [];
  }
}

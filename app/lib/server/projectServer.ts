
import ProjectModel from "@/app/models/ProjectModel";
import { projectSchema } from "../validation";
import { getAuthenticatedUser } from "../jwt";

export async function CreateProject(form: any) {
  const { error } = projectSchema.validate(form);
  if (error) {
    throw new Error(error.message);
  }

  const bodyData = { ...form };

  const res = await fetch("/api/project/createProject", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bodyData),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || "Project creation failed");
  }
  return { status: res.status, ...data };
}
//==================fetch===========
export async function GetAllProjectsByUserId(userId: string | null, skip=0, limit=8) {
  try {

    const res = await fetch(`/api/project/getAllProjects?userId=${userId}&skip=${skip}&limit=${limit}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || data.error || "Fetching projects failed");
    }
    return data;
  } catch (err: any) {
    console.error("Get Projects Error:", err);
    return [];
  }
}

export async function getUserRoleInProject(userId: string | undefined, projectId: string | null) {
  try {

    const res = await fetch(
      `/api/projectUser/getUserRoleInProject?userId=${userId}&projectId=${projectId}`,
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
      throw new Error(data.message || data.error || "Failed to fetch user role in project");
    }
    return data.role;
  } catch (error) {
    console.error("Get User Role Error:", error);
    return null;
  }
}

export async function UpdateProject(projectId: string, updates: Partial<{ name: string; description: string; }>) {
  const res = await fetch(`/api/project/editProject/${projectId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || "Project update failed");
  }
  return data;
}

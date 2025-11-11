
import ProjectModel from "@/app/models/ProjectModel";
import { getAuthToken } from "../jwt";
import { projectSchema } from "../validation";
import{getAllProjects} from "@/api/project/getAllProjects/route";
export async function CreateProject(form: any) {
  const { error } = projectSchema.validate(form);
  if (error) {
    throw new Error(error.message);
  }
  const token = getAuthToken();
  console.log("token from create project " + token);

  if (!token) {
    throw new Error("Missing authentication token. Please log in again.");
  }
  const res = await fetch("/api/project/createProject", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(form),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Project creation failed");
  }
  return { status: res.status, ...data };
}

export async function GetAllProjectsByUserId(userId: string) {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error("Missing authentication token. Please log in again.");
    }

    const res = await fetch(`/api/project/getAllProjects?userId=${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Fetching projects failed");
    }
    return data;
  } catch (err: any) {
    console.error("Get Projects Error:", err);
    return [];
  }
}

export async function getUserRoleInProject(userId: string, projectId: string) {
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
      throw new Error(data.message || "Failed to fetch user role in project");
    }
    return data.role;
  } catch (error) {
    console.error("Get User Role Error:", error);
    return null;
  }
}

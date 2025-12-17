import { ITask } from "@/app/models/types";


export async function GetRecentAssignedTasks(
  userId: string,
  days: number = 2
): Promise<ITask[]> {
  const res = await fetch(
    `/api/task/getRecentTasks?userId=${userId}&days=${days}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch recent tasks");
  }

  return res.json();
}


export async function getRecentProjects(): Promise<{ _id: string; name: string }[]> {
  try {
    const res = await fetch("/api/projectUser/getRecentProjectUsers", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", 
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Failed to fetch recent projects:", errorData);
      return [];
    }

    const data = await res.json();
    return data.projects || [];
  } catch (err) {
    console.error("Error fetching recent projects:", err);
    return [];
  }
}

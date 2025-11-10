
import ProjectModel from "@/app/models/ProjectModel";
import { getAuthToken } from "../jwt";
import { projectSchema } from "../validation";

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

export async function GetAllProjects() {
    try {
        
        const projects = await ProjectModel.find();
        console.log("i am here");
        
        return projects;
    } catch (error) {
        console.log("errorrrrrrrrr");
        
    }
}


//   const token = getAuthToken();
//   console.log("token from create project " + token);

//   if (!token) {
//     throw new Error("Missing authentication token. Please log in again.");
//   }
//   const res = await fetch("/api/project/GetAllProjects", {
//     method: "GET",
//     headers: {
//       Authorization: `Bearer ${token}`,
//       "Content-Type": "application/json",
//     },
//   });
//   const data = await res.json();
//   if (!res.ok) {
//     throw new Error(data.error || "Failed to fetch projects");
//   }
//   return { status: res.status, ...data };
// }

"use client";
import { GetAllProjectsByUserId } from "@/app/lib/server/projectServer";
import useAppStore from "@/app/store/useAppStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function GetAllProjectsPage() {
  const { user, projects, setProjects, setProjectId } = useAppStore();
  const router = useRouter();

  useEffect(() => {
    if (!user?._id) return;
    const userId = user._id;

    async function fetchProjects() {
      try {
        console.log("Fetching projects for user:", userId);

        const response = await GetAllProjectsByUserId(userId!);
        console.log(response, "res");

        if (response?.status !== "success") {
          console.error("Error fetching projects:", response?.message);
          setProjects([]);
          return;
        }

        setProjects(response.projects || []);
        console.log("Fetched projects:", response.projects);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    }

    fetchProjects();
  }, [user]);

  const getIntoProject = (projectId: string) => {
    console.log("Clicked on project");
    setProjectId(projectId);
    router.push("/pages/projectTask");
  };
  return (
    <div>
      <h1>All Projects</h1>
      <ul>
        {projects.map((project: any) => (
          <li key={project._id}>
            <h2 onClick={() => getIntoProject(project._id)}>{project.name}</h2>
            <p>{project.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

"use client";
import { GetAllProjectsByUserId } from "@/app/lib/server/projectServer";
import useAppStore from "@/app/store/useAppStore";
import { useEffect } from "react";
import Link from "next/link";

export default function GetAllProjectsPage() {
  const { user, projectUsers, setProjectUsers } = useAppStore();

  useEffect(() => {
    if (projectUsers.length > 0) {
      return;
    }
    if (!user?._id) return;
    async function fetchProjects() {
      try {
        console.log("Fetching projects for user:", user._id);

        const response = await GetAllProjectsByUserId(user._id);
        console.log(response);

        if (response?.status !== "success") {
          console.error("Error fetching projects:", response?.message);
          setProjectUsers([]);
          return;
        }

        setProjectUsers(response.projects || []);
        console.log("Fetched projects:", response.projects);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    }

    fetchProjects();
  }, [user]);
  return (
    <div>
      <h1>All Projects</h1>
      <ul>
        {projectUsers.map((project: any) => (
          <li key={project.id}>
            <Link href={`/pages/project/${project._id}`}>
              <h2>{project.name}</h2>
            </Link>
            <p>{project.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

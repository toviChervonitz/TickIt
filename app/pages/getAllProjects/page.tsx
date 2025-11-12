"use client";
import { GetAllProjectsByUserId } from "@/app/lib/server/projectServer";
import useAppStore from "@/app/store/useAppStore";
import { useEffect } from "react";
import Link from "next/link";

export default function GetAllProjectsPage() {
  const { user, projects, setProjects } = useAppStore();

  useEffect(() => {

    if (!user?._id) return;
    const userId=user._id;

    async function fetchProjects() {
      try {
        console.log("Fetching projects for user:", user?._id);

        const response = await GetAllProjectsByUserId(user?._id!);
        console.log(response,"res");

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
  return (
    <div>
      <h1>All Projects</h1>
      <ul>
        {projects.map((project: any) => (
          <li key={project._id}>
            <Link href={`/pages/projectTask`}>
              <h2>{project.name}</h2>
            </Link>
            <p>{project.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

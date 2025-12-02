
"use client";

import { useEffect, useState } from "react";
import useAppStore from "@/app/store/useAppStore";
import { GetAllProjectsByUserId } from "@/app/lib/server/projectServer";
import { IProject } from "@/app/models/types";
import Chat from "@/app/components/Chat"; // <-- your chat component
import { getChatMessages } from "@/app/lib/server/chatServer";

export default function ChatsPage() {
  const [hydrated, setHydrated] = useState(false);

  const { projects, user, setProjects, setProjectId, projectId } = useAppStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
useEffect(() => {
  setHydrated(true);
}, []);


  // Load projects if store is empty
  useEffect(() => {
    async function loadProjects() {
      // Normalize persisted value: sometimes the persisted state can be an object
      // like { status, projects } — coerce to an array before using it.
      if (projects && !Array.isArray(projects)) {
        const list = (projects as any)?.projects ?? [];
        setProjects(Array.isArray(list) ? list : []);
        return;
      }

      if (!projects || projects.length === 0) {
        try {
          const fetchedProjects = await GetAllProjectsByUserId(user?._id!); // adjust if your API needs userId
          // API returns an object like { status, projects }, so prefer fetchedProjects.projects
          const list = fetchedProjects?.projects ?? fetchedProjects ?? [];
          setProjects(Array.isArray(list) ? list : []);
        } catch (err) {
          console.error("Failed to fetch projects:", err);
        }
      }
    }

    loadProjects();
  }, [user, projects, setProjects]);

  // When project is clicked
  const openChat = (project: IProject) => {
    setSelectedId(project._id!); // select project
    setProjectId(project._id!); // store current project id
  };

  if (!hydrated) return <>{"loading"}</>;

  return (
    <div className="flex h-full w-full">
      {/* -------- LEFT SIDEBAR -------- */}
      <aside className="w-64 border-r bg-gray-50 p-4 flex flex-col gap-2">
        <h2 className="font-semibold mb-2">Projects</h2>

        {(Array.isArray(projects) ? projects : []).map((project) => (
          <button
            key={project.project._id}
            onClick={() => openChat(project.project)}
            className={`w-full text-left px-3 py-2 rounded ${
              selectedId === project.project._id ? "bg-blue-600 text-white" : "hover:bg-gray-200"
            }`}
          >
            {project.project.name}
          </button>
        ))}
      </aside>

      {/* -------- MAIN CONTENT -------- */}
      <main className="flex-1 p-6">
        {projectId ? <Chat /> : (
          <div className="text-gray-400 text-lg flex items-center justify-center h-full">Open a chat</div>
        )}
      </main>
    </div>
  );
}

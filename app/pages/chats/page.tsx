
"use client";

import { useEffect, useState } from "react";
import useAppStore from "@/app/store/useAppStore";
import { GetAllProjectsByUserId } from "@/app/lib/server/projectServer";
import { IProject } from "@/app/models/types";
import Chat from "@/app/components/Chat"; // <-- your chat component

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
      if (projects && !Array.isArray(projects)) {
        const list = (projects as any)?.projects ?? [];
        setProjects(Array.isArray(list) ? list : []);
        return;
      }

      if (!projects || projects.length === 0) {
        try {
          const fetchedProjects = await GetAllProjectsByUserId(user?._id!);
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
    setSelectedId(project._id!);
    setProjectId(project._id!);
  };

  // ----------------- onClose function -----------------
  const handleCloseChat = () => {
    setSelectedId(null);
    setProjectId(""); // clear current project in store
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
      <main className="flex-1 p-6" style={{ height: "100vh" }}>
        {projectId ? (
          <Chat onClose={handleCloseChat} />
        ) : (
          <div className="text-gray-400 text-lg flex items-center justify-center h-full">
            Open a chat
          </div>
        )}
      </main>
    </div>
  );
}

// "use client";

// import { useEffect, useState } from "react";
// import useAppStore from "@/app/store/useAppStore";
// import { getChatMessages } from "@/app/lib/server/chatServer";
// import { IProject } from "@/app/models/types";
// import router from "next/router";
// import { getAllProjects } from "@/app/lib/server/projectsServer"; // make sure this exists

// export default function ChatsPage() {
//   const { projects, user, setProjects, setProjectId } = useAppStore(); // assuming store: { projects: IProject[] }
//   const [selectedId, setSelectedId] = useState<string | null>(null);

//   const selectedProject = projects.find((p) => p.project._id === selectedId);

// useEffect(() => {
//   async function loadProjects() {
//     if (!projects || projects.length === 0) {
//       try {
//         const fetchedProjects = await getAllProjects(user?._id); // assuming you need userId
//         if (fetchedProjects) {
//           setProjects(fetchedProjects);
//         }
//       } catch (err) {
//         console.error("Failed to fetch projects:", err);
//       }
//     }
//   }

//   loadProjects();
// }, [user, projects, setProjects]);

//   const openChat = (project: IProject) => {
//     setProjectId(project._id!);
//     router.push("/pages/projectTask");
//   };

//   return (
//     <div className="flex h-full w-full">
//       {/* -------- LEFT SIDEBAR -------- */}
//       <aside className="w-64 border-r bg-gray-50 p-4 flex flex-col gap-2">
//         <h2 className="font-semibold mb-2">Projects</h2>

//         {projects.map((project) => (
//           <button
//             key={project.project._id}
//             onClick={() => setSelectedId(project.project._id!)}
//             className={`w-full text-left px-3 py-2 rounded 
//               ${selectedId === project.project._id ? "bg-blue-600 text-white" : "hover:bg-gray-200"}`}
//           >
//             {project.project.name}
//           </button>
//         ))}
//       </aside>

//       {/* -------- MAIN CONTENT -------- */}
//       <main className="flex-1 p-6">
//         {selectedProject ? (
//           <div>
//             <h1 className="text-2xl font-bold mb-4">{selectedProject.project.name}</h1>
//             <p className="text-gray-700">{selectedProject.project.description ?? "No description"}</p>

//             {/* Add more fields here based on your project model */}
//           </div>
//         ) : (
//           <div className="text-gray-400 text-lg">Select a project from the sidebar</div>
//         )}
//       </main>
//     </div>
//   );
// }
"use client";

import { useEffect, useState } from "react";
import useAppStore from "@/app/store/useAppStore";
import { GetAllProjectsByUserId } from "@/app/lib/server/projectServer";
import { IProject } from "@/app/models/types";
import Chat from "@/app/components/Chat"; // <-- your chat component
import { getChatMessages } from "@/app/lib/server/chatServer";

export default function ChatsPage() {
  const { projects, user, setProjects, setProjectId } = useAppStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedProject = projects.find((p) => p.project._id === selectedId);

  // Load projects if store is empty
  useEffect(() => {
    async function loadProjects() {
      if (!projects || projects.length === 0) {
        try {
          const fetchedProjects = await GetAllProjectsByUserId(user?._id!); // adjust if your API needs userId
          if (fetchedProjects) {
            setProjects(fetchedProjects);
          }
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

  return (
    <div className="flex h-full w-full">
      {/* -------- LEFT SIDEBAR -------- */}
      <aside className="w-64 border-r bg-gray-50 p-4 flex flex-col gap-2">
        <h2 className="font-semibold mb-2">Projects</h2>

        {projects.map((project) => (
          <button
            key={project.project._id}
            onClick={() => openChat(project.project)}
            className={`w-full text-left px-3 py-2 rounded 
              ${selectedId === project.project._id ? "bg-blue-600 text-white" : "hover:bg-gray-200"}`}
          >
            {project.project.name}
          </button>
        ))}
      </aside>

      {/* -------- MAIN CONTENT -------- */}
      <main className="flex-1 p-6">
        {selectedProject ? (
          <Chat
          />
        ) : (
          <div className="text-gray-400 text-lg flex items-center justify-center h-full">
            Open a chat
          </div>
        )}
      </main>
    </div>
  );
}

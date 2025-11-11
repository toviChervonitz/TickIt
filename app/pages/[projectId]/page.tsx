"use client";

import React, { useEffect, useState } from "react";
import "../getAllTaskByUser/getAllTaskByUser.css";
import Task from "@/app/components/Task";
import useAppStore from "@/app/store/useAppStore";
import { IProject, IUser } from "@/app/models/types";
import { GetTasksByUserId } from "@/app/lib/server/taskServer";

interface ProjectType {
  _id: string;
  title: string;
  content?: string;
  status: "todo" | "doing" | "done";
  duedate?: string;
  userId?: { name: string };
  projectId?: { name: string };
}

export default function GetTasksByProjectId() {
  const { projectId, tasks, setTasks , user} = useAppStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isManager, setIsManager] = useState(false);

  useEffect(() => {
    async function loadTasks() {
      if (tasks.length > 0) {
        setLoading(false);
        return;
      }
      else{
        const res=await GetTasksByUserId(user?._id);
        setTasks(res);
      }
      if (!projectId) return;

      try {
        const data=tasks.filter((task:any)=> task.projectId === projectId );
      } catch (err: any) {
        console.error(err);
        setError("Failed to fetch tasks");
      } finally {
        setLoading(false);
      }
    }
    loadTasks();
  }, [projectId, user]);

  if (loading) return <p>Loading tasks...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  return (
        <div>
      <h1>Tasks for project {projectId}</h1>

      {filteredTasks.length === 0 ? (
        <p>No tasks found.</p>
      ) : (
        <ul>
          {filteredTasks.map((task) => (
            <li key={task._id}>
              <strong>{task.title}</strong> - {task.status}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
//     <div className="tasks-container">
//       <h2>Project Tasks</h2>

//       {tasks.length ? (
//         tasks.map((task) => (
//           <Task
//             key={task._id}
//             title={task.title}
//             content={task.content}
//             status={task.status}
//             dueDate={task.dueDate ? new Date(task.dueDate) : undefined}
//             userName={(task.userId as IUser)?.name || "Unknown"}
//             projectName={(task.projectId as IProject)?.name || "No project"}
//           />
//         ))
//       ) : (
//         <p>No tasks found.</p>
//       )}
//     </div>
//   );
// }

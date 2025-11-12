"use client";

import React, { useEffect, useState } from "react";
import "../getAllTaskByUser/getAllTaskByUser.css";
import useAppStore from "@/app/store/useAppStore";
import {
  GetTasksByUserId,
  GetTasksByProjectId,
} from "@/app/lib/server/taskServer";
import { getUserRoleInProject } from "@/app/lib/server/projectServer";
import Task from "@/app/components/Task";
import { IProject, ITask, IUser } from "@/app/models/types";

interface ProjectType {
  _id: string;
  title: string;
  content?: string;
  status: "todo" | "doing" | "done";
  duedate?: string;
  userId?: { name: string };
  projectId?: { name: string };
}

export default function GetProjectTasks() {
  const { projectId, tasks, setTasks, user } = useAppStore();
  const [filteredTasks, setFilteredTasks] = useState<ITask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isManager, setIsManager] = useState(false);

  useEffect(() => {
    //check existing user, projectId
    async function loadTasks() {
      if (!projectId && !user) {
        setLoading(false);
        return;
      }
      let data;
      //check is manger
      const role = await getUserRoleInProject(user?._id, projectId);
      if (role !== "viewer") {
        setIsManager(true);
        //get from db all tasks by projects
        data = await GetTasksByProjectId(projectId);
        console.log("GetTasksByProjectId", data);
        setFilteredTasks(data);
      } else {
        //:if !tasks
        if (!tasks || tasks.length === 0) {
          //get all tasks by userId and put it in store

          data = await GetTasksByUserId(user?._id);
          console.log("GetTasksByUserId", data);
          setTasks(data);
        }
        //filter tasks by projectId
        const filtered = tasks.filter(
          (task: any) => task.projectId._id === projectId
        );
        setFilteredTasks(filtered);
      }

    }

    loadTasks();
  }, [projectId, user]);

  if (loading) return <p>Loading tasks...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  return (
    <div className="tasks-container">
      <h2>Project Tasks</h2>
      {/* {isManager?
<button>Add Task</button>} */}
      {filteredTasks.length ? (
        filteredTasks.map((task) => (
          <Task
            key={task._id}
            title={task.title}
            content={task.content}
            status={task.status}
            dueDate={task.dueDate ? new Date(task.dueDate) : undefined}
            userName={(task.userId as IUser)?.name || "Unknown"}
            projectName={(task.projectId as IProject)?.name || "No project"}
          />
        ))
      ) : (
        <p>No tasks found.</p>
      )}
    </div>
  );
}

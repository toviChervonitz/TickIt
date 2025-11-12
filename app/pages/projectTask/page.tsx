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
import { set } from "mongoose";

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
 async function loadTasks() {
      try {
        if (!projectId && !user) {
          setLoading(false);
          return;
        }
        let data;
        const userId = user?._id;
        //check is manger
        const role = await getUserRoleInProject(userId, projectId);
        console.log("get to this?1", role);

        if (role !== "viewer") {
          setIsManager(true);
          //get from db all tasks by projects
          data = await GetTasksByProjectId(userId!, projectId);
          console.log("get to this?2");
          console.log("GetTasksByProjectId", data);
          setFilteredTasks(data);
        } else {
          //:if !tasks
          if (!tasks || tasks.length === 0) {
            //get all tasks by userId and put it in store

            data = await GetTasksByUserId(user?._id);
            console.log("get to this?3");
            console.log("GetTasksByUserId", data);
            setTasks(data);
          }
          //filter tasks by projectId
          const filtered = tasks.filter(
            (task: any) => task.projectId._id === projectId
          );
          console.log("get to this?4");
          setFilteredTasks(filtered);
        }
      } catch (err) {
        console.error("Error loading tasks:", err);
        setError("Failed to load tasks");
      } finally {
        setLoading(false);
      }
    }


  useEffect(() => {
    //check existing user, projectId
   
    loadTasks();
  }, [projectId, user]);

  const handleStatusChange = (
    id: string,
    newStatus: "todo" | "doing" | "done"
  ) => {
    const updated = tasks.map((t) =>
      t._id === id ? { ...t, status: newStatus } : t
    );

    setTasks(updated);
    loadTasks();
    // setFilteredTasks(updated);
  };
  const onAddTask = () => {
    // Navigate to add task page
    window.location.href = `/pages/addTask`;
  }

  if (loading) return <p>Loading tasks...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  return (
    <div className="tasks-container">
      <h2>Project Tasks</h2>
    {isManager ?( 
    <button onClick={onAddTask}>Add Tasks</button> )
    : (<p>You are a Viewer in this project.</p>)
}
      {filteredTasks.length ? (
        filteredTasks.map((task) => (
          <Task
            key={task._id}
            _id={task._id!}
            userId={(task.userId as IUser)?._id || ""}
            title={task.title}
            content={task.content}
            status={task.status}
            dueDate={task.dueDate ? new Date(task.dueDate) : undefined}
            userName={(task.userId as IUser)?.name || "Unknown"}
            projectName={(task.projectId as IProject)?.name || "No project"}
            onStatusChange={handleStatusChange}
          />
        ))
      ) : (
        <p>No tasks found.</p>
      )}
    </div>
  );
}

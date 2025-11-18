"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CreateTask } from "@/app/lib/server/taskServer";
import TaskForm, { TaskFormData } from "@/app/components/AddTaskForm";
import useAppStore from "@/app/store/useAppStore";
import "./addTask.css";

export default function AddTaskPage({ onClose }: { onClose?: () => void }) {
  const router = useRouter();
  const { projectId, user,setTasks, tasks } = useAppStore(); // <-- get projectId from Zustand
  const [task, setTask] = useState<TaskFormData>({
    title: "",
    content: "",
    userId: "",
    dueDate: "",
    status: "todo",
  });

  const handleAdd = async () => {
    if (!task.userId) {
      alert("Please select a user to assign this task to.");
      return;
    }

    if (!projectId) {
      alert("No project selected. Please create or select a project first.");
      return;
    }

    try {
      await CreateTask({ ...task, projectId, managerId: user?._id }); // <-- use Zustand projectId
      alert("Task added successfully!");
      setTasks([...tasks, task]);
      if (onClose) {
        onClose();
       
      }
      router.push("/pages/projectTask");
    } catch (err: any) {
      alert(err.message || "Failed to add task.");
    }
  };

  return (
    <div className="add-task-container">
      <h1>Add New Task</h1>
      <TaskForm task={task} setTask={setTask} onSubmit={handleAdd} />
    </div>
  );
}

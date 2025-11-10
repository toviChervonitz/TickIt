"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CreateTask } from "@/app/lib/server/taskServer";
import TaskForm, { TaskFormData } from "@/app/components/AddTaskForm";
import useAppStore from "@/app/store/useAppStore";
import "./addTask.css";

export default function AddTaskPage() {
  const router = useRouter();
  const { projectId } = useAppStore(); // <-- get projectId from Zustand
  const [task, setTask] = useState<TaskFormData>({
    title: "",
    content: "",
    userId: "",
    dueDate: "",
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
      await CreateTask({ ...task, projectId }); // <-- use Zustand projectId
      alert("Task added successfully!");
      router.push("/dashboard");
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

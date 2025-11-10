"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import "./addTask.css";
import { CreateTask } from "@/app/lib/server/taskServer";
import useAppStore from "@/app/store/useAppStore";

interface TaskForm {
  title: string;
  content: string;
  userId: string;
  dueDate: string;
}

export default function AddTaskPage() {
  const router = useRouter();
  const { projectUsers, projectId } = useAppStore(); // assuming you also store projectId
  console.log(projectUsers, projectId)
  const [task, setTask] = useState<TaskForm>({
    title: "",
    content: "",
    userId: "",
    dueDate: "",
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setTask((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();

    if (!task.userId) {
      alert("Please select a user to assign this task to.");
      return;
    }

    try {
      const result = await CreateTask({
        title: task.title,
        content: task.content,
        status: "todo",
        createdAt: new Date(),
        dueDate: new Date(task.dueDate),
        userId: task.userId,
        projectId: projectId,
      });

      console.log("Task added:", result);
      alert("Task added successfully!");
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Error adding task:", error);
      alert(error?.message || "Failed to add task.");
    }
  };

  return (
    <div className="add-task-container">
      <h1>Add New Task</h1>
      <form className="add-task-form" onSubmit={handleSubmit}>
        <label>
          Title:
          <input
            type="text"
            name="title"
            value={task.title}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Content:
          <textarea
            name="content"
            value={task.content}
            onChange={handleChange}
          />
        </label>

        <label>
          Assign To:
          <select
            name="userId"
            value={task.userId}
            onChange={handleChange}
            required
          >
            <option value="">-- Select a user --</option>
            {projectUsers.map((user) => (
              <option key={user._id} value={user._id}>
                {user.email}
              </option>
            ))}
          </select>
        </label>

        <label>
          Due Date:
          <input
            type="date"
            name="dueDate"
            value={task.dueDate}
            onChange={handleChange}
            required
            min={new Date().toISOString().split("T")[0]} // prevents past dates
          />
        </label>

        <button type="submit" className="submit-btn">
          Add Task
        </button>
      </form>
    </div>
  );
}

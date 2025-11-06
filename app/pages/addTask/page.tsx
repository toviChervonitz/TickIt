"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import "./addTask.css";
import { CreateTask } from "@/app/lib/server/taskServer";

interface TaskForm {
  title: string;
  content: string;
  userEmail: string;
  dueDate: string; // string from input type="date"
}

export default function AddTaskPage() {
  const router = useRouter();

  const [task, setTask] = useState<TaskForm>({
    title: "",
    content: "",
    userEmail: "",
    dueDate: "",
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setTask((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();

    try {
      // Call your backend function
      const result = await CreateTask({
        title: task.title,
        content: task.content,
        status: "todo",
        createdAt: new Date(),              // current date
        dueDate: new Date(task.dueDate),    // selected date
        userEmail: task.userEmail,          // if backend expects email
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
          User Email:
          <input
            type="email"
            name="userEmail"
            value={task.userEmail}
            onChange={handleChange}
            required
          />
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

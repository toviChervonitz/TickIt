//task : id,createdAt,duedate,userId,projectId,content,status-{enum},title
"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import "./addTask.css";

interface Task {
  title: string;
  content: string;
  userEmail: string;
  dueDate: string;
}

export default function AddTaskPage() {
  const router = useRouter();

  const [task, setTask] = useState<Task>({
    title: "",
    content: "",
    userEmail: "",
    dueDate: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTask((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent):Promise<void> => {
    e.preventDefault();

    try {
      //const result = await AddTask({  });
      //all the feilds of task
      console.log("Task added:", task);
      alert("Task added successfully!");
      router.push("/dashboard"); // Redirect to dashboard page
    } catch (error) {
      console.error("Error adding task:", error);
      alert("Failed to add task.");
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
            required
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
          />
        </label>

        <button type="submit" className="submit-btn">
          Add Task
        </button>
      </form>
    </div>
  );
}

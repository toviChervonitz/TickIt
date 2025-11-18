"use client";

import React, { ChangeEvent, FormEvent } from "react";
import useAppStore from "@/app/store/useAppStore";

export interface TaskFormData {
  title: string;
  content: string;
  userId: string;
  dueDate: string;
  // status: "todo" | "doing" | "done";
}

interface TaskFormProps {
  task: TaskFormData;
  setTask: (t: TaskFormData) => void;
  onSubmit: () => void; 
}

export default function TaskForm({ task, setTask, onSubmit }: TaskFormProps) {
  const { projectUsers } = useAppStore();

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTask({ ...task, [name]: value });
  };

  console.log(projectUsers,"in form to add task");
  
  return (
    <form
      className="create-project-form"
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <input
        type="text"
        name="title"
        placeholder="Task Title"
        value={task.title}
        onChange={handleChange}
        required
      />
      <textarea
        name="content"
        placeholder="Task Content"
        value={task.content}
        onChange={handleChange}
      />
      <select
        name="userId"
        value={task.userId}
        onChange={handleChange}
        required
      >
        <option value="">-- Assign to user --</option>
        (projectUsers)(
        {projectUsers.map((user) => (
          <option key={user._id} value={user._id}>
            {user.email}
          </option>
        ))})
      </select>
      <input
        type="date"
        name="dueDate"
        value={task.dueDate}
        onChange={handleChange}
        required
        min={new Date().toISOString().split("T")[0]}
      />
      <button type="submit">Add Task</button>
    </form>
  );
}

"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import { IUser } from "@/app/models/types";
import { UpdateTask } from "@/app/lib/server/taskServer";

interface TaskForm {
  _id: string;
  title: string;
  content: string;
  userId: string;
  dueDate: string;
}

interface EditTaskProps {
  task: TaskForm;
  projectUsers: IUser[];
  projectId: string;
  onSaved: () => void;
}

export default function EditTask({ task: initialTask, projectUsers, projectId, onSaved }: EditTaskProps) {
  const [task, setTask] = useState<TaskForm>(initialTask);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTask((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await UpdateTask(task._id, {
        content: task.content,
        userId: task.userId,
        dueDate: task.dueDate,
        projectId,
      });
      alert("Task updated!");
      onSaved();
    } catch (err: any) {
      console.error("Error updating task:", err);
      alert(err?.message || "Update failed.");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px", background: "white", padding: "20px", borderRadius: "8px" }}>
      <label>
        Title:
        <input type="text" value={task.title} disabled />
      </label>

      <label>
        Content:
        <textarea name="content" value={task.content} onChange={handleChange} />
      </label>

      <label>
        Assign To:
        <select name="userId" value={task.userId} onChange={handleChange} required>
          <option value="">-- select user --</option>
          {projectUsers.map((user) => (
            <option key={user._id} value={user._id}>{user.email}</option>
          ))}
        </select>
      </label>

      <label>
        Due Date:
        <input type="date" name="dueDate" value={task.dueDate} onChange={handleChange} required />
      </label>

      <button type="submit">Save</button>
      <button type="button" onClick={onSaved}>Cancel</button>
    </form>
  );
}

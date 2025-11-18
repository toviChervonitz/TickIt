"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { UpdateTask } from "@/app/lib/server/taskServer";
import useAppStore from "@/app/store/useAppStore";

interface TaskForm {
  _id: string;
  title: string;
  content: string;
  userId: string;
  dueDate: string;
}

interface EditTaskPageProps {
  task: TaskForm; // Task is passed in from parent
}

export default function EditTaskPage({ task: initialTask }: EditTaskPageProps) {
  const router = useRouter();
  const { projectUsers, projectId } = useAppStore(); // ✅ include projectId

  const [task, setTask] = useState<TaskForm>({
    ...initialTask,
    dueDate: initialTask.dueDate
      ? new Date(initialTask.dueDate).toISOString().split("T")[0]
      : "",
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setTask((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();

    try {
      // ✅ add projectId for manager verification
      const result = await UpdateTask(task._id, {
        projectId,
        content: task.content,
        userId: task.userId,
        dueDate: new Date(task.dueDate),
      });

      console.log("Task updated:", result);
      alert("Task updated successfully!");
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Error updating task:", error);
      alert(error?.message || "Failed to update task.");
    }
  };

  return (
    <div className="add-task-container">
      <h1>Edit Task</h1>
      <form className="add-task-form" onSubmit={handleSubmit}>
        <label>
          Title:
          <input
            type="text"
            name="title"
            value={task.title}
            onChange={handleChange}
            disabled
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
            min={new Date().toISOString().split("T")[0]}
          />
        </label>

        <button type="submit" className="submit-btn">
          Save Changes
        </button>
      </form>
    </div>
  );
}

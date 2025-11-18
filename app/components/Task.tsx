"use client";

import React, { useState } from "react";
import { UpdateTaskStatus } from "@/app/lib/server/taskServer";

interface TaskProps {
  _id: string;
  userId: string;
  title: string;
  content?: string;
  status: "todo" | "doing" | "done";
  dueDate?: Date;
  userName: string;
  projectName: string;
  showButtons?: boolean; // NEW: only show edit button if true
  onEdit?: (taskId: string) => void;
  onStatusChange?: (id: string, newStatus: "todo" | "doing" | "done") => void;
}

const Task: React.FC<TaskProps> = ({
  _id,
  userId,
  title,
  content,
  status,
  dueDate,
  userName,
  projectName,
  showButtons = false,
  onEdit,
  onStatusChange,
}) => {
  const [editingStatus, setEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState(status);

  const formattedDate = dueDate
    ? new Date(dueDate).toLocaleDateString("en-GB")
    : "Not set";

  const getAllowedStatuses = () => {
    if (status === "todo") return ["todo", "doing", "done"];
    if (status === "doing") return ["doing", "done"];
    return ["done"];
  };

  const handleStatusClick = () => {
    if (status === "done") return;
    setEditingStatus(true);
  };

  const handleSelectChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selected = e.target.value as "todo" | "doing" | "done";
    setNewStatus(selected);
    setEditingStatus(false);

    try {
      await UpdateTaskStatus(_id, userId, selected);
      onStatusChange?.(_id, selected);
    } catch (err) {
      console.error("Failed to update task:", err);
    }
  };

  return (
    <div
      className={`task-card ${status}`}
      style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "10px" }}
    >
      <div
        className="task-header"
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
        <h3>{title}</h3>
        {editingStatus ? (
          <select value={newStatus} onChange={handleSelectChange}>
            {getAllowedStatuses().map((s) => (
              <option key={s} value={s}>
                {s === "todo" ? "To Do" : s === "doing" ? "In Progress" : "Completed"}
              </option>
            ))}
          </select>
        ) : (
          <span
            style={{ cursor: status !== "done" ? "pointer" : "default" }}
            onClick={handleStatusClick}
          >
            {status === "todo"
              ? "To Do"
              : status === "doing"
              ? "In Progress"
              : "Completed"}
          </span>
        )}
      </div>

      {content && <p>{content}</p>}

      <p>
        <strong>Due:</strong> {formattedDate} | <strong>User:</strong> {userName} |{" "}
        <strong>Project:</strong> {projectName}
      </p>

      {showButtons && onEdit && (
        <button onClick={() => onEdit(_id)} style={{ marginTop: "5px" }}>
          Edit
        </button>
      )}
    </div>
  );
};

export default Task;

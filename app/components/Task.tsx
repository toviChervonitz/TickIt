"use client";

import React from "react";
import "./Task.css";

interface TaskProps {
  title: string;
  content?: string;
  status: "todo" | "doing" | "done";
  dueDate?: Date;
  userName: string;
  projectName: string;
}

const Task: React.FC<TaskProps> = ({
  title,
  content,
  status,
  dueDate,
  userName,
  projectName,
}) => {
  const formattedDate = dueDate
    ? new Date(dueDate).toLocaleDateString("en-GB")
    : "Not set";

  const getStatusLabel = () => {
    switch (status) {
      case "todo":
        return "To Do";
      case "doing":
        return "In Progress";
      case "done":
        return "Completed";
      default:
        return status;
    }
  };

  return (
    <div className={`task-card ${status}`}>
      <div className="task-header">
        <h3 className="task-title">{title}</h3>
        <span className={`task-status ${status}`}>{getStatusLabel()}</span>
      </div>

      {content && <p className="task-content">{content}</p>}

      <div className="task-footer">
        <p><strong>Due Date:</strong> {formattedDate}</p>
        <p><strong>User:</strong> {userName}</p>
        <p><strong>Project:</strong> {projectName}</p>
      </div>
    </div>
  );
};

export default Task;

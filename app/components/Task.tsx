// "use client";

// import React from "react";
// import "../pages/getAllTaskByUser/getAllTaskByUser.css";

// interface TaskProps {
//   title: string;
//   content?: string;
//   status: "todo" | "doing" | "done";
//   dueDate?: Date;
//   userName: string;
//   projectName: string;
// }

// const Task: React.FC<TaskProps> = ({
//   title,
//   content,
//   status,
//   dueDate,
//   userName,
//   projectName,
// }) => {
//   const formattedDate = dueDate
//     ? new Date(dueDate).toLocaleDateString("en-GB")
//     : "Not set";

//   const getStatusLabel = () => {
//     switch (status) {
//       case "todo":
//         return "To Do";
//       case "doing":
//         return "In Progress";
//       case "done":
//         return "Completed";
//       default:
//         return status;
//     }
//   };

//   return (
//     <div className={`task-card ${status}`}>
//       <div className="task-header">
//         <h3 className="task-title">{title}</h3>
//         <span className={`task-status ${status}`}>{getStatusLabel()}</span>
//       </div>

//       {content && <p className="task-content">{content}</p>}

//       <div className="task-footer">
//         <p><strong>Due Date:</strong> {formattedDate}</p>
//         <p><strong>User:</strong> {userName}</p>
//         <p><strong>Project:</strong> {projectName}</p>
//       </div>
//     </div>
//   );
// };

// export default Task;
"use client";

import React, { useState } from "react";
import "../pages/getAllTaskByUser/getAllTaskByUser.css";
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
  onStatusChange,
}) => {
  const [editing, setEditing] = useState(false);
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
    setEditing(true);
  };

  const handleSelectChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selected = e.target.value as "todo" | "doing" | "done";
    setNewStatus(selected);
    setEditing(false);

    try {
      await UpdateTaskStatus(_id,userId, selected);
      onStatusChange?.(_id, selected);
    } catch (err) {
      console.error("Failed to update task:", err);
    }
  };

  return (
    <div className={`task-card ${status}`}>
      <div className="task-header">
        <h3 className="task-title">{title}</h3>

        {editing ? (
          <select
            value={newStatus}
            onChange={handleSelectChange}
            className="task-select"
          >
            {getAllowedStatuses().map((s) => (
              <option key={s} value={s}>
                {s === "todo"
                  ? "To Do"
                  : s === "doing"
                    ? "In Progress"
                    : "Completed"}
              </option>
            ))}
          </select>
        ) : (
          <span
            className={`task-status ${status}`}
            onClick={handleStatusClick}
            style={{ cursor: status !== "done" ? "pointer" : "default" }}
          >
            {status === "todo"
              ? "To Do"
              : status === "doing"
                ? "In Progress"
                : "Completed"}
          </span>
        )}
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

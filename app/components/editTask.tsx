"use client";

import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { createPortal } from "react-dom";
import { IUser } from "@/app/models/types";
import { UpdateTask } from "@/app/lib/server/taskServer";
import { getTranslation } from "../lib/i18n";
import { useLanguage } from "../context/LanguageContext";

export interface TaskForm {
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
  onCancel: () => void;
  dir:string
}

export default function EditTask({
  task: initialTask,
  projectUsers,
  projectId,
  onSaved,
  onCancel,
}: EditTaskProps) {
  const [task, setTask] = useState<TaskForm>(initialTask);
  const [mounted, setMounted] = useState(false);
      const { lang } = useLanguage();
      const t = getTranslation(lang);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setTask((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!task._id) return console.log("Error: task ID missing");

    try {
      await UpdateTask(task._id, {
        content: task.content,
        userId: task.userId,
        dueDate: task.dueDate,
        projectId,
      });
      onSaved();
    } catch (err: any) {
      console.error("Error updating task:", err);
    }
  };

  if (!mounted) return null;

  const modalContent = (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          width: "400px",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "bold" }}>
          {t("editTask")}
        </h2>

        <label>
          {t("title")}:
          <input
            type="text"
            value={task.title}
            disabled
            style={{
              width: "100%",
              padding: "6px 8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              marginTop: "4px",
            }}
          />
        </label>

        <label>
          { t("content")}:
          <textarea
            name="content"
            value={task.content}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "6px 8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              marginTop: "4px",
            }}
          />
        </label>

        <label>
          {t("assignTo")}:
          <select
            name="userId"
            value={task.userId}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "6px 8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              marginTop: "4px",
            }}
          >
            <option value="">{t("selectUser")}</option>
            {projectUsers.map((user) => (
              <option key={user._id} value={user._id}>
                {user.email}
              </option>
            ))}
          </select>
        </label>

        <label>
          {t("dueDate")}:
          <input
            type="date"
            name="dueDate"
            value={task.dueDate}
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: "6px 8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              marginTop: "4px",
            }}
          />
        </label>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
          <button
            type="button"
            onClick={onCancel} // ONLY cancel closes the modal now
            style={{
              padding: "6px 12px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              background: "white",
              cursor: "pointer",
            }}
          >
            {t("cancel")}
          </button>
          <button
            type="submit"
            style={{
              padding: "6px 12px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {t("saveChanges")}
          </button>
        </div>
      </form>
    </div>
  );

  return createPortal(modalContent, document.body);
}

"use client";

import React, { useEffect, useState } from "react";
import Task from "@/app/components/Task";
import EditTask, { TaskForm } from "@/app/components/editTask";
import useAppStore from "@/app/store/useAppStore";
import { GetTasksByProjectId } from "@/app/lib/server/taskServer";
import { getUserRoleInProject } from "@/app/lib/server/projectServer";
import { getAllUsersByProjectId } from "@/app/lib/server/userServer";
import { ITask, IUser } from "@/app/models/types";

export default function GetProjectTasks() {
  const { projectId, tasks, setTasks, user, setProjectUsers } = useAppStore();
  const [filteredTasks, setFilteredTasks] = useState<ITask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isManager, setIsManager] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskForm | null>(null);
  const [projectUsers, setLocalProjectUsers] = useState<IUser[]>([]);

  // Load tasks & manager status
  useEffect(() => {
    if (!projectId || !user) return;

    const loadTasks = async () => {
      setLoading(true);
      try {
        const role = await getUserRoleInProject(user._id, projectId);
        setIsManager(role === "manager");

        let data: ITask[] = [];
        if (role === "manager") {
          data = await GetTasksByProjectId(user._id, projectId);
        } else {
          data = tasks.filter(
            (t) => (t.projectId as { _id?: string })._id === projectId
          );
        }

        setFilteredTasks(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load tasks");
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, [projectId, user, tasks]);

  // Fetch project users
  const fetchProjectUsers = async () => {
    if (!projectId) return;
    const res = await getAllUsersByProjectId(projectId);
    const users = res.users || [];
    setLocalProjectUsers(users);
    setProjectUsers(users);
    return users;
  };

  // Open edit modal
  const handleEdit = async (taskId: string) => {
    if (!isManager) return;

    const t = filteredTasks.find((t) => t._id?.toString() === taskId);
    if (!t || !t._id) return alert("Task ID missing locally!");

    const users = await fetchProjectUsers();

    setEditingTask({
      _id: t._id.toString(),
      title: t.title,
      content: t.content || "",
      userId:
        typeof t.userId === "string"
          ? t.userId
          : (t.userId as IUser)?._id?.toString() || (users[0]?._id || ""),
      dueDate: t.dueDate
        ? new Date(t.dueDate).toISOString().split("T")[0]
        : "",
    });
  };

  // After saving, refresh tasks
  const handleSaved = async () => {
    setEditingTask(null);
    if (!user || !projectId) return;

    const updatedTasks = await GetTasksByProjectId(user._id, projectId);
    setTasks(updatedTasks);
    setFilteredTasks(updatedTasks);
  };

  // Update status locally
  const handleStatusChange = (
    id: string,
    newStatus: "todo" | "doing" | "done"
  ) => {
    const updated = tasks.map((t) =>
      t._id?.toString() === id ? { ...t, status: newStatus } : t
    );
    setTasks(updated);
    setFilteredTasks(updated);
  };

  if (loading) return <p>Loading tasks...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      {filteredTasks.map((task) => {
        const taskId = task._id?.toString() || "";
        const userId =
          typeof task.userId === "string"
            ? task.userId
            : (task.userId as IUser)?._id?.toString() || "";
        const userName =
          typeof task.userId === "string"
            ? "Unknown"
            : (task.userId as IUser)?.name || "Unknown";
        const projectName = (task.projectId as { name?: string })?.name || "No project";
        const dueDate =
          task.dueDate instanceof Date
            ? task.dueDate
            : task.dueDate
            ? new Date(task.dueDate)
            : undefined;

        return (
          <Task
            key={taskId}
            _id={taskId}
            userId={userId}
            title={task.title}
            content={task.content}
            status={task.status}
            dueDate={dueDate}
            userName={userName}
            projectName={projectName}
            showButtons={isManager}
            onEdit={handleEdit}
            onStatusChange={handleStatusChange}
          />
        );
      })}

      {editingTask && (
        <EditTask
          task={editingTask}
          projectUsers={projectUsers}
          projectId={projectId!}
          onSaved={handleSaved}
          onCancel={() => setEditingTask(null)}
        />
      )}
    </div>
  );
}

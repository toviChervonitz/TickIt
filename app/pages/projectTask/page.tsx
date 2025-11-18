"use client";

import React, { useEffect, useState } from "react";
import Task from "@/app/components/Task";
import EditTask from "@/app/components/editTask";
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
  const [editingTask, setEditingTask] = useState<ITask | null>(null);
  const [projectUsers, setLocalProjectUsers] = useState<IUser[]>([]);

  useEffect(() => {
    async function load() {
      if (!projectId || !user) return;

      try {
        const role = await getUserRoleInProject(user._id, projectId);
        setIsManager(role === "manager");

        let data: ITask[] = [];
        if (role === "manager") {
          data = await GetTasksByProjectId(user._id, projectId);
        } else {
          data = tasks.filter(
            (t) => (t.projectId as { _id: string })._id === projectId
          );
        }
        setFilteredTasks(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load tasks");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [projectId, user, tasks]);

  const handleStatusChange = (id: string, newStatus: "todo" | "doing" | "done") => {
    const updated = tasks.map((t) =>
      t._id === id ? { ...t, status: newStatus } : t
    );
    setTasks(updated);
    setFilteredTasks(updated);
  };

  const fetchProjectUsers = async () => {
    if (!projectId) return;
    const res = await getAllUsersByProjectId(projectId);
    setLocalProjectUsers(res.users || []);
    setProjectUsers(res.users || []);
  };

  const handleEdit = async (taskId: string) => {
    const t = filteredTasks.find((t) => t._id === taskId);
    if (!t) return;
    await fetchProjectUsers();
    setEditingTask(t);
  };

  const handleSaved = async () => {
    setEditingTask(null);
    if (user) {
      const updatedTasks = await GetTasksByProjectId(user._id, projectId!);
      setTasks(updatedTasks);
      setFilteredTasks(updatedTasks);
    }
  };

  if (loading) return <p>Loading tasks...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      {filteredTasks.map((task) => {
        const userId = (task.userId as IUser)?._id || "";
        const userName = (task.userId as IUser)?.name || "Unknown";
        const projectName = (task.projectId as { name: string })?.name || "No project";
        const dueDate =
          task.dueDate instanceof Date
            ? task.dueDate
            : task.dueDate
            ? new Date(task.dueDate)
            : undefined;

        return (
          <Task
            key={task._id}
            _id={task._id!}
            userId={userId}
            title={task.title}
            content={task.content}
            status={task.status}
            dueDate={dueDate}
            userName={userName}
            projectName={projectName}
            onStatusChange={handleStatusChange}
            canEdit={isManager}
            onEdit={handleEdit}
          />
        );
      })}

      {editingTask && (
        <div className="modal">
          <EditTask
            task={{
              _id: editingTask._id!,
              title: editingTask.title,
              content: editingTask.content || "",
              userId: (editingTask.userId as IUser)._id!,
              dueDate: editingTask.dueDate
                ? new Date(editingTask.dueDate).toISOString().split("T")[0]
                : "",
            }}
            projectUsers={projectUsers}
            projectId={projectId!}
            onSaved={handleSaved}
          />
        </div>
      )}
    </div>
  );
}

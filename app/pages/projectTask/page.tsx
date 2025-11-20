"use client";

import React, { useEffect, useState } from "react";
import Task from "@/app/components/Task";
import EditTask, { TaskForm } from "@/app/components/editTask";
import useAppStore from "@/app/store/useAppStore";
import { DeleteTask, GetTasksByProjectId } from "@/app/lib/server/taskServer";
import { getUserRoleInProject } from "@/app/lib/server/projectServer";
import { getAllUsersByProjectId } from "@/app/lib/server/userServer";
import AddMember from "@/app/components/AddMember";
import AddTaskPage from "../addTask/page";
import { ITask, IUser } from "@/app/models/types";
import ConfirmDelete from "@/app/components/DeletePopup";
import { useRouter } from "next/navigation";

export default function GetProjectTasks() {
  const { projectId, tasks, setTasks, user, setProjectUsers } = useAppStore();

  const [filteredTasks, setFilteredTasks] = useState<ITask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isManager, setIsManager] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskForm | null>(null);
  const [projectUsers, setLocalProjectUsers] = useState<IUser[]>([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDeleteTitle, setConfirmDeleteTitle] = useState<string>("");
const router = useRouter();

const goBack = () => {
  router.push("/pages/getAllProjects"); 
};

  // Load tasks & manager role
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
            (t) => (t.projectId as { _id?: string })?._id === projectId
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
    if (!projectId) return [];
    const res = await getAllUsersByProjectId(projectId);
    const users = res.users || [];
    setLocalProjectUsers(users);
    setProjectUsers(users);
    return users;
  };

  // Open edit dialog
  const handleEdit = async (taskId: string) => {
    if (!isManager) return;

    const t = filteredTasks.find((t) => t._id?.toString() === taskId);
    if (!t?._id) return alert("Task not found");

    const users = await fetchProjectUsers();

    setEditingTask({
      _id: t._id.toString(),
      title: t.title,
      content: t.content || "",
      userId:
        typeof t.userId === "string"
          ? t.userId
          : (t.userId as IUser)?._id?.toString() || users[0]?._id || "",
      dueDate: t.dueDate
        ? new Date(t.dueDate).toISOString().split("T")[0]
        : "",
    });
  };

  // Delete logic
  const handleDelete = async (taskId: string) => {
    try {
      await DeleteTask(taskId);

      setTasks(tasks.filter((t) => t._id?.toString() !== taskId));
      setFilteredTasks(filteredTasks.filter((t) => t._id?.toString() !== taskId));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleSaved = async () => {
    setEditingTask(null);
    if (!user || !projectId) return;

    const updated = await GetTasksByProjectId(user._id, projectId);
    setTasks(updated);
    setFilteredTasks(updated);
  };

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

  const onAddTask = () => setShowAddTask(true);
  const onAddUser = () => setShowAddUser(true);

  if (loading) return <p>Loading tasks...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <button
  onClick={goBack}
  style={{
    marginBottom: "15px",
    marginRight: "10px",
    background: "#eee",
    padding: "6px 12px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    cursor: "pointer",
  }}
>
  ← Back to Projects
</button>


      {/* ⭐ ALWAYS SHOW MANAGER BUTTONS HERE */}
      {isManager && (
        <div style={{ marginBottom: "15px" }}>
          <button onClick={onAddTask} style={{ marginRight: "10px" }}>
            Add Task
          </button>
          <button onClick={onAddUser}>Add User</button>
        </div>
      )}

      {/* ADD USER POPUP */}
      {showAddUser && (
        <AddMember
          projectId={projectId!}
          onUserAdded={(newUser) => {
            const prev = useAppStore.getState().projectUsers;
            setProjectUsers([...prev, newUser]);
          }}
          onClose={() => setShowAddUser(false)}
        />
      )}

      {/* ADD TASK POPUP */}
      {showAddTask && (
        <AddTaskPage
          onClose={() => {
            setShowAddTask(false);
          }}
        />
      )}

      {/* ⭐ TASK LIST */}
      {filteredTasks.length > 0 ? (
        filteredTasks.map((task) => {
          const taskId = task._id?.toString() || "";

          const userId =
            typeof task.userId === "string"
              ? task.userId
              : (task.userId as IUser)?._id || "";

          const userName =
            typeof task.userId === "string"
              ? "Unknown"
              : (task.userId as IUser)?.name || "Unknown";

          const projectName =
            (task.projectId as { name?: string })?.name || "No project";

          const dueDate = task.dueDate
            ? task.dueDate instanceof Date
              ? task.dueDate
              : new Date(task.dueDate)
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
              onDelete={() => {
                setConfirmDeleteId(taskId);
                setConfirmDeleteTitle(task.title);
              }}
              onStatusChange={handleStatusChange}
            />
          );
        })
      ) : (
        <p>No tasks found.</p>
      )}

      {/* CONFIRM DELETE POPUP */}
      {confirmDeleteId && (
        <ConfirmDelete
          taskTitle={confirmDeleteTitle}
          onCancel={() => setConfirmDeleteId(null)}
          onConfirm={() => {
            handleDelete(confirmDeleteId);
            setConfirmDeleteId(null);
          }}
        />
      )}

      {/* EDIT TASK MODAL */}
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

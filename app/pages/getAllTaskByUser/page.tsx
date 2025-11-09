"use client";

import React, { useEffect, useState } from "react";
import Task from "@/app/components/Task";
import useAppStore from "@/app/store/useAppStore";
import { GetTasksByUserId } from "@/app/lib/server/taskServer";
import { IProject, IUser } from "@/app/models/types";

interface TaskType {
    _id: string;
    title: string;
    content?: string;
    status: "todo" | "doing" | "done";
    duedate?: string;
    userId?: { name: string };
    projectId?: { name: string };
}

export default function UserTasks() {
    const { user, tasks, setTasks } = useAppStore();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadTasks() {
            if (tasks.length > 0) {
                setLoading(false);
                return;
            }
            if (!user?._id) return;

            try {
                const data = await GetTasksByUserId(user._id);
                setTasks(data);
            } catch (err: any) {
                console.error(err);
                setError("Failed to fetch tasks");
            } finally {
                setLoading(false);
            }
        }
        loadTasks();
    }, [user?._id]);

    if (loading) return <p>Loading tasks...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;
    return (
        <div className="tasks-container">
            <h2>My Tasks</h2>

            {tasks.length ? (
                tasks.map((task) => (
                    <Task
                        key={task._id}
                        title={task.title}
                        content={task.content}
                        status={task.status}
                        dueDate={task.dueDate ? new Date(task.dueDate) : undefined}
                        userName={(task.userId as IUser)?.name || "Unknown"}
                        projectName={(task.projectId as IProject)?.name || "No project"}
                    />
                ))
            ) : (
                <p>No tasks found.</p>
            )}
        </div>
    );
};

"use client";

import React, { useEffect, useState } from "react";
import useAppStore from "@/app/store/useAppStore";
import { GetTasksByUserId } from "@/app/lib/server/taskServer";
import { ITask } from "@/app/models/types";

const Dashboard: React.FC = () => {
  const user = useAppStore((state) => state.user);
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchTasks = async () => {
      setLoading(true);
      try {
        const allTasks: ITask[] = await GetTasksByUserId(user._id);

        // Filter tasks due within 7 days
        const now = new Date();
        const sevenDaysLater = new Date();
        sevenDaysLater.setDate(now.getDate() + 7);

        const upcomingTasks = allTasks.filter((task) => {
          if (!task.dueDate) return false;
          const dueDate = new Date(task.dueDate);
          return dueDate >= now && dueDate <= sevenDaysLater;
        });

        setTasks(upcomingTasks);
      } catch (err: any) {
        console.error(err);
        setError("Failed to load tasks.");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [user]);

  if (!user) return <p>Please log in to see your tasks.</p>;
  if (loading) return <p>Loading tasks...</p>;
  if (error) return <p>{error}</p>;
  if (tasks.length === 0) return <p>No tasks due within the next 7 days.</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Tasks Due Within 7 Days</h1>
      <ul className="space-y-3">
        {tasks.map((task) => (
          <li key={task._id} className="border p-3 rounded shadow-sm">
            <h2 className="font-semibold">{task.title}</h2>
            <p>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}</p>
            {task.content && <p>{task.content}</p>}
            <p>Status: {task.status}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;

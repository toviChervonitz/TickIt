
"use client";

import React, { useEffect, useState } from "react";
import useAppStore from "@/app/store/useAppStore";
import { GetTasksByUserId } from "@/app/lib/server/taskServer";
import { GetRecentAssignedTasks, getRecentProjects } from "@/app/lib/server/notificationsServer";
import { ITask } from "@/app/models/types";
import ProgressChart from "@/app/components/charts/progressChart";

const Dashboard: React.FC = () => {
  const user = useAppStore((state) => state.user);

  const [allTasks, setAllTasks] = useState<ITask[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<ITask[]>([]);
  const [recentAssignedTasks, setRecentAssignedTasks] = useState<ITask[]>([]);
  const [recentProjects, setRecentProjects] = useState<{ _id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // 1️⃣ Fetch all tasks for progress chart
        const fetchedTasks: ITask[] = await GetTasksByUserId(user._id);
        setAllTasks(fetchedTasks);

        // 2️⃣ Filter incomplete tasks due in next 7 days (client-side, hydration-safe)
        const now = new Date();
        const sevenDaysLater = new Date();
        sevenDaysLater.setDate(now.getDate() + 7);

        setUpcomingTasks(
          fetchedTasks.filter(
            (task) =>
              task.status !== "done" &&
              task.dueDate &&
              new Date(task.dueDate) >= now &&
              new Date(task.dueDate) <= sevenDaysLater
          )
        );

        // 3️⃣ Fetch recently assigned tasks (last 2 days)
        const recentTasks = await GetRecentAssignedTasks(user._id.toString(), 2);
        setRecentAssignedTasks(recentTasks);

        // 4️⃣ Fetch recently added projects
        const recentProj = await getRecentProjects();
        setRecentProjects(recentProj);
      } catch (err: any) {
        console.error(err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // 🚨 Hydration-safe: render nothing until client data is loaded
  if (!user) return <p>Please log in to see your dashboard.</p>;
  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="p-6">
      {/* Notifications */}
      {(recentAssignedTasks.length > 0 || recentProjects.length > 0) && (
        <div className="mb-4">
          {/* Recent Projects */}
          {recentProjects.length > 0 && (
            <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-2">
              <p className="font-bold">You were added to new projects!</p>
              <ul className="list-disc list-inside">
                {recentProjects.map((p) => (
                  <li key={p._id}>{p.name}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Recently Assigned Tasks */}
          {recentAssignedTasks.length > 0 && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4">
              <p className="font-bold">Newly Assigned Tasks!</p>
              <ul className="list-disc list-inside">
                {recentAssignedTasks.map((task) => (
                  <li key={task._id}>
                    {task.title}{" "}
                    {task.projectId &&
                      "_in_ " +
                        ("name" in task.projectId ? task.projectId.name : "")}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Progress chart */}
      <ProgressChart tasks={allTasks} />

      {/* Incomplete tasks due in 7 days */}
      <h1 className="text-2xl font-bold mb-4 mt-6">Incomplete Tasks Due Within 7 Days</h1>
      {upcomingTasks.length === 0 ? (
        <p>No incomplete tasks due in the next 7 days.</p>
      ) : (
        <ul className="space-y-3">
          {upcomingTasks.map((task) => (
            <li key={task._id} className="border p-3 rounded shadow-sm">
              <h2 className="font-semibold">{task.title}</h2>
              <p>
                Due:{" "}
                {typeof window !== "undefined" && task.dueDate
                  ? new Date(task.dueDate).toLocaleDateString()
                  : "No due date"}
              </p>
              {task.content && <p>{task.content}</p>}
              <p>Status: {task.status}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dashboard;

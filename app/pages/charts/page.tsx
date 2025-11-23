"use client";

import React, { useEffect, useState } from "react";
import useAppStore from "@/app/store/useAppStore";
import TaskStatusChart from "@/app/components/charts/progressChart";
import TasksByProjectBarChart from "@/app/components/charts/tasksByProject";
import CompletedTasksLineChart from "@/app/components/charts/ProgressByTimeChart";

export default function Charts() {
  const { user, tasks, projects, setTasks } = useAppStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadTasks() {
      if (!user?._id) {
        setLoading(false);
        return;
      }

      if (!tasks || tasks.length === 0) {
        try {
          const { GetTasksByUserId } = await import("@/app/lib/server/taskServer");
          console.log("Fetching tasks for user:", user._id);
          const fetchedTasks = await GetTasksByUserId(user._id);
          console.log("Fetched tasks:", fetchedTasks);
          if (isMounted) setTasks(fetchedTasks);
        } catch (err) {
          console.error("Failed to fetch tasks:", err);
        } finally {
          if (isMounted) setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }

    loadTasks();

    return () => {
      isMounted = false;
    };
  }, [user, tasks, setTasks]);

  if (loading) return <div>Loading tasks...</div>;
  if (!user?._id) return <div>Loading user...</div>;

  return (
    <div>
      <h1>Charts Page</h1>

      <p>general progress</p>
      <TaskStatusChart tasks={tasks} />

      <p>how many tasks in each project</p>
      <TasksByProjectBarChart tasks={tasks} />

      <p>how much done in a day/week/month</p>
      <CompletedTasksLineChart tasks={tasks} />
    </div>
  );
}
//to do:
/*
1. figure out why some of the names arent displaying in the tasks by project chart
2. fix buttons not working
3. why are there errors in the charts page
*/
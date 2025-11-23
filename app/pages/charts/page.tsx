"use client";

import React, { useState, ChangeEvent } from "react";
import useAppStore from "@/app/store/useAppStore";
import TaskStatusChart from "@/app/components/charts/progressChart";
import TasksByProjectBarChart from "@/app/components/charts/tasksByProject";
import CompletedTasksLineChart from "@/app/components/charts/ProgressByTimeChart";



export default function Charts() {
  const { tasks, projects } = useAppStore();
  console.log("tasks in Charts page:", tasks);

  return (
    <div>
        <h1>Charts Page</h1>
        <p>general progress</p>
        <TaskStatusChart tasks={tasks}></TaskStatusChart>
        <p>how many tasks in each project</p>
        <TasksByProjectBarChart tasks={tasks}  />
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
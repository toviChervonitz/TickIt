"use client";

import React, { useState, ChangeEvent } from "react";
import useAppStore from "@/app/store/useAppStore";
import TaskStatusChart from "@/app/components/charts/progressChart";
import TasksByProjectBarChart from "@/app/components/charts/tasksByProject";
import CompletedTasksLineChart from "@/app/components/charts/ProgressByTimeChart";



export default function Charts() {
  const { tasks, projects } = useAppStore();

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

//charts for user:
//- pie chart of task status with hole in the middle (todo, doing, done)
//- line chart of tasks completed over time
//- bar chart of tasks by project



//charts for manager:
//- bar chart of tasks per user
//- pie chart of task status across the project

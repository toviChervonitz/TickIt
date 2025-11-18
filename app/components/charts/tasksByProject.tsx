"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { ITask } from "../../models/types";
interface Props {
  tasks: ITask[];
}

export default function TasksByProjectBarChart({ tasks }: Props) {
  // Count tasks per project
  const counts: Record<string, number> = {};

  tasks.forEach((task) => {
    const projectName = task.projectId && "name" in task.projectId ? task.projectId.name : "Unknown";
    counts[projectName] = (counts[projectName] || 0) + 1;
  });

  // Prepare data for Recharts
  const data = Object.entries(counts).map(([projectName, count]) => ({
    name: projectName,
    tasks: count,
  }));

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip formatter={(value: number) => [`${value} tasks`, "Tasks"]} />
          <Legend />
          <Bar dataKey="tasks" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

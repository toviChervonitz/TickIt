
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
  Cell,
} from "recharts";
import { ITask } from "../../models/types";

interface Props {
  tasks: ITask[];
}

export default function TasksByProjectBarChart({ tasks }: Props) {
  // Count tasks per project and store color
  const projectMap: Record<
    string,
    { count: number; color: string }
  > = {};

  tasks.forEach((task) => {
    if (task.projectId && "name" in task.projectId) {
      const name = task.projectId.name;
      const color = task.projectId.color || "#8884d8"; // fallback color
      if (!projectMap[name]) projectMap[name] = { count: 0, color };
      projectMap[name].count += 1;
    } else {
      const name = "Unknown";
      if (!projectMap[name]) projectMap[name] = { count: 0, color: "#8884d8" };
      projectMap[name].count += 1;
    }
  });

  // Prepare data for Recharts
  const data = Object.entries(projectMap).map(([name, { count, color }]) => ({
    name,
    tasks: count,
    color,
  }));

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip formatter={(value: number) => [`${value} tasks`, "Tasks"]} />
          <Legend />
          <Bar dataKey="tasks">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

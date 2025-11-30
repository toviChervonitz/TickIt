"use client";

import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {  ITask } from "../../models/types";

interface Props {
  tasks: ITask[];
}

export default function TaskStatusPieChart({ tasks }: Props) {
  const counts = {
    todo: tasks.filter((t) => t.status === "todo").length,
    doing: tasks.filter((t) => t.status === "doing").length,
    done: tasks.filter((t) => t.status === "done").length,
  };

  const total = counts.todo + counts.doing + counts.done;

  const data = [
    { name: "To Do", value: counts.todo },
    { name: "Doing", value: counts.doing },
    { name: "Done", value: counts.done },
  ];

  const COLORS = ["#FF8042", "#FFBB28", "#00C49F"];

  // Custom label: "Done — 45%"
  const renderLabel = (entry: any) => {
    if (total === 0) return ""; // avoid NaN when no tasks
    const percent = ((entry.value / total) * 100).toFixed(0);
    return `${entry.name} - ${percent}%`;
  };

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={110}
            label={renderLabel}
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={COLORS[index]} />
            ))}
          </Pie>

          <Tooltip
            formatter={(value: number, name: string) =>
              [`${value} tasks`, name]
            }
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

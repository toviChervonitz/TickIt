"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ITask } from "../../models/types";
import { KANBAN_COLUMNS_CONFIG } from "../../config/kanbanConfig";
import { getTranslation } from "@/app/lib/i18n";

interface Props {
  tasks: ITask[];
}

export default function TaskStatusPieChart({ tasks }: Props) {
  const counts = {
    todo: tasks.filter((t) => t.status === "todo").length,
    doing: tasks.filter((t) => t.status === "doing").length,
    done: tasks.filter((t) => t.status === "done").length,
  };

  const t = getTranslation();

  const total = counts.todo + counts.doing + counts.done;

  const COLORS = [
    "#efe6cfff",
    KANBAN_COLUMNS_CONFIG.find((c: any) => c.id === "doing")!.color,
    KANBAN_COLUMNS_CONFIG.find((c: any) => c.id === "done")!.color,
  ];

  const data = [
    { name: t("todo"), value: counts.todo },
    { name: t("doing"), value: counts.doing },
    { name: t("done"), value: counts.done },
  ];

  // Label inside slice: "45%"
  const renderInsideLabel = (props: any) => {
    const { cx, cy, midAngle, outerRadius, value, index } = props;

    if (total === 0 || value === 0) return null;

    const RAD = Math.PI / 180;
    const radius = outerRadius * 0.6; 
    const x = cx + radius * Math.cos(-midAngle * RAD);
    const y = cy + radius * Math.sin(-midAngle * RAD);

    const percent = ((value / total) * 100).toFixed(0);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        fontSize="16"
        fontWeight="600"
        textAnchor="middle"
        dominantBaseline="central"
      >
        {percent}%
      </text>
    );
  };
  

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer> 
        <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={110}
            label={renderInsideLabel} 
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={COLORS[index]} />
            ))}
          </Pie>

          <Tooltip formatter={(value: number) => [`${value} tasks`]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

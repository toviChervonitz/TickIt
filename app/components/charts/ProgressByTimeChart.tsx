"use client";

import { ITask } from "@/app/models/types";
import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";


type Period = "day" | "week" | "month";

interface Props {
  tasks: ITask[];
}

export default function CompletedTasksLineChart({ tasks }: Props) {
  const [period, setPeriod] = useState<Period>("week");
console.log(tasks)
  // --- Helpers ---
  const getWeekNumber = (d: Date) => {
    const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const dayNum = date.getDay() || 7;
    date.setDate(date.getDate() + 4 - dayNum);
    const yearStart = new Date(date.getFullYear(), 0, 1);
    return Math.ceil((((date as any) - (yearStart as any)) / 86400000 + 1) / 7);
  };

  const aggregateCompletedTasks = (tasks: ITask[], period: Period) => {
    const counts: Record<string, number> = {};

    tasks.forEach((task) => {
      if (!task.completedDate) return;

      const date = new Date(task.completedDate);
      let key: string;

      switch (period) {
        case "day":
          key = date.toISOString().split("T")[0]; // YYYY-MM-DD
          break;
        case "week":
          key = `${date.getFullYear()}-W${getWeekNumber(date)}`;
          break;
        case "month":
          key = `${date.getFullYear()}-${date.getMonth() + 1}`;
          break;
      }

      counts[key] = (counts[key] || 0) + 1;
    });

    return Object.entries(counts)
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .map(([date, count]) => ({ date, count }));
  };

  const data = aggregateCompletedTasks(tasks, period);

  return (
    <div style={{ width: "100%", maxWidth: "800px", margin: "0 auto" }}>
      {/* Period Selector */}
      <div style={{ marginBottom: "1rem", textAlign: "center" }}>
        {(["day", "week", "month"] as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            style={{
              margin: "0 0.5rem",
              padding: "0.5rem 1rem",
              background: p === period ? "#8884d8" : "#f0f0f0",
              color: p === period ? "#fff" : "#000",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* Line Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

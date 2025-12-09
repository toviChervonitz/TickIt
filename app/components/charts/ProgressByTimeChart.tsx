"use client";

import React, { useMemo, useState } from "react";
import {
  Box,
  Paper,
  Select,
  MenuItem,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  useTheme,
  Stack,
  Divider,
} from "@mui/material";

import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { ITask } from "../../models/types";

type Range = "day" | "week" | "month";

interface TaskCompletionChartProps {
  tasks: ITask[];
}

const TaskCompletionChart: React.FC<TaskCompletionChartProps> = ({ tasks }) => {
  const theme = useTheme();
  const [range, setRange] = useState<Range>("day");
  const [selectedProject, setSelectedProject] = useState<string>("all");

  // ----------------- Helpers -----------------
  const formatDate = (d: Date) => d.toISOString().split("T")[0];

  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const diff = d.getDate() - d.getDay();
    return formatDate(new Date(d.setDate(diff)));
  };

  const getMonthStart = (date: Date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${("0" + (d.getMonth() + 1)).slice(-2)}-01`;
  };

  // ----------------- Project Names -----------------
  const projectNames = useMemo(() => {
    const names = new Set<string>();
    tasks.forEach((t) => {
      if ((t.projectId as any).name) names.add((t.projectId as any).name);
    });
    return ["all", ...Array.from(names)];
  }, [tasks]);

  // ----------------- Build Graph Data -----------------
  const groupedData = useMemo(() => {
    const filtered = tasks.filter((t) => {
      if (t.status !== "done" || !t.completedDate) return false;
      if (selectedProject !== "all" && (t.projectId as any).name !== selectedProject)
        return false;
      return true;
    });

    const map = new Map<string, number>();

    filtered.forEach((task) => {
      const d = new Date(task.completedDate!);
      let key = "";

      if (range === "day") key = formatDate(d);
      if (range === "week") key = getWeekStart(d);
      if (range === "month") key = getMonthStart(d);

      map.set(key, (map.get(key) || 0) + 1);
    });

    let total = 0;
    return Array.from(map, ([date, count]) => {
      total += count;
      return { date, count: total };
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [tasks, range, selectedProject]);

  // ----------------- UI -----------------
  return (

      <Stack spacing={2}>


        <Divider />

        {/* FILTERS */}
        <Stack direction="row" spacing={2} alignItems="center">
          <Select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            size="small"
            sx={{
              minWidth: 150,
              background: theme.palette.background.paper,
              borderRadius: 2,
            }}
          >
            {projectNames.map((name) => (
              <MenuItem key={name} value={name}>
                {name === "all" ? "All Projects" : name}
              </MenuItem>
            ))}
          </Select>

          <ToggleButtonGroup
            exclusive
            value={range}
            onChange={(e, val) => val && setRange(val)}
            size="small"
            sx={{
              borderRadius: 2,
              "& .MuiToggleButton-root": {
                px: 2,
                borderRadius: "12px",
              },
            }}
          >
            <ToggleButton value="day">Daily</ToggleButton>
            <ToggleButton value="week">Weekly</ToggleButton>
            <ToggleButton value="month">Monthly</ToggleButton>
          </ToggleButtonGroup>
        </Stack>

        {/* GRAPH BOX */}
        <Box
          sx={{
            width: "100%",
            height: 320,
            background: theme.palette.background.paper,
            borderRadius: 2,
            p: 2,
            boxShadow: "inset 0 0 6px rgba(0,0,0,0.05)",
          }}
        >
          <ResponsiveContainer>
            <LineChart data={groupedData}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke={theme.palette.primary.main}
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>

      </Stack>
  );
};

export default TaskCompletionChart;

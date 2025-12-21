
"use client";

import React, { useMemo, useState } from "react";
import {
  Box,
  Select,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  useTheme,
  Stack,
  Divider,
  TextField,
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
import { getTranslation } from "@/app/lib/i18n";
import useAppStore from "@/app/store/useAppStore";

type Range = "day" | "week" | "month";

interface TaskCompletionChartProps {
  tasks: ITask[];
}

const TaskCompletionChart: React.FC<TaskCompletionChartProps> = ({ tasks }) => {
  const theme = useTheme();
  const [range, setRange] = useState<Range>("day");
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const t = getTranslation();
  const { language } = useAppStore();
  const isRTL = language === "he";

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
        <TextField
          select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          size="small"
          SelectProps={{
            MenuProps: {
              PaperProps: { dir: language === "he" ? "rtl" : "ltr" },
            },
          }}
          sx={{
            width: { xs: "100%", sm: 160 },
            "& .MuiOutlinedInput-root": { borderRadius: 2 },
          }}
        >
          <MenuItem value="all">{t("allProjects")}</MenuItem>
          {projectNames
            .filter((name) => name !== "all") // exclude "all" here
            .map((name) => (
              <MenuItem key={name} value={name}>
                {name}
              </MenuItem>
            ))}

        </TextField>

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
          <ToggleButton value="day">{t("daily")}</ToggleButton>
          <ToggleButton value="week">{t("weekly")}</ToggleButton>
          <ToggleButton value="month">{t("monthly")}</ToggleButton>
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
        {groupedData.length === 0 ? (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "text.secondary",
              fontSize: "0.95rem",
              textAlign: "center",
            }}
          >
            {t("noDataToDisplay")}
          </Box>
        ) : (
          <ResponsiveContainer>
            <LineChart data={groupedData}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip formatter={(value) => [value, t("completedTasks")]} />
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
        )}

      </Box>
    </Stack>
  );
};

export default TaskCompletionChart;

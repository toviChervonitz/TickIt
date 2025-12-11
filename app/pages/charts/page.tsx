"use client";

import React, { useEffect, useState } from "react";
import { Box, GridLegacy as Grid, Paper, Typography, useTheme, Stack } from "@mui/material";
import BarChartIcon from "@mui/icons-material/BarChart";
import PieChartIcon from "@mui/icons-material/PieChart";
import TimelineIcon from "@mui/icons-material/Timeline";
import useAppStore from "@/app/store/useAppStore";
import TaskStatusChart from "@/app/components/charts/progressChart";
import TasksByProjectBarChart from "@/app/components/charts/tasksByProject";
import CompletedTasksLineChart from "@/app/components/charts/ProgressByTimeChart";
import { getTranslation } from "@/app/lib/i18n";

export default function Charts() {
  const { user, tasks, projects, setTasks } = useAppStore();
  const [loading, setLoading] = useState(true);
  const t = getTranslation();

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

  if (loading) return <div>{t("loadingTasks")}...</div>;
  if (!user?._id) return <div>{t("loadingUser")}...</div>;


  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: "auto" }}>
      <Typography
        variant="h4"
        fontWeight={700}
        color="text.secondary"
        sx={{ mb: 3 }}
      >
        {t("insightsAndAnalytics")}
      </Typography>

      <Grid container spacing={3}>

        {/* ----- GENERAL PROGRESS ----- */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: 3,
              backgroundColor: "background.default",
              minHeight: 450,
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <PieChartIcon color="secondary" />
              <Typography variant="h6" fontWeight={600} color="text.secondary">
                {t("generalProgress")}
              </Typography>
            </Stack>

            <TaskStatusChart tasks={tasks} />
          </Paper>
        </Grid>

        {/* ----- TASKS PER PROJECT ----- */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: 3,
              backgroundColor: "background.default",
              minHeight: 450,
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <BarChartIcon color="secondary" />
              <Typography variant="h6" fontWeight={600} color="text.secondary">
                {t("tasksByProject")}
              </Typography>
            </Stack>

            <TasksByProjectBarChart tasks={tasks} />
          </Paper>
        </Grid>

        {/* ----- DONE OVER TIME ----- */}
        <Grid item xs={12}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: 3,
              backgroundColor: "background.default",
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <TimelineIcon color="secondary" />
              <Typography variant="h6" fontWeight={600} color="text.secondary">
                {t("progressOverTime")}
              </Typography>
            </Stack>

            <CompletedTasksLineChart tasks={tasks} />
          </Paper>
        </Grid>

      </Grid>
    </Box>
  );

}

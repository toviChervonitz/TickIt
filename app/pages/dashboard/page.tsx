
"use client";

import React, { useEffect, useState } from "react";
import { GetTasksByUserId } from "@/app/lib/server/taskServer";
import { GetRecentAssignedTasks, getRecentProjects } from "@/app/lib/server/notificationsServer";
import { ITask } from "@/app/models/types";
import ProgressChart from "@/app/components/charts/progressChart";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  GridLegacy as Grid,
  Card,
  CardContent,
  Button,
  Alert,
  Stack,
  Chip,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Paper,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import FolderIcon from "@mui/icons-material/Folder";
import AssignmentIcon from "@mui/icons-material/Assignment";
import useAppStore from "@/app/store/useAppStore";
import { KANBAN_COLUMNS_CONFIG } from "@/app/config/kanbanConfig";
import { getTranslation } from "@/app/lib/i18n";

const Dashboard: React.FC = () => {
  const router = useRouter();
  const t = getTranslation();

  const { user, tasks, setTasks } = useAppStore();
  const [upcomingTasks, setUpcomingTasks] = useState<ITask[]>([]);
  const [recentAssignedTasks, setRecentAssignedTasks] = useState<ITask[]>([]);
  const [recentProjects, setRecentProjects] = useState<{ _id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  const getKanbanColor = (id: "todo" | "doing" | "done") => {
    return KANBAN_COLUMNS_CONFIG.find(c => c.id === id);
  };

  const TODO_CONFIG = getKanbanColor("todo");
  const DOING_CONFIG = getKanbanColor("doing");
  const DONE_CONFIG = getKanbanColor("done");

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const fetchedTasks: ITask[] = await GetTasksByUserId(user._id);
        setTasks(fetchedTasks);

        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const sevenDaysLater = new Date();
        sevenDaysLater.setDate(now.getDate() + 7);
        sevenDaysLater.setHours(23, 59, 59, 999);

        const filtered = fetchedTasks.filter((task) => {
          if (task.status === "done") return false;
          if (!task.dueDate) return false;

          const taskDate = new Date(task.dueDate);
          return taskDate >= now && taskDate <= sevenDaysLater;
        });

        console.log("Upcoming tasks filtered:", filtered.length, "tasks");
        setUpcomingTasks(filtered);

        const recentTasks = await GetRecentAssignedTasks(user._id.toString(), 2);
        setRecentAssignedTasks(recentTasks);

        const recentProj = await getRecentProjects();
        setRecentProjects(recentProj);
      } catch (err: any) {
        console.error(err);
        setError(t("dashboardError"));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, setTasks]);

  if (error) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  const todoCount = tasks.filter((t) => t.status === "todo").length;
  const doingCount = tasks.filter((t) => t.status === "doing").length;
  const doneCount = tasks.filter((t) => t.status === "done").length;

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#ffffff", py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography variant="h3" fontWeight={800} color="primary.main" mb={1}>
              {t("welcomeBack")} {user?.name}!
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {t("happening")}
            </Typography>
          </Box>

          <Button
            variant="outlined"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => router.push("/pages/createProject")}
            sx={{
              color: "#0f3460",
              borderColor: "#0f3460",
              backgroundColor: "#ffffff",
              borderWidth: "1.5px",
              fontWeight: 700,
              px: 3,
              py: 1,
              borderRadius: "10px",
              "&:hover": {
                backgroundColor: "#f0f2f5",
                borderColor: "#0f3460",
                borderWidth: "1.5px",
              },
            }}
          >
            {t("createProject")}
          </Button>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                borderRadius: 3,
                border: "1px solid #e8eaed",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="h3" fontWeight={800} color="primary.main">
                      {tasks.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>
                      {t("totalTasks")}                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      backgroundColor: "rgba(29,72,106,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <AssignmentIcon sx={{ fontSize: 28, color: "#1d486a" }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                borderRadius: 3,
                border: "1px solid #e8eaed",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                backgroundColor: TODO_CONFIG?.bgColor || "rgba(183,163,126,0.08)",
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="h3" fontWeight={800} color={TODO_CONFIG?.color || "#1d486a"}
                    >
                      {todoCount}
                    </Typography>
                    <Typography variant="body2" color={TODO_CONFIG?.color || "#1d486a"} fontWeight={600}>
                      {t("todo")}
                    </Typography>
                  </Box>
                  <Chip
                    label={t("todoBold")}
                    sx={{
                      backgroundColor: TODO_CONFIG?.bgColor || "rgba(29,72,106,0.15)",
                      color: TODO_CONFIG?.color || "#1d486a",
                      fontWeight: 700,
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                borderRadius: 3,
                border: "1px solid #e8eaed",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                backgroundColor: DOING_CONFIG?.bgColor || "rgba(61,210,204,0.08)",
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="h3" fontWeight={800} color={DOING_CONFIG?.color || "#66dcd7"}>
                      {doingCount}
                    </Typography>
                    <Typography variant="body2" color={DOING_CONFIG?.color || "#66dcd7"} fontWeight={600}>
                      {t("inProgress")}
                    </Typography>
                  </Box>
                  <Chip
                    label={t("doingBold")}
                    sx={{
                      backgroundColor: DOING_CONFIG?.bgColor || "rgba(102,220,215,0.15)",
                      color: DOING_CONFIG?.color || "#66dcd7",
                      fontWeight: 700,
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                borderRadius: 3,
                border: "1px solid #e8eaed",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                backgroundColor: DONE_CONFIG?.bgColor || "rgba(65,137,135,0.08)",
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="h3" fontWeight={800} color={DONE_CONFIG?.color || "#1d486a"}>
                      {doneCount}
                    </Typography>
                    <Typography variant="body2" color={DONE_CONFIG?.color || "#1d486a"} fontWeight={600}>
                      {t("completed")}
                    </Typography>
                  </Box>
                  <Chip
                    label={t("doneBold")}
                    sx={{
                      backgroundColor: DONE_CONFIG?.bgColor || "rgba(29,72,106,0.1)",
                      color: DONE_CONFIG?.color || "#1d486a",
                      fontWeight: 700,
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Progress Chart & Upcoming Tasks - Side by Side */}
        <Grid container spacing={3}>
          {/* Progress Chart */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                height: "500px",
                borderRadius: 3,
                border: "1px solid #e8eaed",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <CardContent sx={{ p: 2, height: "100%", display: "flex", flexDirection: "column" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2, pb: 0 }}>
                  <TrendingUpIcon sx={{ color: "#3dd2cc", fontSize: 28 }} />
                  <Typography variant="h5" fontWeight={700} color="primary.main">
                    {t("progressOverview")}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ProgressChart tasks={tasks} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Upcoming Tasks */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                height: "500px",
                borderRadius: 3,
                border: "1px solid #e8eaed",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <CardContent sx={{ p: 3, pb: 0 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
                  <CalendarTodayIcon sx={{ color: "#3dd2cc", fontSize: 28 }} />
                  <Typography variant="h5" fontWeight={700} color="primary.main">
                    {t("upcomingTasks")} ({t("next7Days")})
                  </Typography>
                </Box>
              </CardContent>

              <Box
                sx={{
                  flex: 1,
                  overflowY: "auto",
                  px: 3,
                  pb: 3,
                  "&::-webkit-scrollbar": {
                    width: "8px",
                  },
                  "&::-webkit-scrollbar-track": {
                    backgroundColor: "#f5f5f5",
                    borderRadius: "4px",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: "#3dd2cc",
                    borderRadius: "4px",
                    "&:hover": {
                      backgroundColor: "#2dbfb9",
                    },
                  },
                }}
              >
                {loading ? (
                  <Box
                    sx={{
                      flex: 1,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100%",
                    }}
                  >
                    <CircularProgress sx={{ color: "#3dd2cc" }} />
                  </Box>
                ) : upcomingTasks.length === 0 ? (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      textAlign: "center",
                      backgroundColor: "#fafaf9",
                      borderRadius: 2,
                      border: "1px dashed #e0e0e0",
                    }}
                  >
                    <Typography variant="body1" color="text.secondary">
                      {t("noIncomplete")}
                    </Typography>
                  </Paper>
                ) : (
                  <Stack spacing={2}>
                    {upcomingTasks.map((task) => (
                      <Paper
                        key={task._id}
                        elevation={0}
                        sx={{
                          p: 2.5,
                          border: "1px solid #e8eaed",
                          borderRadius: 2,
                          "&:hover": {
                            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                          },
                          transition: "all 0.2s ease",
                        }}
                      >
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                          <Typography variant="h6" fontWeight={700} color="text.primary">
                            {task.title}
                          </Typography>
                          <Chip
                            label={t(task.status)}
                            size="small"
                            sx={{
                              backgroundColor:
                                task.status === "todo"
                                  ? TODO_CONFIG?.bgColor || "rgba(29,72,106,0.15)"
                                  : DOING_CONFIG?.bgColor || "rgba(102,220,215,0.15)",
                              color: task.status === "todo" ? TODO_CONFIG?.color : DOING_CONFIG?.color,
                              fontWeight: 600,
                            }}
                          />
                        </Box>

                        {task.content && (
                          <Typography variant="body2" color="text.secondary" mb={1}>
                            {task.content}
                          </Typography>
                        )}

                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <CalendarTodayIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                          <Typography variant="caption" color="text.secondary">
                            {t("due")}:{" "}
                            {typeof window !== "undefined" && task.dueDate
                              ? new Date(task.dueDate).toLocaleDateString()
                              : t("noDueDate")}
                          </Typography>
                        </Box>
                      </Paper>
                    ))}
                  </Stack>
                )}
              </Box>
            </Card>
          </Grid>
        </Grid>

        {(recentAssignedTasks.length > 0 || recentProjects.length > 0) && (
          <Box sx={{ mt: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <NotificationsActiveIcon sx={{ color: "#3dd2cc", fontSize: 28 }} />
              <Typography variant="h5" fontWeight={700} color="primary.main">
                {t("recentUpdates")}
              </Typography>
            </Box>

            <Grid container spacing={3}> {/* Use Grid for side-by-side layout */}
              {recentProjects.length > 0 && (
                <Grid item xs={12} md={6}> {/* Takes 12 columns on small, 6 on medium and up */}
                  <Alert
                    severity="info"
                    icon={<FolderIcon />}
                    sx={{
                      borderRadius: 2,
                      backgroundColor: "background.default",
                      border: "1px solid #1d486a",
                      height: '100%', // Ensure consistent height for side-by-side
                      "& .MuiAlert-icon": {
                        color: "#1d486a",
                      },
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={700} mb={1}>
                      {t("projectUpdates")}
                    </Typography>
                    <List dense>
                      {recentProjects.map((p) => {
                        if (!p) return null;
                        return (
                          <ListItem key={p._id} sx={{ py: 0 }}>
                            <ListItemText primary={`• ${p.name}`} />
                          </ListItem>
                        )
                      })}
                    </List>
                  </Alert>
                </Grid>
              )}
              {recentAssignedTasks.length > 0 && (
                <Grid item xs={12} md={6}> {/* Takes 12 columns on small, 6 on medium and up */}
                  <Alert
                    severity="success"
                    icon={<AssignmentIcon />}
                    sx={{
                      borderRadius: 2,
                      backgroundColor: "background.default",
                      border: "1px solid #3dd2cc",
                      height: '100%', // Ensure consistent height for side-by-side
                      "& .MuiAlert-icon": {
                        color: "#3dd2cc",
                      },
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={700} mb={1}>
                      {t("taskUpdates")}
                    </Typography>
                    <List dense>
                      {recentAssignedTasks.map((task) => (
                        <ListItem key={task._id} sx={{ py: 0 }}>
                          <ListItemText
                            primary={`• ${task.title}${task.projectId && "name" in task.projectId
                              ? ` ${t("in")}${task.projectId.name}`
                              : ""
                              }`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Alert>
                </Grid>
              )}
            </Grid>
          </Box>
        )}

      </Container>
    </Box>
  );
};

export default Dashboard;
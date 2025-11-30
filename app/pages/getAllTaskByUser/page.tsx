"use client";

import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import useAppStore from "@/app/store/useAppStore";
import { GetTasksByUserId, UpdateTaskStatus } from "@/app/lib/server/taskServer";
import { ITask, IUser, IProject } from "@/app/models/types";
import Task from "@/app/components/Task";
import {
  Container,
  Typography,
  Box,
  GridLegacy as Grid,
  Paper,
  Chip,
  TextField,
  MenuItem,
  Stack,
  IconButton,
  InputAdornment,
  Tooltip,
} from "@mui/material";
import CircleIcon from "@mui/icons-material/Circle";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList"; // לא חובה כרגע אבל השארתי
import ClearIcon from "@mui/icons-material/Clear";
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import { set } from "mongoose";
import { useLanguage } from "@/app/context/LanguageContext";
import { getTranslation } from "@/app/lib/i18n";

export default function UserTasks() {
    const { lang } = useLanguage();
    const t = getTranslation(lang);
  
  const { user, tasks, setTasks } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [sortBy, setSortBy] = useState("dueDate");

  useEffect(() => {
    async function loadTasks() {
      if (!user?._id) return;

      try {
        const data = await GetTasksByUserId(user._id);
        setTasks(data);
      } catch (err: any) {
        console.error(err);
        setError(t("failedToFetchTasks"));
      } finally {
        setLoading(false);
      }
    }

    loadTasks();
  }, [user?._id,setTasks]);

  const handleStatusChange = async (
    id: string,
    newStatus: "todo" | "doing" | "done",
    userId: string
  ) => {
    try {
      const updated = tasks.map((t) =>
        t._id === id ? { ...t, status: newStatus } : t
      );
      setTasks(updated);
      await UpdateTaskStatus(id, userId, newStatus);
    } catch (err) {
      console.error("Failed to update task status:", err);
    }
  };

  // Get unique projects for filter
  const projects = Array.from(
    new Set(
      tasks
        .map((t) => (t.projectId as IProject)?.name)
        .filter(Boolean)
    )
  );

  // Filter and sort tasks
  const filterAndSortTasks = (taskList: ITask[]) => {
    let filtered = taskList;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.content?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Project filter
    if (projectFilter !== "all") {
      filtered = filtered.filter(
        (t) => (t.projectId as IProject)?.name === projectFilter
      );
    }

    // Sort
    if (sortBy === "dueDate") {
      filtered = [...filtered].sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
    } else if (sortBy === "title") {
      filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
    }

    return filtered;
  };

  const todoTasks = filterAndSortTasks(tasks.filter((t) => t.status === "todo"));
  const doingTasks = filterAndSortTasks(tasks.filter((t) => t.status === "doing"));
  const doneTasks = filterAndSortTasks(tasks.filter((t) => t.status === "done"));

  const columns = [
    {
      id: "todo",
      title: t("todo"),
      tasks: todoTasks,
      color: "#1d486a",
      bgColor: "rgba(29,72,106,0.08)",
    },
    {
      id: "doing",
      title: t("inProgress"),
      tasks: doingTasks,
      color: "#66dcd7",
      bgColor: "rgba(102,220,215,0.08)",
    },
    {
      id: "done",
      title: t("completed"),
      tasks: doneTasks,
      color: "#3dd2cc",
      bgColor: "rgba(61,210,204,0.08)",
    },
  ];

  const clearFilters = () => {
    setSearchQuery("");
    setProjectFilter("all");
    setSortBy("dueDate");
  };

  const hasActiveFilters = searchQuery || projectFilter !== "all" || sortBy !== "dueDate";

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#ffffff", py: 4 }}>
      <Container maxWidth="xl">
        
        {/* Header & Filter Row Combined */}
        <Box 
          sx={{ 
            mb: 5, 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'flex-end' },
            gap: 3
          }}
        >
          {/* Left Side: Title */}
          <Box>
            <Typography variant="h4" fontWeight={800} color="primary.main" gutterBottom>
              {t("myTasks")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("manageWorkflow")}
            </Typography>
          </Box>

          {/* Right Side: Minimal Filters */}
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            alignItems="center"
            sx={{ width: { xs: '100%', md: 'auto' } }}
          >
             {/* Search Bar */}
            <TextField
              placeholder={t("search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: "text.secondary" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                width: { xs: '100%', sm: 220 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  backgroundColor: "#fff",
                },
              }}
            />

            {/* Filter: Project */}
            <TextField
              select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              size="small"
              label={t("project")}
              sx={{
                width: { xs: '100%', sm: 160 },
                "& .MuiOutlinedInput-root": { borderRadius: 2 },
              }}
            >
              <MenuItem value="all">{t("allProjects")}</MenuItem>
              {projects.map((project) => (
                <MenuItem key={project} value={project}>
                  {project}
                </MenuItem>
              ))}
            </TextField>

            {/* Sort */}
            <TextField
              select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              size="small"
              label={t("sortBy")}
              sx={{
                width: { xs: '100%', sm: 140 },
                "& .MuiOutlinedInput-root": { borderRadius: 2 },
              }}
            >
              <MenuItem value="dueDate">{t("dueDate")}</MenuItem>
              <MenuItem value="title">{t("title")}</MenuItem>
            </TextField>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <Tooltip title={t("clearFilters")}>
                <IconButton 
                  onClick={clearFilters}
                  size="small"
                  sx={{ 
                    color: 'error.main',
                    border: '1px solid',
                    borderColor: 'error.light',
                    '&:hover': { backgroundColor: 'error.light', color: 'white' }
                  }}
                >
                  <FilterAltOffIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Box>

        {/* Kanban Board */}
        <DragDropContext
          onDragEnd={(result) => {
            const { destination, source, draggableId } = result;

            if (!destination) return;

            if (
              destination.droppableId === source.droppableId &&
              destination.index === source.index
            ) {
              return;
            }

            const newStatus = destination.droppableId as "todo" | "doing" | "done";
            handleStatusChange(draggableId, newStatus, user?._id!);
          }}
        >
          <Grid container spacing={3}>
            {columns.map((col) => (
              <Grid item xs={12} md={4} key={col.id}>
                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <Paper
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      elevation={0}
                      sx={{
                        backgroundColor: col.bgColor,
                        borderRadius: 4, // קצת יותר עגול
                        p: 2,
                        minHeight: "70vh",
                        border: `2px solid ${snapshot.isDraggingOver ? col.color : "transparent"}`, // גבול שקוף כברירת מחדל למראה נקי
                        transition: "all 0.2s ease",
                      }}
                    >
                      {/* Column Header */}
                      <Box
                        sx={{
                          mb: 3,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          px: 1
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: col.color }} />
                          <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                            {col.title}
                          </Typography>
                        </Box>
                        <Chip
                          label={col.tasks.length}
                          size="small"
                          sx={{
                            backgroundColor: 'white',
                            color: col.color,
                            fontWeight: 700,
                            height: 24,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                          }}
                        />
                      </Box>

                      {/* Tasks */}
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        {col.tasks.length > 0 ? (
                          col.tasks.map((task, index) => {
                            const typedUser = task.userId as IUser | undefined;
                            const typedProject = task.projectId as IProject | undefined;

                            return (
                              <Draggable
                                key={task._id}
                                draggableId={task._id!}
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <Box
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    sx={{
                                      opacity: snapshot.isDragging ? 0.8 : 1,
                                      transform: snapshot.isDragging
                                        ? "rotate(3deg)"
                                        : "none",
                                      transition: 'transform 0.2s',
                                      ...provided.draggableProps.style // חשוב מאוד להשאיר את זה
                                    }}
                                  >
                                    <Task
                                      _id={task._id!}
                                      userId={typedUser?._id || ""}
                                      title={task.title}
                                      content={task.content}
                                      status={task.status}
                                      dueDate={
                                        task.dueDate ? new Date(task.dueDate) : undefined
                                      }
                                      userName={typedUser?.name || "Unknown"}
                                      projectName={typedProject?.name || "No project"}
                                      onStatusChange={handleStatusChange}
                                      showButtons={false}
                                    />
                                  </Box>
                                )}
                              </Draggable>
                            );
                          })
                        ) : (
                          <Box
                            sx={{
                              p: 4,
                              textAlign: "center",
                              opacity: 0.5,
                              border: '1px dashed',
                              borderColor: 'divider',
                              borderRadius: 2
                            }}
                          >
                            <Typography variant="body2">
                              {t("noTasksYet")}
                            </Typography>
                          </Box>
                        )}
                        {provided.placeholder}
                      </Box>
                    </Paper>
                  )}
                </Droppable>
              </Grid>
            ))}
          </Grid>
        </DragDropContext>
      </Container>
    </Box>
  );
}

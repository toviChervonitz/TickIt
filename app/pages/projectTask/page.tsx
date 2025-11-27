"use client";
import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import Task from "@/app/components/Task";
import EditTask, { TaskForm as EditTaskForm } from "@/app/components/editTask";
import TaskForm, { TaskFormData } from "@/app/components/AddTaskForm";
import useAppStore from "@/app/store/useAppStore";
import {
  DeleteTask,
  GetTasksByProjectId,
  CreateTask,
  UpdateTaskStatus,
} from "@/app/lib/server/taskServer";
import { getUserRoleInProject } from "@/app/lib/server/projectServer";
import { getAllUsersByProjectId } from "@/app/lib/server/userServer";
import AddMember from "@/app/components/AddMember";
import { ITask, IUser } from "@/app/models/types";
// --- ייבוא חדש ---
import { KANBAN_COLUMNS_CONFIG } from "@/app/config/kanbanConfig"; 
// -----------------

import {
  Box,
  Container,
  Typography,
  GridLegacy as Grid,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Stack,
  TextField,
  InputAdornment,
  MenuItem,
  Tooltip,
} from "@mui/material";

import CircleIcon from "@mui/icons-material/Circle";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AddIcon from "@mui/icons-material/Add";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import SearchIcon from "@mui/icons-material/Search";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";
import { useRouter } from "next/navigation";
import { getTranslation } from "@/app/lib/i18n";
import { useLanguage } from "@/app/context/LanguageContext";

export default function GetProjectTasks() {
  const { projectId, tasks, setTasks, user, setProjectUsers, getProjectName } = useAppStore();
  const { lang } = useLanguage();
  const t = getTranslation(lang);
  // Tasks Data
  const [filteredTasks, setFilteredTasks] = useState<ITask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isManager, setIsManager] = useState(false);
  
  // Modals State
  const [editingTask, setEditingTask] = useState<EditTaskForm | null>(null);
  const [projectUsers, setLocalProjectUsers] = useState<IUser[]>([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [userFilter, setUserFilter] = useState("all");
  const [sortBy, setSortBy] = useState("dueDate");

  const [newTask, setNewTask] = useState<TaskFormData>({
    title: "",
    content: "",
    userId: "",
    dueDate: "",
    status: "todo",
  });

  const router = useRouter();
  const goBack = () => router.push("/pages/getAllProjects");

  useEffect(() => {
    if (!projectId || !user) return;

    const loadProjectData = async () => {
      setLoading(true);
      try {
        const role = await getUserRoleInProject(user._id, projectId);
        setIsManager(role === "manager");

        let data: ITask[] = [];
        if (role === "manager") {
          data = await GetTasksByProjectId(user._id, projectId);
        } else {
          data = tasks.filter(
            (t) => (t.projectId as { _id?: string })?._id === projectId
          );
        }
        setFilteredTasks(data);

        const res = await getAllUsersByProjectId(projectId);
        const users = res.users || [];
        setLocalProjectUsers(users);
        setProjectUsers(users);
      } catch (err) {
        console.error(err);
        setError(t("failedProjectData"));
      } finally {
        setLoading(false);
      }
    };

    loadProjectData();
  }, [projectId, user]);

  // --- Filter Logic ---
  const filterAndSortTasks = (taskList: ITask[]) => {
    let result = [...taskList];

    // 1. Search Filter
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(lowerQuery) ||
          t.content?.toLowerCase().includes(lowerQuery)
      );
    }

    // 2. User Filter (Assignee)
    if (userFilter !== "all") {
      result = result.filter((t) => {
        const tUserId = typeof t.userId === 'string' ? t.userId : (t.userId as IUser)?._id;
        return tUserId === userFilter;
      });
    }

    // 3. Sort
    if (sortBy === "dueDate") {
      result.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
    } else if (sortBy === "title") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  };

  const clearFilters = () => {
    setSearchQuery("");
    setUserFilter("all");
    setSortBy("dueDate");
  };

  const hasActiveFilters = searchQuery || userFilter !== "all" || sortBy !== "dueDate";

  // --- Task Categories (Applied Filters) ---
  const displayedTasks = filterAndSortTasks(filteredTasks);
  const todoTasks = displayedTasks.filter((t) => t.status === "todo");
  const doingTasks = displayedTasks.filter((t) => t.status === "doing");
  const doneTasks = displayedTasks.filter((t) => t.status === "done");

  // --- Handlers ---

  const fetchProjectUsers = async () => {
    if (!projectId) return [];
    const res = await getAllUsersByProjectId(projectId);
    const users = res.users || [];
    setLocalProjectUsers(users);
    setProjectUsers(users);
    return users;
  };

  const handleEdit = async (taskId: string) => {
    if (!isManager) return;
    const t = filteredTasks.find((t) => t._id?.toString() === taskId);
    if (!t?._id) return alert("Task not found");

    const users = await fetchProjectUsers();
    setEditingTask({
      _id: t._id.toString(),
      title: t.title,
      content: t.content || "",
      userId:
        typeof t.userId === "string"
          ? t.userId
          : (t.userId as IUser)?._id?.toString() || users[0]?._id || "",
      dueDate: t.dueDate
        ? new Date(t.dueDate).toISOString().split("T")[0]
        : "",
    });
  };

  const handleDelete = async (taskId: string) => {
    try {
      await DeleteTask(taskId);
      setTasks(tasks.filter((t) => t._id?.toString() !== taskId));
      setFilteredTasks(
        filteredTasks.filter((t) => t._id?.toString() !== taskId)
      );
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleSaved = async () => {
    setEditingTask(null);
    if (!user || !projectId) return;

    const updated = await GetTasksByProjectId(user._id, projectId);
    setTasks(updated);
    setFilteredTasks(updated);
  };

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
      
      // Update filtered tasks as well to reflect change immediately
      setFilteredTasks((prev) =>
        prev.map((t) =>
          t._id?.toString() === id ? { ...t, status: newStatus } : t
        )
      );

      await UpdateTaskStatus(id, userId, newStatus);
    } catch (err) {
      console.error("Failed to update task status:", err);
    }
  };

  const handleDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId as "todo" | "doing" | "done";

    const task = filteredTasks.find((t) => t._id?.toString() === draggableId);
    if (!task) return;

    const userId =
      typeof task.userId === "string"
        ? task.userId
        : (task.userId as IUser)?._id?.toString() || "";

    handleStatusChange(draggableId, newStatus, userId);
  };

  const handleAddTaskSubmit = async () => {
    if (!projectId) return;
    try {
      const created = await CreateTask({ ...newTask, projectId });
      setShowAddTask(false);
      setNewTask({
        title: "",
        content: "",
        userId: "",
        dueDate: "",
        status: "todo",
      });

      if (!user) return;

      if (created && created.task) {
        setTasks([...tasks, created.task]);
        setFilteredTasks((prev) => [...prev, created.task]);
      }
    } catch (err) {
      console.error(err);
    }
  };


  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#fff", py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box
          sx={{
            mb: 4,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: 'wrap',
            gap: 2
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
              onClick={goBack}
              sx={{
                color: "primary.main",
                "&:hover": { backgroundColor: "rgba(29,72,106,0.1)" },
              }}
            >
{             lang=="en"? <ArrowBackIcon />:<ArrowForwardIcon />
}            </IconButton>

            <Box>
              <Typography variant="h4" fontWeight={800} color="primary.main">
                {getProjectName(projectId!)}
              </Typography>
              <Typography variant="body1" color="text.secondary">
{t("manageTasks")}              </Typography>
            </Box>
          </Box>

          {isManager && (
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setShowAddTask(true)}
                sx={{
                  fontWeight: 600,
                  background: "linear-gradient(to bottom, #3dd2cc, #2dbfb9)",
                  "&:hover": {
                    background: "linear-gradient(to bottom, #2dbfb9, #1fa9a3)",
                  },
                }}
              >
                {t("addTask")}
              </Button>

              <Button
                variant="outlined"
                startIcon={<PersonAddIcon />}
                onClick={() => setShowAddUser(true)}
                sx={{
                  fontWeight: 600,
                  borderWidth: 2,
                  "&:hover": { borderWidth: 2 },
                }}
              >
                {t("addMember")}
              </Button>
            </Stack>
          )}
        </Box>

        {/* Filters Toolbar - Clean UI */}
        <Box sx={{ mb: 4 }}>
            <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={2} 
                alignItems="center"
                justifyContent="flex-end" // Align to right
            >
             {/* Search Bar */}
            <TextField
              placeholder={t("searchTasks")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
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
                  backgroundColor: "#f9f9f9",
                  "& fieldset": { borderColor: "#e0e0e0" },
                  "&:hover fieldset": { borderColor: "#bdbdbd" },
                  "&.Mui-focused fieldset": { borderColor: "#3dd2cc" },
                },
              }}
            />

            {/* Filter: User (Team Member) */}
            <TextField
              select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              size="small"
              label={t("assignee")}
              sx={{
                width: { xs: '100%', sm: 160 },
                "& .MuiOutlinedInput-root": { borderRadius: 2 },
              }}
            >
              <MenuItem value="all">{t("allMembers")}</MenuItem>
              {projectUsers.map((u) => (
                <MenuItem key={u._id} value={u._id}>
                  {u.name}
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

        {/* Drag & Drop */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <Grid container spacing={3}>
            {KANBAN_COLUMNS_CONFIG.map((columnConfig:any) => {
              // הקצאת המשימות הרלוונטיות לפי ID
              const tasks = 
                columnConfig.id === "todo" ? todoTasks : 
                columnConfig.id === "doing" ? doingTasks : 
                doneTasks;

              return (
                <Grid item xs={12} md={4} key={columnConfig.id}>
                  <Box sx={{ height: "100%" }}>
                    <Droppable droppableId={columnConfig.id}>
                      {(provided) => (
                        <Box
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          sx={{ height: "100%" }}
                        >
                          <Paper
                            elevation={0}
                            sx={{
                              backgroundColor: columnConfig.bgColor, // צבע הרקע מהקונפיגורציה
                              borderRadius: 3,
                              p: 2,
                              minHeight: "70vh",
                              border: "1px solid #e8eaed",
                            }}
                          >
                            {/* Column Header */}
                            <Box
                              sx={{
                                mb: 3,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                              }}
                            >
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <CircleIcon sx={{ fontSize: 12, color: columnConfig.color }} /> 
                                <Typography variant="h6" fontWeight={700}>
                                  {columnConfig.title==="To Do"?t("todo"):columnConfig.title==="In Progress"?t("inProgress"):t("completed")}
                                </Typography>
                              </Box>

                              <Chip
                                label={loading ? "…" : tasks.length} // שימוש במשתנה tasks
                                size="small"
                                sx={{
                                  backgroundColor: columnConfig.color, // צבע ראשי מהקונפיגורציה
                                  color: "white",
                                  fontWeight: 600,
                                }}
                              />
                            </Box>

                            {/* Tasks */}
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                              {loading ? (
                                <Paper
                                  elevation={0}
                                  sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    backgroundColor: "white",
                                    border: "1px dashed #d0d0d0",
                                  }}
                                >
                                  <Typography variant="body2" color="text.secondary">
                                    {t("loadingTask")}
                                  </Typography>
                                </Paper>
                              ) : tasks.length > 0 ? (
                                tasks.map((task, index) => {
                                  const taskId = task._id?.toString() || "";
                                  const userId =
                                    typeof task.userId === "string"
                                      ? task.userId
                                      : (task.userId as IUser)?._id?.toString() || "";
                                  const userName =
                                    typeof task.userId === "string"
                                      ? "Unknown"
                                      : (task.userId as IUser)?.name || "Unknown";

                                  const projectName =
                                    (task.projectId as { name?: string })?.name || "No project";

                                  const dueDate =
                                    task.dueDate instanceof Date
                                      ? task.dueDate
                                      : task.dueDate
                                      ? new Date(task.dueDate)
                                      : undefined;

                                  return (
                                    <Draggable key={taskId} draggableId={taskId} index={index}>
                                      {(provided) => (
                                        <Box
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          sx={{ mb: 2 }}
                                        >
                                          <Task
                                            key={taskId}
                                            _id={taskId}
                                            userId={userId}
                                            title={task.title}
                                            content={task.content}
                                            status={task.status}
                                            dueDate={dueDate}
                                            userName={userName}
                                            projectName={projectName}
                                            showButtons={isManager}
                                            onEdit={handleEdit}
                                            onDelete={() => handleDelete(taskId)}
                                            onStatusChange={handleStatusChange}
                                          />
                                        </Box>
                                      )}
                                    </Draggable>
                                  );
                                })
                              ) : (
                                <Paper
                                  elevation={0}
                                  sx={{
                                    p: 3,
                                    textAlign: "center",
                                    backgroundColor: "white",
                                    borderRadius: 2,
                                    border: "1px dashed #e0e0e0",
                                  }}
                                >
                                  <Typography variant="body2" color="text.secondary">
                                    {t("noTasksMatch")}
                                  </Typography>
                                </Paper>
                              )}
                            </Box>
                          </Paper>

                          {provided.placeholder}
                        </Box>
                      )}
                    </Droppable>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </DragDropContext>

        {/* Add Task Dialog */}
        <Dialog open={showAddTask} onClose={() => setShowAddTask(false)} maxWidth="md" fullWidth>
          <DialogTitle
            sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
          >
            <Typography component="div" variant="h6" fontWeight={700}>
              {t("addNewTask")}
            </Typography>
            <IconButton onClick={() => setShowAddTask(false)}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent>
            <TaskForm task={newTask} setTask={setNewTask} onSubmit={handleAddTaskSubmit} />
          </DialogContent>
        </Dialog>

        {/* Add Member Dialog */}
        <Dialog open={showAddUser} onClose={() => setShowAddUser(false)} maxWidth="sm" fullWidth>
          <DialogTitle
            sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
          >
            <Typography variant="h6" fontWeight={700}>
              {t("addTeamMember")}
            </Typography>
            <IconButton onClick={() => setShowAddUser(false)}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent>
            <AddMember
              projectId={projectId!}
              onUserAdded={(newUser) => {
                const prevUsers = useAppStore.getState().projectUsers;
                setProjectUsers([...prevUsers, newUser]);
                setShowAddUser(false);
              }}
              onClose={() => setShowAddUser(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Task Dialog */}
        {editingTask && (
          <EditTask
            task={editingTask}
            projectUsers={projectUsers}
            projectId={projectId!}
            onSaved={handleSaved}
            onCancel={() => setEditingTask(null)}
          />
        )}
      </Container>
    </Box>
  );
}
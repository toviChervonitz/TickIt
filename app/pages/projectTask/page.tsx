"use client";
import React, { useEffect, useState } from "react";
import Task from "@/app/components/Task";
import EditTask, { TaskForm as EditTaskForm } from "@/app/components/editTask";
import TaskForm, { TaskFormData } from "@/app/components/AddTaskForm";
import useAppStore from "@/app/store/useAppStore";
import {
  DeleteTask,
  GetTasksByProjectId,
  CreateTask,
} from "@/app/lib/server/taskServer";
import { getUserRoleInProject } from "@/app/lib/server/projectServer";
import { getAllUsersByProjectId } from "@/app/lib/server/userServer";
import AddMember from "@/app/components/AddMember";
import { ITask, IUser } from "@/app/models/types";
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
} from "@mui/material";
import CircleIcon from "@mui/icons-material/Circle";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { useRouter } from "next/navigation";

export default function GetProjectTasks() {
  const { projectId, tasks, setTasks, user, setProjectUsers } = useAppStore();

  const [filteredTasks, setFilteredTasks] = useState<ITask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isManager, setIsManager] = useState(false);
  const [editingTask, setEditingTask] = useState<EditTaskForm | null>(null);
  const [projectUsers, setLocalProjectUsers] = useState<IUser[]>([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);

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
        setError("Failed to load project data");
      } finally {
        setLoading(false);
      }
    };

    loadProjectData();
  }, [projectId, user]);

  // Fetch project users
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
      dueDate: t.dueDate ? new Date(t.dueDate).toISOString().split("T")[0] : "",
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

  const handleStatusChange = (
    id: string,
    newStatus: "todo" | "doing" | "done"
  ) => {
    const updated = tasks.map((t) =>
      t._id?.toString() === id ? { ...t, status: newStatus } : t
    );
    setTasks(updated);
    setFilteredTasks(updated);
  };

  const handleAddTaskSubmit = async () => {
    if (!projectId) return;
    try {
      await CreateTask({ ...newTask, projectId });
      setShowAddTask(false);
      setNewTask({
        title: "",
        content: "",
        userId: "",
        dueDate: "",
        status: "todo",
      });
      // reload tasks
      if (!user) return;
      const updated = await GetTasksByProjectId(user._id, projectId);
      setTasks(updated);
      setFilteredTasks(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const todoTasks = filteredTasks.filter((t) => t.status === "todo");
  const doingTasks = filteredTasks.filter((t) => t.status === "doing");
  const doneTasks = filteredTasks.filter((t) => t.status === "done");

  const columns = [
    {
      title: "To Do",
      tasks: todoTasks,
      color: "#1d486a",
      bgColor: "rgba(29,72,106,0.08)",
    },
    {
      title: "In Progress",
      tasks: doingTasks,
      color: "#66dcd7",
      bgColor: "rgba(102,220,215,0.08)",
    },
    {
      title: "Completed",
      tasks: doneTasks,
      color: "#3dd2cc",
      bgColor: "rgba(61,210,204,0.08)",
    },
  ];

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
    <Box sx={{ minHeight: "100vh", backgroundColor: "#fff", py: 4 }}>
      <Container maxWidth="xl">
        <Box
          sx={{
            mb: 4,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
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
              <ArrowBackIcon />
            </IconButton>

            <Box>
              <Typography variant="h4" fontWeight={800} color="primary.main">
                Project Tasks
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage and track tasks for this project
              </Typography>
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
                Add Task
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
                Add Member
              </Button>
            </Stack>
          )}
        </Box>

        <Grid container spacing={3}>
          {columns.map((column) => (
            <Grid item xs={12} md={4} key={column.title}>
              <Paper
                elevation={0}
                sx={{
                  backgroundColor: column.bgColor,
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
                    <CircleIcon sx={{ fontSize: 12, color: column.color }} />
                    <Typography variant="h6" fontWeight={700}>
                      {column.title}
                    </Typography>
                  </Box>

                  <Chip
                    label={loading ? "…" : column.tasks.length}
                    size="small"
                    sx={{
                      backgroundColor: column.color,
                      color: "white",
                      fontWeight: 600,
                    }}
                  />
                </Box>

                {/* Tasks OR Loading */}
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
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ opacity: 0.6 }}
                      >
                        Loading task…
                      </Typography>
                    </Paper>
                  ) : // 🔵 מצב רגיל – מציג משימות
                  column.tasks.length > 0 ? (
                    column.tasks.map((task) => {
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
                        (task.projectId as { name?: string })?.name ||
                        "No project";
                      const dueDate =
                        task.dueDate instanceof Date
                          ? task.dueDate
                          : task.dueDate
                          ? new Date(task.dueDate)
                          : undefined;

                      return (
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
                      );
                    })
                  ) : (
                    // אין משימות
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
                        No tasks in this stage
                      </Typography>
                    </Paper>
                  )}
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Add Task Dialog */}
      <Dialog
        open={showAddTask}
        onClose={() => setShowAddTask(false)}
        maxWidth="md"
        fullWidth
        container={typeof document !== "undefined" ? document.body : undefined} // ensures top-level portal
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography component="div" variant="h6" fontWeight={700}>
            Add New Task
          </Typography>
          <IconButton onClick={() => setShowAddTask(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <TaskForm
            task={newTask}
            setTask={setNewTask}
            onSubmit={handleAddTaskSubmit}
          />
        </DialogContent>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog
        open={showAddUser}
        onClose={() => setShowAddUser(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" fontWeight={700}>
            Add Team Member
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
    </Box>
  );
}

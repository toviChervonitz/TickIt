"use client";

import React, { useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";

import { CreateProject } from "@/app/lib/server/projectServer";
import { AddManagerToProject } from "@/app/lib/server/userServer";
import { CreateTask } from "@/app/lib/server/taskServer";

import useAppStore from "@/app/store/useAppStore";
import TaskForm, { TaskFormData } from "@/app/components/AddTaskForm";
import AddMember from "@/app/components/AddMember";
import GenerateTasks from "@/app/components/generatedTasks";

import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Stack,
  List,
  ListItem,
  ListItemText,
  Chip,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import FolderIcon from "@mui/icons-material/Folder";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import CircularProgress from "@mui/material/CircularProgress";


import { getTranslation } from "@/app/lib/i18n";
import { ROUTES } from "@/app/config/routes";

interface ProjectDetails {
  name: string;
  description: string;
}

interface User {
  _id: string;
  email: string;
  name: string;
}

export default function CreateProjectPage() {
  const t = getTranslation();
  const steps = [t("projectDetails"), t("addTeamMembers"), t("createTasks")];

  const router = useRouter();
  const { setProjectId, setProjectUsers, projectUsers, user, language } =
    useAppStore();

  const [step, setStep] = useState(0);
  const [projectDetails, setProjectDetails] = useState<ProjectDetails>({
    name: "",
    description: "",
  });
  const [users, setUsers] = useState<User[]>([]);
  const [projectIdLocal, setProjectIdLocal] = useState("");
  const [tasks, setTasks] = useState<TaskFormData[]>([]);
  const [task, setTask] = useState<TaskFormData>({
    title: "",
    content: "",
    userId: "",
    dueDate: "",
    status: "todo",
  });

  const [openGenerateModal, setOpenGenerateModal] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [aiLoading, setAiLoading] = useState(false);


  /* -------------------- handlers -------------------- */

  const handleProjectChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProjectDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleNextStep1 = async () => {
    try {
      setLoading(true);
      const result = await CreateProject(projectDetails);
      if (!result?.project?._id) throw new Error();

      const newId = result.project._id;
      setProjectIdLocal(newId);
      setProjectId(newId);

      const manager = await AddManagerToProject(user!._id, newId);
      setUsers([manager]);
      setProjectUsers([manager]);

      setStep(1);
    } catch {
      setError(t("failedCreateProject"));
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async () => {
    if (!task.title || !task.userId || !task.dueDate) {
      setError(t("fillAllTaskFields"));
      return;
    }

    try {
      setLoading(true);
      const created = await CreateTask({
        ...task,
        projectId: projectIdLocal,
        managerId: user!._id,
      });

      const realTask = created.task || created;
      setTasks((prev) => [...prev, realTask]);
      setTask({ title: "", content: "", userId: "", dueDate: "", status: "todo" });
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    router.push(ROUTES.DASHBOARD);
  };

  /* -------------------- render -------------------- */

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#fff", py: 6 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box textAlign="center" mb={5}>
          <Typography variant="h3" fontWeight={800} color="primary.main">
            {t("createProject")}
          </Typography>
          <Typography color="text.secondary">
            {t("followProjectSteps")}
          </Typography>
        </Box>

        {/* Stepper */}
        <Card sx={{ mb: 4, p: 4, backgroundColor: "#f9f7f4", border: "1px solid #e8eaed" }}>
          <Stepper activeStep={step} alternativeLabel>
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel
                  StepIconProps={{
                    sx: {
                      "&.Mui-active": {
                        color: "primary.main",
                      },
                      "&.Mui-completed": {
                        color: "secondary.main",
                      },
                    },
                  }}
                >
                  <Typography fontWeight={600}>{label}</Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Card>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        <Card sx={{ p: 5 }}>
          {/* ---------------- STEP 0 ---------------- */}
          {step === 0 && (
            <Box>
              <Stack direction="row" alignItems="center" spacing={2} mb={4}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #1d486a 0%, #122d42 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FolderIcon sx={{ color: "white", fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={700} color="primary.main">
                    {t("projectDetails")}
                  </Typography>
                  <Typography color="text.secondary">
                    {t("enterProjInfo")}
                  </Typography>
                </Box>
              </Stack>

              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label={t("projectName")}
                  name="name"
                  value={projectDetails.name}
                  onChange={handleProjectChange}
                  required
                  placeholder={t("projectNameExample")}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#ffffff",
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label={t("projectDescription")}
                  name="description"
                  value={projectDetails.description}
                  onChange={handleProjectChange}
                  required
                  multiline
                  rows={4}
                  placeholder={t("projectDescriptionExample")}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#ffffff",
                    },
                  }}
                />

                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={language === "en" ? <ArrowForwardIcon /> : <ArrowBackIcon />}
                    onClick={handleNextStep1}
                    disabled={loading || !projectDetails.name || !projectDetails.description}
                    sx={{
                      px: 4,
                      py: 1.5,
                      fontWeight: 700,
                      background: "linear-gradient(to bottom, #1d486a, #163957)",
                      "&:hover": {
                        background: "linear-gradient(to bottom, #163957, #122d42)",
                      },
                    }}
                  >
                    {loading ? t("creating") : t("nextStep")}
                  </Button>
                </Box>
              </Stack>
            </Box>
          )}


          {/* ---------------- STEP 1 ---------------- */}
          {step === 1 && (
            <Box>
              <Stack direction="row" alignItems="center" spacing={2} mb={4}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #1d486a 0%, #122d42 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <GroupAddIcon sx={{ color: "white", fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={700} color="primary.main">
                    {t("addTeamMembers")}
                  </Typography>
                  <Typography color="text.secondary">
                    {t("invitePeople")}
                  </Typography>
                </Box>
              </Stack>

              <Stack spacing={3}>
                {/* AddMember Component */}
                <AddMember
                  projectId={projectIdLocal}
                  onUserAdded={(addedUser) => {
                    const updated = [...users, addedUser];
                    setUsers(updated);
                    setProjectUsers(updated);
                  }}
                  label="Add User"
                />

                {users.length > 0 && (
                  <Paper sx={{ p: 2, backgroundColor: "#ffffff" }}>
                    <Typography variant="subtitle1" fontWeight={600} mb={2}>
                      {t("teamMembers")} ({users.length})
                    </Typography>
                    <List>
                      {users.map((u, idx) => (
                        <ListItem
                          key={u._id}
                          sx={{
                            borderRadius: 2,
                            mb: 1,
                            backgroundColor: "#fafaf9",
                            "&:hover": { backgroundColor: "#f5f5f5" },
                          }}
                        >
                          <ListItemText
                            primary={u.name}
                            secondary={u.email}
                            primaryTypographyProps={{ fontWeight: 600 }}
                          />
                          {idx === 0 && (
                            <Chip
                              label={t("manager")}
                              size="small"
                              color="primary"
                              sx={{ fontWeight: 600 }}
                            />
                          )}
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                )}

                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={language == "en" ? <ArrowForwardIcon /> : <ArrowBackIcon />}
                    onClick={() => setStep(2)}
                    disabled={loading || users.length === 0}
                    sx={{
                      px: 4,
                      py: 1.5,
                      fontWeight: 700,
                      background: "linear-gradient(to bottom, #1d486a, #163957)",
                      "&:hover": {
                        background: "linear-gradient(to bottom, #163957, #122d42)",
                      },
                    }}
                  >
                    {t("nextStep")}
                  </Button>
                </Box>
              </Stack>
            </Box>
          )}

          {/* ---------------- STEP 2 ---------------- */}
          {step === 2 && (
            <Stack spacing={4}>
              {/* Add Task */}
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" mb={2}>
                  {t("addTask")}
                </Typography>
                <TaskForm
                  task={task}
                  setTask={setTask}
                  onSubmit={handleAddTask}
                  variant="page"
                />
              </Paper>

              {/* Tasks List */}
              {tasks.length > 0 && (
                <Paper sx={{ p: 3, backgroundColor: "#ffffff" }}>
                  <Typography variant="subtitle1" fontWeight={600} mb={2}>
                    {t("tasksCreated")} ({tasks.length})
                  </Typography>

                  <List>
                    {tasks.map((taskItem, idx) => {
                      let assignedName = t("unassigned");
                      const userIdRaw = taskItem.userId as any;

                      if (typeof userIdRaw === "string" && userIdRaw) {
                        assignedName =
                          users.find((u) => u._id === userIdRaw)?.name || t("unassigned");
                      } else if (userIdRaw && typeof userIdRaw === "object") {
                        assignedName =
                          userIdRaw.name ||
                          users.find((u) => u._id === userIdRaw._id)?.name ||
                          t("unassigned");
                      }

                      return (
                        <ListItem
                          key={idx}
                          sx={{
                            borderRadius: 2,
                            mb: 1,
                            backgroundColor: "#fafaf9",
                            "&:hover": { backgroundColor: "#f5f5f5" },
                          }}
                        >
                          <ListItemText
                            primary={taskItem.title}
                            secondary={assignedName}
                            primaryTypographyProps={{ fontWeight: 600 }}
                          />
                        </ListItem>
                      );
                    })}
                  </List>
                </Paper>
              )}


              {/* Buttons */}
              <Stack direction="row" justifyContent="space-between">
                <Button
                  variant="contained"
                  onClick={() => {
                    setAiLoading(true);
                    setOpenGenerateModal(true);
                  }}
                >
                  {t("generateTasks")}
                </Button>

                <Button
                  variant="contained"
                  size="large"
                  endIcon={<CheckCircleIcon />}
                  onClick={handleFinish}
                  disabled={loading}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontWeight: 700,
                    background: "linear-gradient(to bottom, #1d486a, #163957)",
                    "&:hover": {
                      background: "linear-gradient(to bottom, #163957, #122d42)",
                    },
                  }}
                >
                  {loading ? t("finishing") : t("finishProject")}
                </Button>
              </Stack>
            </Stack>
          )}
        </Card>
      </Container>

      {/* -------- Generate Tasks Modal -------- */}
      <Dialog
        open={openGenerateModal}
        onClose={() => setOpenGenerateModal(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>{t("generateTasks")}</DialogTitle>
        <DialogContent dividers sx={{ position: "relative", minHeight: 300 }}>
          <GenerateTasks
            autoGenerate
            projectName={projectDetails.name}
            projectDescription={projectDetails.description}
            projectId={projectIdLocal}
            projectUsers={projectUsers}
            onAddTask={async (generatedTask) => {
              const saved = await CreateTask({
                ...generatedTask,
                projectId: projectIdLocal,
                managerId: user!._id,
              });

              const realTask = saved.task || saved;
              setTasks((prev) => [...prev, realTask]);
            }}
            onFinish={() => {
              setAiLoading(false);
            }}
          />

          {/* Overlay Loading */}
          {aiLoading && (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                backgroundColor: "rgba(255,255,255,0.85)",
                zIndex: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <CircularProgress
                size={48}
                thickness={4}
                sx={{ color: "#1d486a" }}
              />
              <Typography color="text.secondary" fontWeight={500}>
                {t("generatingTasks")}...
              </Typography>
            </Box>
          )}

        </DialogContent>


        <DialogActions>
          <Button onClick={() => setOpenGenerateModal(false)}>
            {t("close")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box >
  );
}

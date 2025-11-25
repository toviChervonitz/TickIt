"use client"

import React, { useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { CreateProject } from "@/app/lib/server/projectServer";
import { AddUserToProject, AddManagerToProject } from "@/app/lib/server/userServer";
import { CreateTask } from "@/app/lib/server/taskServer";
import useAppStore from "@/app/store/useAppStore";
import TaskForm, { TaskFormData } from "@/app/components/AddTaskForm";
import {
  Box, Container, Typography, TextField, Button, Card, Stepper, Step, StepLabel, Alert, Stack,
  List, ListItem, ListItemText, Chip, IconButton, Paper,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import FolderIcon from "@mui/icons-material/Folder";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AddMember from "@/app/components/AddMember";
import GenerateTasks from "@/app/components/generatedTasks";

interface ProjectDetails {
  name: string;
  description: string;
}

interface User {
  _id: string;
  email: string;
  name: string;
}

const steps = ["Project Details", "Add Team Members", "Create Tasks"];

export default function CreateProjectPage() {
  const router = useRouter();
  const { setProjectId, setProjectUsers, projectUsers, user } = useAppStore();

  const [step, setStep] = useState<number>(0);
  const [projectDetails, setProjectDetails] = useState<ProjectDetails>({
    name: "",
    description: "",
  });
  const [users, setUsers] = useState<User[]>([]);
  const [projectIdLocal, setProjectIdLocal] = useState<string>("");
  const [tasks, setTasks] = useState<TaskFormData[]>([]);
  const [task, setTask] = useState<TaskFormData>({
    title: "",
    content: "",
    userId: "",
    dueDate: "",
    status: "todo"
  });

  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleNextStep1 = async () => {
    if (loading) return;

    try {
      setLoading(true);
      setError("");

      const result = await CreateProject(projectDetails);
      if (!result?.project?._id) throw new Error("Invalid project ID");

      const newProjectId = result.project._id;
      setProjectIdLocal(newProjectId);
      setProjectId(newProjectId);
      setProjectUsers([]);

      const manager = await AddManagerToProject(user?._id!, newProjectId);
      setProjectUsers([manager]);
      setUsers([manager]);

      setStep(1);
    } catch (err: any) {
      setError(err.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async () => {
    if (!task.title || !task.userId || !task.dueDate) {
      setError("Please fill all fields for the task.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const createdTask = await CreateTask({
        ...task,
        projectId: projectIdLocal,
        managerId: user?._id!,
      });

      const realTask = createdTask.task || createdTask;
      setTasks((prev) => [...prev, realTask]);
      setTask({ title: "", content: "", userId: "", dueDate: "" , status: "todo"});
    } catch (err: any) {
      setError(err.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    alert("Project created successfully!");
    router.push("/pages/dashboard");
  };

  const handleProjectChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProjectDetails((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#ffffff",
        py: 6,
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 5 }}>
          <Typography variant="h3" fontWeight={800} color="primary.main" mb={1}>
            Create New Project
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Follow the steps below to set up your project
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

        {/* Error Alert */}
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3, borderRadius: 2 }}
            onClose={() => setError("")}
          >
            {error}
          </Alert>
        )}

        {/* Step Content */}
        <Card sx={{ p: 5, backgroundColor: "#f9f7f4", border: "1px solid #e8eaed" }}>
          {/* Step 1: Project Details */}
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
                    Project Details
                  </Typography>
                  <Typography color="text.secondary">
                    Enter the basic information about your project
                  </Typography>
                </Box>
              </Stack>

              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Project Name"
                  name="name"
                  value={projectDetails.name}
                  onChange={handleProjectChange}
                  required
                  placeholder="e.g., Website Redesign"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#ffffff",
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label="Project Description"
                  name="description"
                  value={projectDetails.description}
                  onChange={handleProjectChange}
                  required
                  multiline
                  rows={4}
                  placeholder="Describe what this project is about..."
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
                    endIcon={<ArrowForwardIcon />}
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
                    {loading ? "Creating..." : "Next Step"}
                  </Button>
                </Box>
              </Stack>
            </Box>
          )}

          {/* Step 2: Add Users */}
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
                    Add Team Members
                  </Typography>
                  <Typography color="text.secondary">
                    Invite people to collaborate on this project
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
                      Team Members ({users.length})
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
                              label="Manager"
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
                    endIcon={<ArrowForwardIcon />}
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
                    Next Step
                  </Button>
                </Box>
              </Stack>
            </Box>
          )}

          {/* Step 3: Add Tasks */}
{step === 2 && (
  <Box>
    <Box sx={{ display: "flex", gap: 4, mb: 3 }}>
      {/* Left: Manual Task Form */}
      <Box sx={{ flex: 1 }}>
        <Stack spacing={3}>
          <TaskForm task={task} setTask={setTask} onSubmit={handleAddTask} />

          {tasks.length > 0 && (
            <Paper sx={{ p: 2, backgroundColor: "#ffffff" }}>
              <Typography variant="subtitle1" fontWeight={600} mb={2}>
                Tasks Created ({tasks.length})
              </Typography>
              <List>
                {tasks.map((t, idx) => (
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
                      primary={t.title || "(No Title)"}
                      secondary={
                        projectUsers.find((u) => u._id === t.userId)?.email ||
                        "(Unassigned)"
                      }
                      primaryTypographyProps={{ fontWeight: 600 }}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </Stack>
      </Box>

      {/* Right: Generate Tasks */}
      <Box sx={{ flex: 1 }}>
<GenerateTasks
  projectName={projectDetails.name}
  projectDescription={projectDetails.description}
  projectId={projectIdLocal}
  projectUsers={projectUsers}
  onAddTask={async (generatedTask) => {
    const savedTask = await CreateTask({
      ...generatedTask,
      projectId: projectIdLocal,
      managerId: user?._id!,
    });

    const realTask = savedTask.task || savedTask;

    setTasks((prev) => [...prev, realTask]);
  }}
/>
      </Box>
    </Box>

    {/* Finish Button */}
    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
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
        {loading ? "Finishing..." : "Finish Project"}
      </Button>
    </Box>
  </Box>
)}
        </Card>
      </Container>
    </Box>
  );
}
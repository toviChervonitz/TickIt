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
import { getTranslation } from "@/app/lib/i18n";
import { useLanguage } from "@/app/context/LanguageContext";

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
  const { lang } = useLanguage();
  const t = getTranslation();
  const steps = [t("projectDetails"), t("addTeamMembers"), t("createTasks")];

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

      if (result?.status === "error") {
        throw new Error(result.message || "Failed to create project");
      }

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
      setError(err.message || t("failedCreateProject"));
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
      setError("");

      const createdTask = await CreateTask({
        ...task,
        projectId: projectIdLocal,
        managerId: user?._id!,
      });

      const realTask = createdTask.task || createdTask;
      setTasks((prev) => [...prev, realTask]);
      setTask({ title: "", content: "", userId: "", dueDate: "", status: "todo" });
    } catch (err: any) {
      setError(err.message || t("failedCreateTask"));
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
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
            {t("createProject")}
          </Typography>
          <Typography variant="h6" color="text.secondary">
            {t("followProjectSteps")}          </Typography>
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
                    endIcon={lang === "en" ? <ArrowForwardIcon /> : <ArrowBackIcon />}
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
                    endIcon={lang == "en" ? <ArrowForwardIcon /> : <ArrowBackIcon />}
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

          {/* Step 3: Add Tasks */}
          {step === 2 && (
            <Box>
              <Box sx={{ display: "flex", gap: 4, mb: 3 }}>
                {/* Left: Manual Task Form */}
                <Box sx={{ flex: 1 }}>
                  <Stack spacing={3}>
                    <TaskForm task={task} setTask={setTask} onSubmit={handleAddTask} variant="page"/>

                    {tasks.length > 0 && (
                      <Paper sx={{ p: 2, backgroundColor: "#ffffff" }}>
                        <Typography variant="subtitle1" fontWeight={600} mb={2}>
                          {t("tasksCreated")} ({tasks.length})
                        </Typography>
                        <List>
                          {tasks.map((taskItem, idx) => {
                            let assignedName = t("unassigned");
                            const userIdRaw = taskItem.userId as any;
                            if (typeof userIdRaw === "string" && userIdRaw) {
                              assignedName = users.find(u => u._id === userIdRaw)?.name || t("unassigned");
                            } else if (userIdRaw && typeof userIdRaw === "object") {
                              assignedName =
                                userIdRaw.name ||
                                users.find(u => u._id === (userIdRaw._id || userIdRaw.id))?.name ||
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
                                  primary={taskItem.title || "(No Title)"}
                                  secondary={assignedName}
                                  primaryTypographyProps={{ fontWeight: 600 }}
                                />
                              </ListItem>
                            );
                          })}
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
                  {loading ? t("finishing") : t("finishProject")}
                </Button>
              </Box>
            </Box>
          )}
        </Card>
      </Container>
    </Box>
  );
}
// "use client";

// import React, { useState, ChangeEvent, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { CreateProject } from "@/app/lib/server/projectServer";
// import { AddUserToProject, AddManagerToProject } from "@/app/lib/server/userServer";
// import { CreateTask } from "@/app/lib/server/taskServer";
// import useAppStore from "@/app/store/useAppStore";
// import TaskForm, { TaskFormData } from "@/app/components/AddTaskForm";

// import {
//   Box, Container, Typography, TextField, Button, Card, Stepper, Step, StepLabel,
//   Alert, Stack, List, ListItem, ListItemText, Chip, Paper, Dialog,
//   DialogTitle, DialogContent, DialogActions, IconButton
// } from "@mui/material";

// import ArrowBackIcon from "@mui/icons-material/ArrowBack";
// import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
// import CheckCircleIcon from "@mui/icons-material/CheckCircle";
// import FolderIcon from "@mui/icons-material/Folder";
// import GroupAddIcon from "@mui/icons-material/GroupAdd";
// import AssignmentIcon from "@mui/icons-material/Assignment";
// import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
// import CloseIcon from "@mui/icons-material/Close";

// import AddMember from "@/app/components/AddMember";
// import GenerateTasks from "@/app/components/generatedTasks";
// import { getTranslation } from "@/app/lib/i18n";
// import { useLanguage } from "@/app/context/LanguageContext";

// // -------------------------------------------------------

// interface ProjectDetails {
//   name: string;
//   description: string;
// }

// interface User {
//   _id: string;
//   email: string;
//   name: string;
// }

// // -------------------------------------------------------

// export default function CreateProjectPage() {
//   const { lang } = useLanguage();
//   const t = getTranslation();
//   const steps = [t("projectDetails"), t("addTeamMembers"), t("createTasks")];

//   const router = useRouter();
//   const { setProjectId, setProjectUsers, projectUsers, user } = useAppStore();

//   const [step, setStep] = useState(0);
//   const [projectDetails, setProjectDetails] = useState<ProjectDetails>({ name: "", description: "" });
//   const [users, setUsers] = useState<User[]>([]);
//   const [projectIdLocal, setProjectIdLocal] = useState("");
//   const [tasks, setTasks] = useState<TaskFormData[]>([]);
//   const [task, setTask] = useState<TaskFormData>({
//     title: "",
//     content: "",
//     userId: "",
//     dueDate: "",
//     status: "todo",
//   });

//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   // ----------- GENERATION STATES -----------

//   const [showGeneratePopup, setShowGeneratePopup] = useState(false);
//   const [generatedTasks, setGeneratedTasks] = useState<TaskFormData[]>([]);
//   const [isGenerating, setIsGenerating] = useState(false);

//   // פותח פופאפ אוטומטית ברגע שהמשימות חזרו
//   useEffect(() => {
//     if (generatedTasks.length > 0) {
//       setShowGeneratePopup(true);
//       setIsGenerating(false);
//     }
//   }, [generatedTasks]);

//   // -------------------------------------------------------
//   // Step 1 - Create Project
//   // -------------------------------------------------------

//   const handleNextStep1 = async () => {
//     if (loading) return;

//     try {
//       setLoading(true);
//       setError("");

//       const result = await CreateProject(projectDetails);
//       if (!result?.project?._id) throw new Error("Invalid project ID");

//       const newProjectId = result.project._id;
//       setProjectIdLocal(newProjectId);
//       setProjectId(newProjectId);
//       setProjectUsers([]);

//       const manager = await AddManagerToProject(user?._id!, newProjectId);

//       setProjectUsers([manager]);
//       setUsers([manager]);
//       setStep(1);
//     } catch (err: any) {
//       setError(err.message || t("failedCreateProject"));
//     } finally {
//       setLoading(false);
//     }
//   };

//   // -------------------------------------------------------
//   // Step 3 - Add manual task
//   // -------------------------------------------------------

//   const handleAddTask = async () => {
//     if (!task.title || !task.userId || !task.dueDate) {
//       setError(t("fillAllTaskFields"));
//       return;
//     }

//     try {
//       setLoading(true);
//       setError("");

//       const createdTask = await CreateTask({
//         ...task,
//         projectId: projectIdLocal,
//         managerId: user?._id!,
//       });

//       const realTask = createdTask.task || createdTask;
//       setTasks((prev) => [...prev, realTask]);
//       setTask({ title: "", content: "", userId: "", dueDate: "", status: "todo" });
//     } catch (err: any) {
//       setError(err.message || t("failedCreateTask"));
//     } finally {
//       setLoading(false);
//     }
//   };

//   // -------------------------------------------------------
//   // AI Generate
//   // -------------------------------------------------------

//   const handleGenerateTasks = () => {
//     setGeneratedTasks([]);
//     setIsGenerating(true);
//   };

//   const handleAddGeneratedTask = async (generatedTask: TaskFormData) => {
//     try {
//       const savedTask = await CreateTask({
//         ...generatedTask,
//         projectId: projectIdLocal,
//         managerId: user?._id!,
//       });

//       const realTask = savedTask.task || savedTask;
//       setTasks((prev) => [...prev, realTask]);
//     } catch (err: any) {
//       setError(err.message || "Failed to add generated task");
//     }
//   };

//   // -------------------------------------------------------

//   const handleFinish = () => {
//     router.push("/pages/dashboard");
//   };

//   const handleProjectChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target;
//     setProjectDetails((prev) => ({ ...prev, [name]: value }));
//   };

//   // -------------------------------------------------------
//   // RETURN UI
//   // -------------------------------------------------------

//   return (
//     <Box sx={{ minHeight: "100vh", backgroundColor: "#ffffff", py: 6 }}>
//       <Container maxWidth="lg">

//         {/* HEADER */}
//         <Box sx={{ textAlign: "center", mb: 5 }}>
//           <Typography variant="h3" fontWeight={800} color="primary.main">{t("createProject")}</Typography>
//           <Typography variant="h6" color="text.secondary">{t("followProjectSteps")}</Typography>
//         </Box>

//         {/* STEPPER */}
//         <Card sx={{ mb: 4, p: 4, backgroundColor: "#f9f7f4", border: "1px solid #e8eaed" }}>
//           <Stepper activeStep={step} alternativeLabel>
//             {steps.map((label) => (
//               <Step key={label}>
//                 <StepLabel>
//                   <Typography fontWeight={600}>{label}</Typography>
//                 </StepLabel>
//               </Step>
//             ))}
//           </Stepper>
//         </Card>

//         {/* ERROR */}
//         {error && (
//           <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
//             {error}
//           </Alert>
//         )}

//         {/* CARD CONTENT */}
//         <Card sx={{ p: 5, backgroundColor: "#f9f7f4", border: "1px solid #e8eaed" }}>

//           {/* ---------- STEP 1 ---------- */}
//           {step === 0 && (
//             <Box>
//               <Stack direction="row" alignItems="center" spacing={2} mb={4}>
//                 <Box sx={{
//                   width: 56, height: 56, borderRadius: "50%",
//                   background: "linear-gradient(135deg, #1d486a, #122d42)",
//                   display: "flex", alignItems: "center", justifyContent: "center"
//                 }}>
//                   <FolderIcon sx={{ color: "white", fontSize: 28 }} />
//                 </Box>

//                 <Box>
//                   <Typography variant="h5" fontWeight={700}>{t("projectDetails")}</Typography>
//                   <Typography color="text.secondary">{t("enterProjInfo")}</Typography>
//                 </Box>
//               </Stack>

//               <Stack spacing={3}>
//                 <TextField
//                   fullWidth
//                   label={t("projectName")}
//                   name="name"
//                   value={projectDetails.name}
//                   onChange={handleProjectChange}
//                   required
//                 />

//                 <TextField
//                   fullWidth
//                   label={t("projectDescription")}
//                   name="description"
//                   value={projectDetails.description}
//                   onChange={handleProjectChange}
//                   required
//                   multiline
//                   rows={4}
//                 />

//                 <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
//                   <Button
//                     variant="contained"
//                     size="large"
//                     endIcon={lang === "en" ? <ArrowForwardIcon /> : <ArrowBackIcon />}
//                     onClick={handleNextStep1}
//                     disabled={!projectDetails.name || !projectDetails.description || loading}
//                   >
//                     {t("nextStep")}
//                   </Button>
//                 </Box>
//               </Stack>
//             </Box>
//           )}

//           {/* ---------- STEP 2 ---------- */}
//           {step === 1 && (
//             <Box>
//               <Stack direction="row" alignItems="center" spacing={2} mb={4}>
//                 <Box sx={{
//                   width: 56, height: 56, borderRadius: "50%",
//                   background: "linear-gradient(135deg, #1d486a, #122d42)",
//                   display: "flex", alignItems: "center", justifyContent: "center"
//                 }}>
//                   <GroupAddIcon sx={{ color: "white", fontSize: 28 }} />
//                 </Box>

//                 <Box>
//                   <Typography variant="h5" fontWeight={700}>{t("addTeamMembers")}</Typography>
//                   <Typography color="text.secondary">{t("invitePeople")}</Typography>
//                 </Box>
//               </Stack>

//               <Stack spacing={3}>

//                 <AddMember
//                   projectId={projectIdLocal}
//                   onUserAdded={(addedUser) => {
//                     const updated = [...users, addedUser];
//                     setUsers(updated);
//                     setProjectUsers(updated);
//                   }}
//                   label="Add User"
//                 />

//                 {users.length > 0 && (
//                   <Paper sx={{ p: 2 }}>
//                     <Typography variant="subtitle1" fontWeight={600} mb={2}>
//                       {t("teamMembers")} ({users.length})
//                     </Typography>

//                     <List>
//                       {users.map((u, idx) => (
//                         <ListItem key={u._id} sx={{ borderRadius: 2, mb: 1, backgroundColor: "#fafafa" }}>
//                           <ListItemText primary={u.name} secondary={u.email} />
//                           {idx === 0 && <Chip label={t("manager")} color="primary" />}
//                         </ListItem>
//                       ))}
//                     </List>
//                   </Paper>
//                 )}

//                 <Box sx={{ textAlign: "right" }}>
//                   <Button
//                     variant="contained"
//                     size="large"
//                     endIcon={lang === "en" ? <ArrowForwardIcon /> : <ArrowBackIcon />}
//                     onClick={() => setStep(2)}
//                     disabled={users.length === 0}
//                   >
//                     {t("nextStep")}
//                   </Button>
//                 </Box>
//               </Stack>

//             </Box>
//           )}

//           {/* ---------- STEP 3 ---------- */}
//           {step === 2 && (
//             <Box>
//               <Stack direction="row" alignItems="center" spacing={2} mb={4}>
//                 <Box sx={{
//                   width: 56, height: 56, borderRadius: "50%",
//                   background: "linear-gradient(135deg, #1d486a, #122d42)",
//                   display: "flex", alignItems: "center", justifyContent: "center"
//                 }}>
//                   <AssignmentIcon sx={{ color: "white", fontSize: 28 }} />
//                 </Box>

//                 <Box>
//                   <Typography variant="h5" fontWeight={700}>{t("createTasks")}</Typography>
//                   <Typography color="text.secondary">Add tasks to your project</Typography>
//                 </Box>
//               </Stack>

//               <Stack spacing={3}>
//                 <TaskForm task={task} setTask={setTask} onSubmit={handleAddTask} />

//                 {tasks.length > 0 && (
//                   <Paper sx={{ p: 2 }}>
//                     <Typography variant="subtitle1" fontWeight={600}>
//                       {t("tasksCreated")} ({tasks.length})
//                     </Typography>

//                     <List sx={{ maxHeight: 300, overflowY: "auto" }}>
//                       {tasks.map((t, i) => (
//                         <ListItem key={i} sx={{ backgroundColor: "#fafafa", mb: 1, borderRadius: 2 }}>
//                           <ListItemText primary={t.title} />
//                         </ListItem>
//                       ))}
//                     </List>
//                   </Paper>
//                 )}

//                 <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
//                   <Button
//                     variant="outlined"
//                     startIcon={<AutoAwesomeIcon />}
//                     onClick={handleGenerateTasks}
//                   >
//                     {isGenerating ? "Generating…" : "Generate Tasks"}
//                   </Button>

//                   <Button
//                     variant="contained"
//                     endIcon={<CheckCircleIcon />}
//                     onClick={handleFinish}
//                   >
//                     {t("finishProject")}
//                   </Button>
//                 </Box>
//               </Stack>
//             </Box>
//           )}
//         </Card>
//       </Container>

//       {/* ------------ POPUP ------------ */}
//       <Dialog
//         open={showGeneratePopup}
//         onClose={() => setShowGeneratePopup(false)}
//         maxWidth="md"
//         fullWidth
//         PaperProps={{
//           sx: {
//             borderRadius: 3,
//             maxHeight: "80vh",
//             display: "flex",
//             flexDirection: "column",
//           },
//         }}
//       >
//         <DialogTitle
//           sx={{
//             display: "flex", justifyContent: "space-between", alignItems: "center",
//             backgroundColor: "#f9f7f4", borderBottom: "2px solid #e8eaed"
//           }}
//         >
//           <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
//             <AutoAwesomeIcon sx={{ color: "primary.main", fontSize: 28 }} />
//             <Typography variant="h5" fontWeight={700}>AI Generated Tasks</Typography>
//           </Box>

//           <IconButton onClick={() => setShowGeneratePopup(false)}>
//             <CloseIcon />
//           </IconButton>
//         </DialogTitle>

//         <DialogContent
//           sx={{
//             p: 3,
//             overflowY: "auto",
//             flex: 1,
//             "&::-webkit-scrollbar": { width: 8 },
//             "&::-webkit-scrollbar-thumb": { backgroundColor: "#1d486a", borderRadius: 4 },
//           }}
//         >
//           {generatedTasks.length === 0 ? (
//             <Typography textAlign="center" color="text.secondary">Generating tasks…</Typography>
//           ) : (
//             <List>
//               {generatedTasks.map((taskItem, idx) => (
//                 <ListItem
//                   key={idx}
//                   sx={{
//                     borderRadius: 2,
//                     mb: 2,
//                     backgroundColor: "#fafafa",
//                     border: "1px solid #e8eaed",
//                     flexDirection: "column",
//                     alignItems: "flex-start",
//                     p: 2,
//                   }}
//                 >
//                   <Typography variant="h6" fontWeight={600} color="primary.main">
//                     {taskItem.title}
//                   </Typography>

//                   {taskItem.content && (
//                     <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
//                       {taskItem.content}
//                     </Typography>
//                   )}

//                   <Button
//                     size="small"
//                     variant="contained"
//                     onClick={() => handleAddGeneratedTask(taskItem)}
//                     sx={{
//                       mt: 1,
//                       fontWeight: 600,
//                       background: "linear-gradient(to bottom, #1d486a, #163957)",
//                       "&:hover": {
//                         background: "linear-gradient(to bottom, #163957, #122d42)",
//                       },
//                     }}
//                   >
//                     Add to Project
//                   </Button>
//                 </ListItem>
//               ))}
//             </List>
//           )}
//         </DialogContent>

//         <DialogActions sx={{ backgroundColor: "#f9f7f4", borderTop: "1px solid #e8eaed" }}>
//           <Button
//             onClick={() => setShowGeneratePopup(false)}
//             variant="contained"
//             sx={{
//               px: 3,
//               py: 1,
//               fontWeight: 600,
//               background: "linear-gradient(to bottom, #1d486a, #163957)",
//               "&:hover": {
//                 background: "linear-gradient(to bottom, #163957, #122d42)",
//               },
//             }}
//           >
//             Close
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Hidden component that performs the API call */}
//       {isGenerating && (
//         <Box sx={{ display: "none" }}>
//           <GenerateTasks
//             projectName={projectDetails.name}
//             projectDescription={projectDetails.description}
//             projectId={projectIdLocal}
//             projectUsers={projectUsers}
//             onAddTask={(generatedTask) =>
//               setGeneratedTasks((prev) => [...prev, generatedTask])
//             }
//           />
//         </Box>
//       )}
//     </Box>
//   );
// }

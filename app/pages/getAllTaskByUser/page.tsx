// "use client";

// import React, { useEffect, useState } from "react";
// import useAppStore from "@/app/store/useAppStore";
// import { GetTasksByUserId } from "@/app/lib/server/taskServer";
// import { ITask, IUser, IProject } from "@/app/models/types";
// import Task from "@/app/components/Task";

// export default function UserTasks() {
//   const { user, tasks, setTasks } = useAppStore();
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     async function loadTasks() {
//       if (!user?._id) return;

//       try {
//         const data = await GetTasksByUserId(user._id);
//         setTasks(data);
//       } catch (err: any) {
//         console.error(err);
//         setError("Failed to fetch tasks");
//       } finally {
//         setLoading(false);
//       }
//     }

//     loadTasks();
//   }, [user?._id]);

//   const handleStatusChange = (
//     id: string,
//     newStatus: "todo" | "doing" | "done"
//   ) => {
//     const updated = tasks.map((t) =>
//       t._id === id ? { ...t, status: newStatus } : t
//     );
//     setTasks(updated);
//   };

//   if (loading) return <p>Loading tasks...</p>;
//   if (error) return <p style={{ color: "red" }}>{error}</p>;

//   return (
//     <div className="tasks-container">
//       <h2>My Tasks</h2>

//       {tasks.length ? (
//         tasks.map((task) => {
//           const typedUser = task.userId as IUser | undefined;
//           const typedProject = task.projectId as IProject | undefined;

//           return (
// <Task
//   key={task._id!}
//   _id={task._id!}
//   userId={typedUser?._id || ""}
//   title={task.title}
//   content={task.content}
//   status={task.status}
//   dueDate={task.dueDate ? new Date(task.dueDate) : undefined}
//   userName={typedUser?.name || "Unknown"}
//   projectName={typedProject?.name || "No project"}
//   onStatusChange={handleStatusChange}
//   showButtons={false} // never show buttons for regular users
// />

//           );
//         })
//       ) : (
//         <p>No tasks found.</p>
//       )}
//     </div>
//   );
// }
"use client";

import React, { useEffect, useState } from "react";
import useAppStore from "@/app/store/useAppStore";
import { GetTasksByUserId } from "@/app/lib/server/taskServer";
import { ITask, IUser, IProject } from "@/app/models/types";
import Task from "@/app/components/Task";
import { Box, Container, Typography, GridLegacy as Grid, Paper, Chip } from "@mui/material";
import CircleIcon from "@mui/icons-material/Circle";

export default function UserTasks() {
  const { user, tasks, setTasks } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTasks() {
      if (!user?._id) return;

      try {
        const data = await GetTasksByUserId(user._id);
        setTasks(data);
      } catch (err: any) {
        console.error(err);
        setError("Failed to fetch tasks");
      } finally {
        setLoading(false);
      }
    }

    loadTasks();
  }, [user?._id]);

  const handleStatusChange = (
    id: string,
    newStatus: "todo" | "doing" | "done"
  ) => {
    const updated = tasks.map((t) =>
      t._id === id ? { ...t, status: newStatus } : t
    );
    setTasks(updated);
  };

  const todoTasks = tasks.filter((t) => t.status === "todo");
  const doingTasks = tasks.filter((t) => t.status === "doing");
  const doneTasks = tasks.filter((t) => t.status === "done");

  const columns = [
    { title: "To Do", tasks: todoTasks, color: "#1d486a", bgColor: "rgba(29,72,106,0.08)" },
    { title: "In Progress", tasks: doingTasks, color: "#66dcd7", bgColor: "rgba(102,220,215,0.08)" },
    { title: "Completed", tasks: doneTasks, color: "#3dd2cc", bgColor: "rgba(61,210,204,0.08)" },
  ];

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <Typography variant="h6" color="text.secondary">Loading tasks...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <Typography variant="h6" color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#ffffff", py: 4 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={800} color="primary.main" mb={1}>
            My Tasks
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and track your tasks across different stages
          </Typography>
        </Box>

        {/* Kanban Board */}
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
                <Box sx={{ mb: 3, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CircleIcon sx={{ fontSize: 12, color: column.color }} />
                    <Typography variant="h6" fontWeight={700} color="text.primary">
                      {column.title}
                    </Typography>
                  </Box>
                  <Chip
                    label={column.tasks.length}
                    size="small"
                    sx={{
                      backgroundColor: column.color,
                      color: "white",
                      fontWeight: 600,
                    }}
                  />
                </Box>

                {/* Tasks */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {column.tasks.length > 0 ? (
                    column.tasks.map((task) => {
                      const typedUser = task.userId as IUser | undefined;
                      const typedProject = task.projectId as IProject | undefined;

                      return (
                        <Task
                          key={task._id!}
                          _id={task._id!}
                          userId={typedUser?._id || ""}
                          title={task.title}
                          content={task.content}
                          status={task.status}
                          dueDate={task.dueDate ? new Date(task.dueDate) : undefined}
                          userName={typedUser?.name || "Unknown"}
                          projectName={typedProject?.name || "No project"}
                          onStatusChange={handleStatusChange}
                          showButtons={false}
                        />
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
    </Box>
  );
}
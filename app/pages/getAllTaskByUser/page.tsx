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
} from "@mui/material";
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
    };
  }

  const todoTasks = tasks.filter((t) => t.status === "todo");
  const doingTasks = tasks.filter((t) => t.status === "doing");
  const doneTasks = tasks.filter((t) => t.status === "done");

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
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={800} color="primary.main" mb={1}>
            My Tasks
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and track your tasks across different stages
          </Typography>
        </Box>

        {/* Drag & Drop */}
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

            const newStatus =
              destination.droppableId as "todo" | "doing" | "done";

            handleStatusChange(draggableId, newStatus, user?._id!);
          }}
        >
          <Grid container spacing={3}>
            {[
              { id: "todo", title: "To Do", tasks: todoTasks },
              { id: "doing", title: "In Progress", tasks: doingTasks },
              { id: "done", title: "Completed", tasks: doneTasks },
            ].map((col) => (
              <Grid item xs={12} md={4} key={col.id}>
                <Droppable droppableId={col.id}>
                  {(provided) => (
                    <Paper
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      elevation={0}
                      sx={{
                        backgroundColor: "white",
                        borderRadius: 3,
                        p: 2,
                        minHeight: "70vh",
                        border: "1px solid #e8eaed",
                      }}
                    >
                      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                        {col.title}
                      </Typography>

                      {col.tasks.map((task, index) => {
                        const typedUser = task.userId as IUser | undefined;
                        const typedProject =
                          task.projectId as IProject | undefined;

                        return (
                          <Draggable
                            key={task._id}
                            draggableId={task._id!}
                            index={index}
                          >
                            {(provided) => (
                              <Box
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                sx={{ mb: 2 }}
                              >
                                <Task
                                  key={task._id!}
                                  _id={task._id!}
                                  userId={typedUser?._id || ""}
                                  title={task.title}
                                  content={task.content}
                                  status={task.status}
                                  dueDate={
                                    task.dueDate
                                      ? new Date(task.dueDate)
                                      : undefined
                                  }
                                  userName={typedUser?.name || "Unknown"}
                                  projectName={
                                    typedProject?.name || "No project"
                                  }
                                  onStatusChange={handleStatusChange}
                                  showButtons={false}
                                />
                              </Box>
                            )}
                          </Draggable>
                        );
                      })}

                      {provided.placeholder}
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

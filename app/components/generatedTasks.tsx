
"use client";

import React, { useState } from "react";
import useAppStore from "@/app/store/useAppStore";
import { TaskFormData } from "./AddTaskForm";
import { handleGenerateContent } from "../lib/server/agentServer";
import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { getTranslation } from "../lib/i18n";

interface GeneratedTask {
  title: string;
  content: string;
  userId?: string;
  dueDate?: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
}

interface GenerateTasksProps {
  projectName: string;
  projectDescription: string;
  projectId: string;
  projectUsers: User[];
  onAddTask: (task: TaskFormData) => void; // callback when user adds a task
}

export default function GenerateTasks({
  projectName,
  projectDescription,
  projectId,
  projectUsers,
  onAddTask,
}: GenerateTasksProps) {
  const t = getTranslation();

  const [generatedTasks, setGeneratedTasks] = useState<GeneratedTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [taskEdits, setTaskEdits] = useState<GeneratedTask | null>(null);

  const handleGenerate = async () => {
    if (!projectDescription.trim()) return;
    setLoading(true);

    const result = await handleGenerateContent(
      `Name: ${projectName}. Description: ${projectDescription}`,
      projectId
    );

    if (Array.isArray(result)) {
      const tasksWithDefaults = result.map((t: any) => ({
        ...t,
        userId: "",
        dueDate: t.dueDate || new Date().toISOString().split("T")[0], // keep AI date
      }));
      setGeneratedTasks(tasksWithDefaults);
    }

    setLoading(false);
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setTaskEdits({ ...generatedTasks[index] });
  };

  const saveEdit = () => {
    if (editingIndex === null || !taskEdits) return;
    const updatedTasks = [...generatedTasks];
    updatedTasks[editingIndex] = taskEdits;
    setGeneratedTasks(updatedTasks);
    setEditingIndex(null);
    setTaskEdits(null);
  };

  const handleChange = (index: number, field: keyof GeneratedTask, value: any) => {
    const updatedTasks = [...generatedTasks];
    updatedTasks[index] = { ...updatedTasks[index], [field]: value };
    setGeneratedTasks(updatedTasks);
    if (editingIndex === index) setTaskEdits(updatedTasks[index]);
  };

  const handleAdd = (task: GeneratedTask) => {
    const newTask: TaskFormData = {
      title: task.title,
      content: task.content,
      userId: task.userId || "",
      dueDate: task.dueDate || new Date().toISOString().split("T")[0],
      status: "todo",
    };
    onAddTask(newTask);
    setGeneratedTasks((prev) => prev.filter((t) => t !== task));
  };

  const handleReject = (task: GeneratedTask) => {
    setGeneratedTasks((prev) => prev.filter((t) => t !== task));
  };

  return (
    <Box>
      {generatedTasks.length === 0 && (
        <Button
          variant="contained"
          onClick={handleGenerate}
          disabled={loading}
          sx={{ mb: 2 }}
        >
          {loading ? t("generating") : t("generateTasks")}
        </Button>
      )}

      <Stack spacing={2}>
        {generatedTasks.map((task, index) => (
          <Paper key={index} sx={{ p: 2 }}>
            {editingIndex === index && taskEdits ? (
              <Stack spacing={2}>
                <TextField
                  label="Title"
                  value={taskEdits.title}
                  onChange={(e) => setTaskEdits({ ...taskEdits, title: e.target.value })}
                  fullWidth
                />
                <TextField
                  label="Content"
                  value={taskEdits.content}
                  onChange={(e) => setTaskEdits({ ...taskEdits, content: e.target.value })}
                  multiline
                  rows={4}
                  fullWidth
                />
                <FormControl fullWidth>
                  <InputLabel id={`assign-user-label-${index}`}>Assign User</InputLabel>
                  <Select
                    labelId={`assign-user-label-${index}`}
                    value={taskEdits.userId || ""}
                    label={t("assignTo")}
                    onChange={(e) => setTaskEdits({ ...taskEdits, userId: e.target.value })}
                  >
                    {projectUsers.map((user) => (
                      <MenuItem key={user._id} value={user._id}>
                        {user.name} ({user.email})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  type="date"
                  label={t("dueDate")}
                  value={taskEdits.dueDate}
                  onChange={(e) => setTaskEdits({ ...taskEdits, dueDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
                <Stack direction="row" spacing={2}>
                  <Button variant="contained" onClick={saveEdit}>
                    {t("save")}
                  </Button>
                  <Button variant="outlined" onClick={() => setEditingIndex(null)}>
                    {t("cancel")}
                  </Button>
                </Stack>
              </Stack>
            ) : (
              <Stack spacing={2}>
                <Typography variant="h6">{task.title}</Typography>
                <Typography sx={{ whiteSpace: "pre-wrap" }}>{task.content}</Typography>

                <FormControl fullWidth>
                  <InputLabel id={`assign-user-label-${index}`}>Assign User</InputLabel>
                  <Select
                    labelId={`assign-user-label-${index}`}
                    value={task.userId || ""}
                    label="Assign User"
                    onChange={(e) => handleChange(index, "userId", e.target.value)}
                  >
                    {projectUsers.map((user) => (
                      <MenuItem key={user._id} value={user._id}>
                        {user.name} ({user.email})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  type="date"
                  label={t("dueDate")}
                  value={task.dueDate}
                  onChange={(e) => handleChange(index, "dueDate", e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />

                <Stack direction="row" spacing={2}>
                  <Button variant="contained" onClick={() => handleAdd(task)}>
                    {t("add")}
                  </Button>
                  <Button variant="outlined" color="error" onClick={() => handleReject(task)}>
                    {t("reject")}
                  </Button>
                  <Button variant="outlined" onClick={() => startEditing(index)}>
                    {t("edit")}
                  </Button>
                </Stack>
              </Stack>
            )}
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}

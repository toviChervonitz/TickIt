"use client";

import React, { ChangeEvent, FormEvent, useState } from "react";
import useAppStore from "@/app/store/useAppStore";
import { getTranslation } from "../lib/i18n";

import {
  TextField,
  Button,
  Stack,
  MenuItem,
  Box,
  Paper,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from "@mui/material";

export interface TaskFormData {
  title: string;
  content: string;
  userId: string;
  dueDate: string;
  status: "todo" | "doing" | "done";
}

interface TaskFormProps {
  task: TaskFormData;
  setTask: (t: TaskFormData) => void;
  onSubmit: () => Promise<void>; // חשוב! שיהיה async כדי שנוכל לחכות
  variant?: "popup" | "page";
}

export default function TaskForm({
  task,
  setTask,
  onSubmit,
  variant = "popup",
}: TaskFormProps) {
  const { projectUsers } = useAppStore();
  const t = getTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setTask({ ...task, [name]: value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit(); // שולח למסד נתונים
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper
      elevation={variant === "popup" ? 0 : 1}
      sx={{
        p: variant === "popup" ? 1 : 3,
        bgcolor: "transparent",
        boxShadow: "none",
        width: "100%",
      }}
    >
      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={variant === "popup" ? 2 : 3}>
          {/* Title */}
          <TextField
            fullWidth
            label={t("taskTitle")}
            name="title"
            value={task.title}
            onChange={handleChange}
            size="small"
            required
          />

          {/* Content */}
          <TextField
            fullWidth
            label={t("taskContent")}
            name="content"
            value={task.content}
            onChange={handleChange}
            size="small"
            multiline
            rows={variant === "popup" ? 3 : 4}
          />

          {/* Row */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="space-between"
          >
            <TextField
              select
              label={t("assignTo")}
              name="userId"
              fullWidth
              size="small"
              value={task.userId}
              onChange={handleChange}
              required
            >
              <MenuItem value="">-- {t("assignTo")} --</MenuItem>
              {projectUsers?.map((user) => (
                <MenuItem key={user._id} value={user._id}>
                  {user.email}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              type="date"
              label={t("dueDate")}
              name="dueDate"
              fullWidth
              size="small"
              value={task.dueDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Stack>

          {/* Submit Button */}
          <Box sx={{ width: "100%", mt: 1 }}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                textTransform: "none",
                py: 1.3,
                background:
                  variant === "popup"
                    ? "linear-gradient(to bottom, #3dd2cc, #2dbfb9)"
                    : "#1B4A71",
                "&:hover": {
                  background:
                    variant === "popup"
                      ? "linear-gradient(to bottom, #2dbfb9, #1fa9a3)"
                      : "#163B5A",
                },
              }}
            >
              {loading ? (
                <CircularProgress size={22} sx={{ color: "white" }} />
              ) : (
                t("addTask")
              )}
            </Button>
          </Box>
        </Stack>
      </Box>
    </Paper>
  );
}

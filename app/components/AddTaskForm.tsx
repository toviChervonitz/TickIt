"use client";

import React, { ChangeEvent, FormEvent, useState } from "react";
import useAppStore from "@/app/store/useAppStore";
import { getTranslation } from "../lib/i18n";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { he, enUS } from "date-fns/locale";
import { InputAdornment } from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

import {
  TextField,
  Button,
  Stack,
  MenuItem,
  Box,
  Paper,
  CircularProgress,
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
  onSubmit: () => Promise<void>; 
  variant?: "popup" | "page";
}

export default function TaskForm({
  task,
  setTask,
  onSubmit,
  variant = "popup",
}: TaskFormProps) {
  const { projectUsers, language } = useAppStore();
  const t = getTranslation();

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
      await onSubmit();
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
          <TextField
            fullWidth
            label={t("taskTitle")}
            name="title"
            value={task.title}
            onChange={handleChange}
            size="small"
            required
          />

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
              SelectProps={{
                MenuProps: {
                  PaperProps: {
                    style: {
                      direction: language === "he" ? "rtl" : "ltr",
                    },
                  },
                },
              }}
            >
              <MenuItem value="">-- {t("selectUser")} --</MenuItem>
              {projectUsers?.map((user) => (
                <MenuItem key={user._id} value={user._id}>
                  {user.email}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label={t("dueDate")}
              type="date"
              name="dueDate"
              value={task.dueDate}
              required
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
              sx={{
                direction: language == "he" ? "rtl" : "ltr",
                "& input": {
                  textAlign: language == "he" ? "right" : "left",
                },
              }}
              InputProps={{
                endAdornment:
                  language == "he" ? (
                    <Box sx={{ order: -1, mr: 1 }}>
                    </Box>
                  ) : undefined,
              }}
            />
          </Stack>

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

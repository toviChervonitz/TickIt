"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import useAppStore from "@/app/store/useAppStore";
import { getTranslation } from "../lib/i18n";
import {
  TextField,
  Button,
  Stack,
  MenuItem,
  Box,
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
    <Box component="form" onSubmit={handleSubmit}>
      <Box
        sx={{
          backgroundColor: variant === "page" ? "#fff" : "transparent",
          borderRadius: variant === "page" ? 2 : 0,
          px: variant === "page" ? 2 : 0,
          py: variant === "page" ? 2 : 0,
        }}
      >
        <Stack spacing={variant === "popup" ? 2 : 3}>
          {variant === "page" ? (
            <Stack direction="row" spacing={3}>
              <TextField
                label={t("taskTitle")}
                name="title"
                value={task.title}
                onChange={handleChange}
                size="small"
                required
                sx={{ flex: 1 }}
              />

              <TextField
                label={t("taskContent")}
                name="content"
                value={task.content}
                onChange={handleChange}
                size="small"
                sx={{ flex: 1 }}
              />
            </Stack>
          ) : (
            <>
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
                rows={3}
              />
            </>
          )}

          <Stack
            direction={variant === "page" ? "row" : { xs: "column", sm: "row" }}
            spacing={3}
          >
            <TextField
              select
              label={t("assignTo")}
              name="userId"
              value={task.userId}
              onChange={handleChange}
              size="small"
              required
              sx={{ flex: 1 }}
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
              onChange={handleChange}
              size="small"
              required
              InputLabelProps={{ shrink: true }}
              sx={{
                flex: 1,
                direction: language === "he" ? "rtl" : "ltr",
                "& input": {
                  textAlign: language === "he" ? "right" : "left",
                },
              }}
            />
          </Stack>

          <Box sx={{ mt: 2 ,width: '100%'}}>
            <Button
              variant="contained"
              size="small"
              onClick={handleSubmit}
              disabled={loading}
              fullWidth
              sx={{
                textTransform: "none",
                background: "linear-gradient(to bottom, #3dd2cc, #2dbfb9)",
                "&:hover": {
                  background: "linear-gradient(to bottom, #2dbfb9, #1fa9a3)",
                },
              }}
            >
              {loading ? (
                <CircularProgress size={18} sx={{ color: "#fff" }} />
              ) : (
                t("addTask")
              )}
            </Button>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}



"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Box,
  CircularProgress,
} from "@mui/material";
import { IUser } from "@/app/models/types";
import { UpdateTask } from "@/app/lib/server/taskServer";
import { getTranslation } from "../lib/i18n";
import useAppStore from "../store/useAppStore";

export interface TaskForm {
  _id: string;
  title: string;
  content: string;
  userId: string;
  dueDate: string;
}

interface EditTaskProps {
  task: TaskForm;
  projectUsers: IUser[];
  projectId: string;
  onSaved: () => void;
  onCancel: () => void;
  dir: string;
}

export default function EditTask({
  task: initialTask,
  projectUsers,
  projectId,
  onSaved,
  onCancel,
  dir,
}: EditTaskProps) {
  const [task, setTask] = useState<TaskForm>(initialTask);
  const [loading, setLoading] = useState(false);
  const t = getTranslation();
  const { language } = useAppStore();
  const isHebrew = language === "he";
  useEffect(() => {
    setTask(initialTask);
  }, [initialTask]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setTask((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!task._id) return;

    try {
      setLoading(true);
      await UpdateTask(task._id, {
        content: task.content,
        userId: task.userId,
        dueDate: task.dueDate,
        projectId,
      });
      onSaved();
    } catch (err) {
      console.error("Error updating task:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={true}
      onClose={onCancel}
      fullWidth
      maxWidth="sm"
      dir={dir}
      disableScrollLock 
      PaperProps={{
        sx: {
          borderRadius: "20px",
          p: 1,
          backgroundColor: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(8px)",
        },
      }}
      BackdropProps={{
        sx: {
          backgroundColor: "rgba(0,0,0,0.35)",
          backdropFilter: "blur(2px)",
        },
      }}
    >
      <DialogTitle
        sx={{ fontWeight: 700, color: "primary.main", textAlign: "left" }}
      >
        {t("editTask")}
      </DialogTitle>

      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

        <TextField
          label={t("title")}
          value={task.title}
          disabled
          fullWidth
          sx={{ bgcolor: "#f3f3f3", borderRadius: 2 }}
        />

        <TextField
          label={t("content")}
          name="content"
          value={task.content}
          onChange={handleChange}
          multiline
          rows={3}
          fullWidth
        />

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
                  direction: isHebrew ? "rtl" : "ltr",
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
          InputLabelProps={{ shrink: true }}
          fullWidth
          sx={{
            direction: isHebrew ? "rtl" : "ltr",
            "& input": {
              textAlign: isHebrew ? "right" : "left",
            },
          }}
          InputProps={{
            endAdornment: isHebrew ? (
              <Box sx={{ order: -1, mr: 1 }}></Box>
            ) : undefined,
          }}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          variant="outlined"
          onClick={onCancel}
          sx={{
            borderRadius: "12px",
            textTransform: "none",
            fontWeight: 600,
            color: "secondary.main",
            borderColor: "secondary.main",
          }}
        >
          {t("cancel")}
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          sx={{
            borderRadius: "12px",
            textTransform: "none",
            fontWeight: 600,
            backgroundColor: "secondary.main",
            "&:hover": {
              background: "linear-gradient(to bottom, #2dbfb9, #1fa9a3)",
            },
          }}
        >
          {loading ? <CircularProgress size={22} sx={{ color: "white" }} /> : t("saveChanges")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

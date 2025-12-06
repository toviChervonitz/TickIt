"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  IconButton
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";

import { ITask, IUser, IProject } from "@/app/models/types";

interface ShowTaskProps {
  open: boolean;
  onClose: () => void;
  task: ITask | null;
}

const ShowTask: React.FC<ShowTaskProps> = ({ open, onClose, task }) => {
  if (!task) return null;

  const user = task.userId as IUser;
  const project = task.projectId as IProject;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography  fontWeight={700}>
          {task.title}
        </Typography>

        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Assigned To:
          </Typography>
          <Typography>{user?.name || "Unknown"}</Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Project:
          </Typography>
          <Typography>{project?.name || "No Project"}</Typography>
        </Box>

        {task.dueDate && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Due Date:
            </Typography>
            <Typography>{new Date(task.dueDate).toLocaleDateString()}</Typography>
          </Box>
        )}

        {task.content && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Details:
            </Typography>
            <Typography sx={{ whiteSpace: "pre-wrap" }}>
              {task.content}
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ShowTask;

Tovi Chervonitz, 1 min
"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  IconButton,
  Stack,
  Divider,
  useTheme,
  SxProps,
  Theme
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ScheduleIcon from "@mui/icons-material/Schedule";

import { ITask, IUser, IProject } from "@/app/models/types";

interface ShowTaskProps {
  open: boolean;
  onClose: () => void;
  task: ITask | null;
}

const detailIconStyle: SxProps<Theme> = {
  fontSize: "1.25rem",
};

const ShowTask: React.FC<ShowTaskProps> = ({ open, onClose, task }) => {
  if (!task) return null;

  const theme = useTheme();
  const user = task.userId as IUser;
  const project = task.projectId as IProject;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: "80vh",
          p: 2,
          backgroundColor: theme.palette.background.default,
        },
      }}
    >
      {/* HEADER */}
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 0,
          pb: 1,
        }}
      >
        <Typography
          fontWeight={700}
          color="text.primary"
        >
          {task.title}
        </Typography>

        <IconButton
          onClick={onClose}
          color="secondary"
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent
        sx={{
          mt: 2,
          overflowY: "auto",
          pr: 1,
          pl: 0,
          "&.MuiDialogContent-root": {
            pl: 0,
            pr: 0,
          },
        }}
      >
        <Stack spacing={3}>

          {/* Assigned To */}
          <Stack direction="row" spacing={2} alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center" minWidth="120px">
              <PersonOutlineIcon sx={detailIconStyle} color="secondary" />
              <Typography
                color="text.secondary"
                fontWeight={600}
                letterSpacing={0.3}
              >
                Assigned To:
              </Typography>
            </Stack>

            <Typography
              fontSize={16}
              fontWeight={500}
              color="text.primary"
            >
              {user?.name || "Unknown"}
            </Typography>
          </Stack>

          {/* Project */}
          <Stack direction="row" spacing={2} alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center" minWidth="120px">
              <FolderOutlinedIcon
                sx={detailIconStyle}
                color={project?.color ? undefined : "secondary"}
                style={{ color: project?.color || theme.palette.secondary.main }}
              />
              <Typography
                color="text.secondary"
                fontWeight={600}
                letterSpacing={0.3}
              >
                Project:
              </Typography>
            </Stack>

            <Typography
              fontSize={16}
              fontWeight={500}
              color="text.primary"
            >
              {project?.name || "No Project"}
            </Typography>
          </Stack>

          {/* Status */}
          <Stack direction="row" spacing={2} alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center" minWidth="120px">
              <ScheduleIcon color="secondary" sx={{ fontSize: "1.3rem" }} />
              <Typography
                color="text.secondary"
                fontWeight={600}
                letterSpacing={0.3}
              >
                Status:
              </Typography>
            </Stack>

            <Typography
              fontSize={16}
              fontWeight={500}
              color="text.primary"
              textTransform="capitalize"
            >
              {task.status || "todo"}
            </Typography>
          </Stack>

          {/* Due Date */}
          {task.dueDate && (
            <Stack direction="row" spacing={2} alignItems="center">
              <Stack direction="row" spacing={1} alignItems="center" minWidth="120px">
                <CalendarTodayIcon sx={detailIconStyle} color="secondary" />
                <Typography
                  color="text.secondary"
                  fontWeight={600}
                  letterSpacing={0.3}
                >
                  Due Date:
                </Typography>
              </Stack>

              <Typography
                fontSize={16}
                fontWeight={500}
                color="text.primary"
              >
                {new Date(task.dueDate).toLocaleDateString()}
              </Typography>
            </Stack>
          )}

          {/* Details */}
          {task.content && (
            <Box mt={3}>
              <Typography
                color="text.secondary"
                fontWeight={700}
                letterSpacing={0.3}
                mb={1}
              >
                Details
              </Typography>

              <Box
                sx={{
                  p: 2.5,
                  backgroundColor: theme.palette.background.paper,
                  borderRadius: 1.5,
                  border: 1px solid ${theme.palette.divider},
                  whiteSpace: "pre-wrap",
                  fontSize: 15,
                  lineHeight: 1.7,
                  color: "text.primary",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}
              >
                {task.content}
              </Box>
            </Box>
          )}

        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default ShowTask;

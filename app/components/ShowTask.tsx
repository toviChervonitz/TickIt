
"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  IconButton,
  Stack,
  Divider,
  useTheme,
  SxProps,
  Theme,
} from "@mui/material";
import ScheduleIcon from "@mui/icons-material/Schedule";
import CloseIcon from "@mui/icons-material/Close";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { ITask, IUser, IProject } from "@/app/models/types";
import { getTranslation } from "../lib/i18n";
import useAppStore from "../store/useAppStore";

interface ShowTaskProps {
  open: boolean;
  onClose: () => void;
  task: ITask | null;
}

const detailIconStyle: SxProps<Theme> = {
  fontSize: "1.25rem",
};

const ShowTask: React.FC<ShowTaskProps> = ({ open, onClose, task }) => {

  const { language } = useAppStore();
  const t = getTranslation();
  const theme = useTheme();
  
  if (!task) return null;

  const user = task.userId as IUser;
  const project = task.projectId as IProject;

  const isRtl = language === "he";

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
          direction: isRtl ? "rtl" : "ltr",
          textAlign: isRtl ? "right" : "left",
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
          flexDirection: isRtl ? "row-reverse" : "row",
        }}
      >
        <Typography fontWeight={700} color="text.primary">
          {task.title}
        </Typography>
        <IconButton onClick={onClose} color="secondary" size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent
        sx={{
          mt: 2,
          overflowY: "auto",
          direction: isRtl ? "rtl" : "ltr",
        }}
      >
        <Stack spacing={3}>
          {/* Assigned To */}
          <Stack direction={isRtl ? "row-reverse" : "row"}
            spacing={2} alignItems="center">
            <Stack direction={isRtl ? "row-reverse" : "row"}
              spacing={1} alignItems="center" minWidth="120px">
              <PersonOutlineIcon sx={detailIconStyle} color="secondary" />
              <Typography color="text.secondary" fontWeight={600}>
                {t("assignedTo")}:
              </Typography>
            </Stack>
            <Typography fontSize={16} fontWeight={500} color="text.primary">
              {user?.name || "Unknown"}
            </Typography>
          </Stack>

          {/* Project */}
          <Stack direction={isRtl ? "row-reverse" : "row"}
            spacing={2} alignItems="center">
            <Stack direction={isRtl ? "row-reverse" : "row"}
              spacing={1} alignItems="center" minWidth="120px">
              <FolderOutlinedIcon
                sx={detailIconStyle}
                color={project?.color ? undefined : "secondary"}
                style={{ color: project?.color || theme.palette.secondary.main }}
              />
              <Typography color="text.secondary" fontWeight={600}>
                {t("project")}:
              </Typography>
            </Stack>
            <Typography fontSize={16} fontWeight={500} color="text.primary">
              {project?.name || t("noProject")}
            </Typography>
          </Stack>
          {/* Status */}
          <Stack direction={isRtl ? "row-reverse" : "row"}
            spacing={2} alignItems="center">
            <Stack direction={isRtl ? "row-reverse" : "row"}
              spacing={1} alignItems="center" minWidth="120px">
              <ScheduleIcon color="secondary" sx={{ fontSize: "1.3rem" }} />
              <Typography
                color="text.secondary"
                fontWeight={600}
                letterSpacing={0.3}
              >
                {t("status")}:
              </Typography>
            </Stack>

            <Typography
              fontSize={16}
              fontWeight={500}
              color="text.primary"
              textTransform="capitalize"
            >
              {t(task.status) || "todo"}
            </Typography>
          </Stack>
          {/* Due Date */}
          {task.dueDate && (
            <Stack direction={isRtl ? "row-reverse" : "row"}
              spacing={2} alignItems="center">
              <Stack direction={isRtl ? "row-reverse" : "row"}
                spacing={1} alignItems="center" minWidth="120px">
                <CalendarTodayIcon sx={detailIconStyle} color="secondary" />
                <Typography color="text.secondary" fontWeight={600}>
                  {t("dueDate")}:
                </Typography>
              </Stack>
              <Typography fontSize={16} fontWeight={500} color="text.primary">
                {new Date(task.dueDate).toLocaleDateString()}
              </Typography>
            </Stack>
          )}

          {/* Details */}
          {task.content && (
            <div dir={isRtl ? "rtl" : "ltr"} style={{ textAlign: isRtl ? "right" : "left", marginTop: 24 }}>
              {/* Details title */}
              <Typography color="text.secondary" fontWeight={700} mb={1}>
                {t("details")}
              </Typography>

              {/* Details content */}
              <div
                style={{
                  padding: 20,
                  backgroundColor: theme.palette.background.paper,
                  borderRadius: 12,
                  border: `1px solid ${theme.palette.divider}`,
                  whiteSpace: "pre-wrap",
                  fontSize: 15,
                  lineHeight: 1.7,
                  color: theme.palette.text.primary,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  textAlign: isRtl ? "right" : "left",
                }}
              >
                {task.content}
              </div>
            </div>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default ShowTask;


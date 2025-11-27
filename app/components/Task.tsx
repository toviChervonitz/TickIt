"use client";

import React, { useState } from "react";
import { UpdateTaskStatus } from "@/app/lib/server/taskServer";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Divider,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { getTranslation } from "../lib/i18n";
import { useLanguage } from "../context/LanguageContext";

interface TaskProps {
  _id: string;
  userId: string;
  title: string;
  content?: string;
  status: "todo" | "doing" | "done";
  dueDate?: Date;
  userName: string;
  projectName: string;
  showButtons?: boolean;
  onEdit?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
  onStatusChange?: (id: string, newStatus: "todo" | "doing" | "done",userId:string) => void;
}

const Task: React.FC<TaskProps> = ({
  _id,
  userId,
  title,
  content,
  status,
  dueDate,
  userName,
  projectName,
  showButtons = false,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
      const { lang } = useLanguage();
      const t = getTranslation(lang);
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [statusMenuAnchor, setStatusMenuAnchor] = useState<null | HTMLElement>(null);

  const formattedDate = dueDate
    ? new Date(dueDate).toLocaleDateString("en-GB")
    : "Not set";

  const getAllowedStatuses = () => {
    if (status === "todo") return ["todo", "doing", "done"];
    if (status === "doing") return ["doing", "done"];
    return ["done"];
  };

  const handleStatusClick = (event: React.MouseEvent<HTMLElement>) => {
    if (status === "done") return;
    setStatusMenuAnchor(event.currentTarget);
  };

  const handleStatusSelect = async (newStatus: "todo" | "doing" | "done") => {
    setStatusMenuAnchor(null);
    try {
      onStatusChange?.(_id, newStatus,userId);
    } catch (err) {
      console.error("Failed to update task:", err);
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "todo":
        return "#1d486a";
      case "doing":
        return "#66dcd7";
      case "done":
        return "#3dd2cc";
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case "todo":
        return t("todo");
      case "doing":
        return t("inProgress");
      case "done":
        return t("completed");
    }
  };

  // Check if task is overdue
  const isOverdue = dueDate && new Date(dueDate) < new Date() && status !== "done";

  return (
    <Card
      elevation={0}
      sx={{
        backgroundColor: "white",
        borderRadius: 2,
        border: "1px solid #e8eaed",
        transition: "all 0.2s ease",
        "&:hover": {
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          transform: "translateY(-2px)",
        },
      }}
    >
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        {/* Header with Status and Options */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
          <Chip
            label={getStatusLabel()}
            size="small"
            onClick={handleStatusClick}
            sx={{
              backgroundColor: `${getStatusColor()}15`,
              color: getStatusColor(),
              fontWeight: 600,
              fontSize: "0.75rem",
              cursor: status !== "done" ? "pointer" : "default",
              "&:hover": {
                backgroundColor: status !== "done" ? `${getStatusColor()}25` : undefined,
              },
            }}
          />

          {showButtons && (onEdit || onDelete) && (
            <IconButton
              size="small"
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{ 
                ml: 1,
                "&:hover": {
                  backgroundColor: "rgba(0,0,0,0.04)",
                }
              }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          )}
        </Box>

        {/* Title */}
        <Typography
          variant="h6"
          fontWeight={700}
          color="text.primary"
          sx={{
            mb: 1.5,
            fontSize: "1rem",
            lineHeight: 1.4,
          }}
        >
          {title}
        </Typography>

        {/* Description */}
        {content && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              lineHeight: 1.6,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {content}
          </Typography>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Footer Info */}
        <Stack spacing={1}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CalendarTodayIcon sx={{ fontSize: 14, color: isOverdue ? "#d93025" : "text.secondary" }} />
            <Typography
              variant="caption"
              color={isOverdue ? "error" : "text.secondary"}
              fontWeight={isOverdue ? 600 : 500}
            >
              {formattedDate}
              {isOverdue && `  (${t("overdue")})`}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <PersonOutlineIcon sx={{ fontSize: 14, color: "text.secondary" }} />
            <Typography variant="caption" color="text.secondary">
              {userName}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FolderOutlinedIcon sx={{ fontSize: 14, color: "text.secondary" }} />
            <Typography variant="caption" color="text.secondary" noWrap>
              {projectName}
            </Typography>
          </Box>
        </Stack>
      </CardContent>

      {/* Status Change Menu */}
      <Menu
        anchorEl={statusMenuAnchor}
        open={Boolean(statusMenuAnchor)}
        onClose={() => setStatusMenuAnchor(null)}
      >
        {getAllowedStatuses().map((s) => (
          <MenuItem
            key={s}
            onClick={() => handleStatusSelect(s as "todo" | "doing" | "done")}
            selected={s === status}
          >
            {s === "todo" ? "To Do" : s === "doing" ? "In Progress" : "Completed"}
          </MenuItem>
        ))}
      </Menu>

      {/* Actions Menu */}
      {showButtons && (onEdit || onDelete) && (
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          {onEdit && (
            <MenuItem
              onClick={() => {
                onEdit(_id);
                setAnchorEl(null);
              }}
            >
              <EditIcon fontSize="small" sx={{ mr: 1, color: "#1d486a" }} />
              {t("edit")}
            </MenuItem>
          )}
          {onDelete && (
            <MenuItem
              onClick={() => {
                onDelete(_id);
                setAnchorEl(null);
              }}
              sx={{ color: "#d93025" }}
            >
              <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
              {t("delete")}
            </MenuItem>
          )}
        </Menu>
      )}
    </Card>
  );
};

export default Task;
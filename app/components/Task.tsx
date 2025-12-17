"use client";

import React, { useState } from "react";
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
  DialogActions,
  Dialog,
  Button,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import FolderIcon from "@mui/icons-material/Folder";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

import { getTranslation } from "../lib/i18n";
import { KANBAN_COLUMNS_CONFIG } from "../config/kanbanConfig";
import useAppStore from "../store/useAppStore";

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
  onStatusChange?: (
    id: string,
    newStatus: "todo" | "doing" | "done",
    userId: string
  ) => void;
  onView?: (taskId: string) => void;
  projectColor?: string;
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
  onView,
  projectColor,
}) => {
  const { language } = useAppStore();
  const t = getTranslation();
  const isRTL = language === "he";

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [statusMenuAnchor, setStatusMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

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

  const handleStatusSelect = async (newStatus: any) => {
    setStatusMenuAnchor(null);
    onStatusChange?.(_id, newStatus, userId);
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmText.toLowerCase() === "delete") {
      onDelete?.(_id);
      setConfirmOpen(false);
      setDeleteConfirmText("");
    }
  };

  const handleDialogClose = () => {
    setConfirmOpen(false);
    setDeleteConfirmText("");
  };

  const getKanbanColor = (id: "todo" | "doing" | "done") => {
    return KANBAN_COLUMNS_CONFIG.find(c => c.id === id);
  };

  const TODO_CONFIG = getKanbanColor("todo");
  const DOING_CONFIG = getKanbanColor("doing");
  const DONE_CONFIG = getKanbanColor("done");

  const getStatusColor = () => {
    switch (status) {
      case "todo":
        return TODO_CONFIG ? TODO_CONFIG.color : "#ffab00";
      case "doing":
        return DOING_CONFIG ? DOING_CONFIG.color : "#2962ff";
      case "done":
        return DONE_CONFIG ? DONE_CONFIG.color : "#00c853";
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

  const isOverdue =
    dueDate && new Date(dueDate) < new Date() && status !== "done";

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
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
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
                backgroundColor:
                  status !== "done" ? `${getStatusColor()}25` : undefined,
              },
            }}
          />

          <Stack direction="row" spacing={0.5} alignItems="center">
            <IconButton
              onClick={() => onView?.(_id)}
              size="small"
              sx={{ p: 0.5 }}
            >
              <VisibilityOutlinedIcon fontSize="small" />
            </IconButton>

            {showButtons && (onEdit || onDelete) && (
              <IconButton
                size="small"
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{ p: 0.5 }}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            )}
          </Stack>
        </Box>

        {/* Title */}
        <Typography
          variant="h6"
          fontWeight={700}
          color="text.primary"
          sx={{ mb: 1.5, fontSize: "1rem", lineHeight: 1.4 }}
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

        {/* Footer */}
        <Stack spacing={1}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CalendarTodayIcon
              sx={{
                fontSize: 14,
                color: isOverdue ? "#d93025" : "text.secondary",
              }}
            />
            <Typography
              variant="caption"
              color={isOverdue ? "error" : "text.secondary"}
              fontWeight={isOverdue ? 600 : 500}
            >
              {formattedDate}
              {isOverdue && ` (${t("overdue")})`}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <PersonOutlineIcon sx={{ fontSize: 14, color: "text.secondary" }} />
            <Typography variant="caption" color="text.secondary">
              {userName}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FolderIcon sx={{ fontSize: 18, color: projectColor || "#888" }} />
            <Typography variant="caption" color="text.secondary" noWrap>
              {projectName}
            </Typography>
          </Box>
        </Stack>
      </CardContent>

      {/* Status Menu */}
      <Menu
        dir={isRTL ? "rtl" : "ltr"}
        anchorEl={statusMenuAnchor}
        open={Boolean(statusMenuAnchor)}
        onClose={() => setStatusMenuAnchor(null)}
      >
        {getAllowedStatuses().map((s) => (
          <MenuItem
            key={s}
            onClick={() => handleStatusSelect(s)}
            selected={s === status}
          >
            {s === "todo"
              ? "To Do"
              : s === "doing"
                ? "In Progress"
                : "Completed"}
          </MenuItem>
        ))}
      </Menu>

      {/* Actions Menu */}
      {showButtons && (onEdit || onDelete) && (
        <Menu
          dir={isRTL ? "rtl" : "ltr"}
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
                setConfirmOpen(true);
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        dir={isRTL ? "rtl" : "ltr"}
        open={confirmOpen}
        onClose={handleDialogClose}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            p: 2,
            borderRadius: "16px",
            backgroundColor: "white",
            boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          },
        }}
      >
        {/* Warning Icon Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            pt: 2,
            pb: 1,
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              backgroundColor: "#fef2f2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <WarningAmberRoundedIcon
              sx={{
                fontSize: 36,
                color: "#dc2626",
              }}
            />
          </Box>
        </Box>

        <DialogTitle
          sx={{
            textAlign: "center",
            fontWeight: 700,
            fontSize: "1.35rem",
            color: "#1d1d1d",
            mb: 0.5,
            pt: 2,
            pb: 1,
          }}
        >
          {t("deleteTask")}
        </DialogTitle>

        <DialogContent sx={{ textAlign: "center", pb: 2 }}>
          <Typography
            sx={{
              fontSize: "0.95rem",
              color: "#6b7280",
              mb: 3,
              lineHeight: 1.6,
            }}
          >
          </Typography>

          {/* Confirmation Input */}
         <Box sx={{ mt: 2 }} dir={isRTL ? "rtl" : "ltr"}>
  <Typography
    sx={{
      fontSize: "0.85rem",
      color: "#374151",
      mb: 1.5,
      fontWeight: 500,
    }}
  >
    {t("deleteToConfirm")}
  </Typography>
  <TextField
    fullWidth
    value={deleteConfirmText}
    onChange={(e) => setDeleteConfirmText(e.target.value)}
    placeholder="delete"
    autoFocus
    sx={{
      "& .MuiOutlinedInput-root": {
        borderRadius: "10px",
        backgroundColor: "#f9fafb",
        "&:hover fieldset": { borderColor: "#d1d5db" },
        "&.Mui-focused fieldset": { borderColor: "#dc2626", borderWidth: "2px" },
      },
      "& .MuiInputBase-input": {
        textAlign: isRTL ? "right" : "left",
        direction: isRTL ? "rtl" : "ltr",
      },
    }}
    onKeyPress={(e) => {
      if (e.key === "Enter" && deleteConfirmText.toLowerCase() === "delete") {
        handleDeleteConfirm();
      }
    }}
  />
</Box>

        </DialogContent>

        <DialogActions
          sx={{
            justifyContent: "center",
            gap: 1.5,
            px: 3,
            pb: 3,
            pt: 1,
          }}
        >
          {/* Cancel Button */}
          <Button
            variant="outlined"
            onClick={handleDialogClose}
            sx={{
              px: 4,
              py: 1,
              borderRadius: "10px",
              fontWeight: 600,
              color: "#6b7280",
              borderColor: "#d1d5db",
              textTransform: "none",
              fontSize: "0.95rem",
              "&:hover": {
                borderColor: "#9ca3af",
                backgroundColor: "#f9fafb",
              },
            }}
          >
            {t("cancel")}
          </Button>

          {/* Delete Button */}
          <Button
            variant="contained"
            onClick={handleDeleteConfirm}
            disabled={deleteConfirmText.toLowerCase() !== "delete"}
            sx={{
              px: 4,
              py: 1,
              borderRadius: "10px",
              fontWeight: 600,
              textTransform: "none",
              fontSize: "0.95rem",
              backgroundColor: "#dc2626",
              "&:hover": {
                backgroundColor: "#b91c1c",
              },
              "&:disabled": {
                backgroundColor: "#fca5a5",
                color: "#ffffff",
                opacity: 0.6,
              },
            }}
          >
            {t("delete")}
          </Button>
        </DialogActions>
      </Dialog>

    </Card>
  );
};

export default Task;
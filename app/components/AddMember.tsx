"use client";

import { useState } from "react";
import { AddUserToProject } from "@/app/lib/server/userServer";
import { getTranslation } from "../lib/i18n";
import {
  TextField,
  Button,
  Stack,
  Typography,
  CircularProgress,
} from "@mui/material";

interface AddUserProps {
  projectId: string;
  onUserAdded?: (user: any) => void;
  label?: string;
  onClose?: () => void;
}

export default function AddUserToProjectForm({
  projectId,
  onUserAdded,
  label = "Add User",
  onClose,
}: AddUserProps) {
  const t = getTranslation();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAddUser = async () => {
    if (!email.trim()) return;

    try {
      setLoading(true);
      setError("");

      const addedUser = await AddUserToProject(projectId, email.trim());

      onUserAdded?.(addedUser);

      setEmail("");
    } catch (err: any) {
      if (err.message === "UserAlreadyExists") {
        setError(t("userAlreadyMember"));
      } else {
        setError(err.message || t("failedToAddUser"));
      }
    } finally {
      setLoading(false);
      onClose?.();
    }
  };

  return (
    <Stack spacing={1.5} sx={{ width: "100%" }}>
      <TextField
        size="small"
        type="email"
        label={t("userEmail")}
        sx={{ colors: "primary.main" }}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleAddUser()}
        fullWidth
      />

      <Button
        variant="contained"
        size="small"
        onClick={handleAddUser}
        disabled={loading}
        sx={{
          textTransform: "none", minWidth: 100,
          background: "linear-gradient(to bottom, #3dd2cc, #2dbfb9)",
          "&:hover": {
            background: "linear-gradient(to bottom, #2dbfb9, #1fa9a3)",
          },
        }}
      >
        {loading ? (
          <CircularProgress size={18} sx={{ color: "#fff" }} />
        ) : (
          t("addUser")
        )}
      </Button>

      {error && (
        <Typography variant="body2" color="error" sx={{ mt: 0.5 }}>
          {error}
        </Typography>
      )}
    </Stack>
  );
}

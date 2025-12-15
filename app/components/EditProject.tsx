"use client";

import React, { useEffect, useState } from "react";
import { UpdateProject } from "../lib/server/projectServer";
import { getTranslation } from "../lib/i18n";

import {
  Box,
  TextField,
  Button,
  Typography,
  Stack,
  CircularProgress,
} from "@mui/material";

export interface ProjectForm {
  _id: string;
  name: string;
  description: string;
}

interface EditProjectProps {
  project: ProjectForm | null;
  onSaved: () => void;
  onCancel: () => void;
}

const EditProject = ({
  project: initialProject,
  onSaved,
  onCancel,
}: EditProjectProps) => {
  const t = getTranslation();
  const [project, setProject] = useState<ProjectForm>(initialProject!);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  const { lang } = { lang: "he" }; 
  const isHebrew = lang === "he";

  useEffect(() => setMounted(true), []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProject((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project._id) return;

    try {
      setLoading(true);
      await UpdateProject(project._id, {
        name: project.name,
        description: project.description,
      });
      onSaved();
    } catch (err) {
      console.error("Error updating project:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <Box sx={{ width: "100%", p: 1 }}>
      {/* Title */}
      <Typography
        variant="h6"
        sx={{
          mb: 2,
          fontWeight: 700,
          textAlign: isHebrew ? "left" : "right",
        }}
      >
        {t("editProject")}
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={2.5}>
          {/* Project Name */}
          <TextField
            label={t("title")}
            name="name"
            value={project.name}
            onChange={handleChange}
            fullWidth
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": { borderRadius: "12px" },
            }}
          />

          {/* Project Description */}
          <TextField
            label={t("content")}
            name="description"
            value={project.description}
            onChange={handleChange}
            fullWidth
            multiline
            minRows={3}
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": { borderRadius: "12px" },
            }}
          />

          {/* Buttons */}
<Stack
  direction="row"
  justifyContent={isHebrew ? "flex-start" : "flex-end"}
  sx={{ direction: isHebrew ? "rtl" : "ltr" }}
>
  {/* Save Changes */}
  <Button
    type="submit"
    variant="contained"
    disabled={loading}
    sx={{
      px: 3,
      minWidth: 130,
      borderRadius: "12px",
      fontWeight: 700,
      background: "linear-gradient(to bottom, #3dd2cc, #2dbfb9)",
      "&:hover": {
        background: "linear-gradient(to bottom, #2dbfb9, #1fa9a3)",
      },
      mr: isHebrew ? 0 : 2, 
      ml: isHebrew ? 2 : 0,
    }}
  >
    {loading ? <CircularProgress size={22} sx={{ color: "white" }} /> : t("saveChanges")}
  </Button>

  {/* Cancel */}
  <Button
    variant="outlined"
    onClick={onCancel}
    disabled={loading}
    sx={{
      px: 3,
      borderRadius: "12px",
      fontWeight: 600,
      color: "#2dbfb9",
      borderColor: "#2dbfb9",
      "&:hover": {
        borderColor: "#26a9a4",
        backgroundColor: "rgba(45,191,185,0.06)",
      },
      mr: isHebrew ? 0 : 2,
      ml: isHebrew ? 2 : 0,
    }}
  >
    {t("cancel")}
  </Button>
</Stack>
        </Stack>
      </Box>
    </Box>
  );
};

export default EditProject;

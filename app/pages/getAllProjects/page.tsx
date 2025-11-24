"use client";

import { GetAllProjectsByUserId } from "@/app/lib/server/projectServer";
import { IProject, IProjectRole } from "@/app/models/types";
import useAppStore from "@/app/store/useAppStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  GridLegacy as Grid,
  Skeleton,
  IconButton,
  Dialog, // הוספתי דיאלוג לפופ-אפ
  DialogContent, // תוכן הדיאלוג
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import FolderIcon from "@mui/icons-material/Folder";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CircleIcon from "@mui/icons-material/Circle";
import EditIcon from "@mui/icons-material/Edit";

import EditProject, { ProjectForm } from "@/app/components/EditProject";

// טורקיז
const MAIN_COLOR = "#3dd2cc";

// נקודה
const DOT_COLORS = [
  "#ff9f43",
  "#5f27cd",
  "#ff6b6b",
  "#48dbfb",
  "#1dd1a1",
  "#f368e0",
  "#fab1a0",
];

const getDotColor = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return DOT_COLORS[Math.abs(hash % DOT_COLORS.length)];
};

export default function GetAllProjectsPage() {
  const { user, projects, setProjects, setProjectId } = useAppStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // ==== עריכה ====
  const [editingProject, setEditingProject] = useState<ProjectForm | null>(null);

  const handleEdit = (p: IProjectRole) => {
    setEditingProject({
      _id: p.project._id!,
      name: p.project.name,
      description: p.project.description || "",
    });
  };

  const handleSaved = async () => {
    setEditingProject(null);
    if (!user) return;
    const refreshed = await GetAllProjectsByUserId(user._id!);
    setProjects(refreshed.projects || []);
  };

  // ========= Fetch =========
  useEffect(() => {
    if (!user?._id) return;
    async function fetchProjects() {
      try {
        const response = await GetAllProjectsByUserId(user?._id!);
        if (response?.status === "success") {
          setProjects(response.projects || []);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, [user, setProjects]);

  const getIntoProject = (project: IProject) => {
    setProjectId(project._id!);
    router.push("/pages/projectTask");
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "background.default", py: 5 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box
          sx={{
            mb: 5,
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h4" fontWeight={800} color="primary.main">
              Projects
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Select a project to view tasks and details
            </Typography>
          </Box>

          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => router.push("/pages/createProject")}
            sx={{
              color: "#0f3460",
              borderColor: "#0f3460",
              backgroundColor: "white",
              borderWidth: "1.5px",
              fontWeight: 700,
              px: 3,
              py: 1,
              borderRadius: "10px",
              "&:hover": {
                backgroundColor: "#f0f2f5",
                borderColor: "#0f3460",
                borderWidth: "1.5px",
              },
            }}
          >
            Create New Project
          </Button>
        </Box>

        {/* Projects Grid */}
        {loading ? (
          <Grid container spacing={3}>
            {[1, 2, 3, 4].map((n) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={n}>
                <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 3 }} />
              </Grid>
            ))}
          </Grid>
        ) : projects.length > 0 ? (
          <Grid container spacing={3} alignItems="stretch">
            {projects.map((wrapper: IProjectRole) => {
              const p = wrapper.project;
              console.log("p : ", p);
              
              const dotColor = getDotColor(p._id || "default");

              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={p._id} sx={{ display: "flex" }}>
                  <Card
                    elevation={0}
                    onClick={() => getIntoProject(p)}
                    sx={{
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      borderRadius: 4,
                      border: "1px solid #edf2f7",
                      cursor: "pointer",
                      transition: "0.2s",
                      "&:hover": {
                        boxShadow: "0 12px 20px rgba(0,0,0,0.05)",
                        borderColor: MAIN_COLOR,
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3, flexGrow: 1 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: "12px",
                            backgroundColor: "rgba(61,210,204,0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <FolderIcon sx={{ color: MAIN_COLOR, fontSize: 28 }} />
                        </Box>

                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <CircleIcon sx={{ fontSize: 14, color: dotColor }} />

                            {wrapper.role === "manager" && (
                            <IconButton
                                size="small"
                                onClick={(e) => {
                                e.stopPropagation(); 
                                handleEdit(wrapper);
                                }}
                                sx={{
                                color: "primary.main",
                                transition: "all 0.2s",
                                "&:hover": { 
                                    color: MAIN_COLOR, 
                                    backgroundColor: "rgba(61,210,204,0.1)" 
                                },
                                }}
                            >
                                <EditIcon fontSize="small" />
                            </IconButton>
                            )}
                        </Box>
                      </Box>

                      {/* Name */}
                      <Typography
                        variant="h6"
                        fontWeight={700}
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {p.name}
                      </Typography>

                      {/* Description */}
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          wordBreak: "break-word",
                          minHeight: "4.5em",
                          lineHeight: 1.5,
                        }}
                      >
                        {p.description || "No description available."}
                      </Typography>
                    </CardContent>

                    <Box sx={{ p: 3, pt: 0, display: "flex", justifyContent: "flex-end" }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          color: MAIN_COLOR,
                          fontWeight: 700,
                          fontSize: "0.875rem",
                          gap: 0.5,
                          "&:hover": { gap: 1 },
                        }}
                      >
                        View Project <ArrowForwardIcon sx={{ fontSize: 18 }} />
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          <Box sx={{ textAlign: "center", py: 10 }}>
            <Typography color="text.secondary">No projects yet.</Typography>
          </Box>
        )}
      </Container>

      {/* === מודל עריכה (Popup) === */}
      <Dialog 
        open={!!editingProject} 
        onClose={() => setEditingProject(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
            sx: { borderRadius: 3, p: 1 }
        }}
      >
        <DialogContent>
            {editingProject && (
                <EditProject
                    project={editingProject}
                    onSaved={handleSaved}
                    onCancel={() => setEditingProject(null)}
                />
            )}
        </DialogContent>
      </Dialog>

    </Box>
  );
}
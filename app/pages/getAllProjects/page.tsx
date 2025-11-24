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
  Stack,
  CircularProgress,
  IconButton,
} from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import EditProject, { ProjectForm } from "@/app/components/EditProject";
import AddIcon from "@mui/icons-material/Add";

export default function GetAllProjectsPage() {
  const { user, projects, setProjects, setProjectId } = useAppStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [editingProject, setEditingProject] = useState<ProjectForm | null>(
    null
  );
  const [isManager, setIsManager]=useState(false)


  useEffect(() => {
    if (!user?._id) return;
    const userId = user._id;

    async function fetchProjects() {
      try {
        const response = await GetAllProjectsByUserId(userId!);
console.log("response in get all projects", response);

        if (response?.status !== "success") {
          console.error("Error fetching projects:", response?.message);
          setProjects([]);
          return;
        }

        setProjects(response.projects || []);
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

  const toggleExpand = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) newSet.delete(projectId);
      else newSet.add(projectId);
      return newSet;
    });
  };

  const shouldShowSeeMore = (text: string) => !!text && text.length > 80;
  const handleSaved = async () => {
    setEditingProject(null);
    if (!user) return;

    const updated = await GetAllProjectsByUserId(user._id);
    setProjects(updated.projects || []);
  };

  const handleEdit = async (id: string, name: string, description: string) => {
    setEditingProject({ _id: id, name: name, description: description });
    <EditProject
      project={editingProject}
      onSaved={handleSaved}
      onCancel={() => setEditingProject(null)}
    />;
  };
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#ffffff", py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography variant="h3" fontWeight={800} color="primary.main" mb={1}>
              All Projects
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Select a project to view tasks and details
            </Typography>
          </Box>

          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => router.push("/pages/createProject")}
            sx={{
              px: 4,
              py: 1.5,
              fontWeight: 700,
              background: "linear-gradient(to bottom, #3dd2cc, #2dbfb9)",
              "&:hover": {
                background: "linear-gradient(to bottom, #2dbfb9, #1fa9a3)",
              },
            }}
          >
            Create New Project
          </Button>
        </Box>

        {projects.length > 0 ? (
          <Stack spacing={2}>
            {projects.map((project: IProjectRole) => {
              const isExpanded = expandedItems.has(project._id!);
              const description =
                project.project.description || "No description available";
              const showSeeMore = shouldShowSeeMore(description);

              return (
                <Card
                  key={project.project._id}
                  elevation={0}
                  sx={{
                    border: "1px solid #e8eaed",
                    borderRadius: 3,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      borderColor: "#3dd2cc",
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", gap: 2.5 }}>
                      {/* אייקון תיקיה */}
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          background:
                            "linear-gradient(135deg, #3dd2cc 0%, #2dbfb9 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <FolderIcon sx={{ color: "white", fontSize: 24 }} />
                      </Box>

                      {/* טקסטים */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        {/* כותרת + חץ בשורה אחת */}
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 1,
                          }}
                        >
                          <Typography
                            variant="h6"
                            fontWeight={700}
                            color="text.primary"
                            sx={{ mr: 2 }}
                          >
                            {project.project.name}
                          </Typography>

                          {/* החץ בשורה העליונה */}
                          <IconButton
                            onClick={() => getIntoProject(project.project)}
                            size="small"
                            sx={{
                              color: "#3dd2cc",
                              "&:hover": {
                                backgroundColor: "rgba(61,210,204,0.1)",
                              },
                            }}
                          >
                            <ArrowForwardIcon fontSize="small" />
                          </IconButton>
                          {project.role=="manager"&&(
                          <button
                            onClick={() =>
                              handleEdit(
                                project.project._id!,
                                project.project.name,
                                project.project.description!
                              )
                            }
                          >
                            Edit Project
                          </button>)}
                          {editingProject && (
                            <EditProject
                              project={editingProject}
                              onSaved={handleSaved}
                              onCancel={() => setEditingProject(null)}
                            />
                          
                          )}
                        </Box>

                        {/* תיאור – 2 שורות + See More */}
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mb: showSeeMore ? 1 : 2,
                            lineHeight: 1.6,
                            wordBreak: "break-word",
                            ...(showSeeMore && !isExpanded
                              ? {
                                  display: "-webkit-box",
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  WebkitLineClamp: 2,
                                }
                              : {
                                  display: "block",
                                  overflow: "visible",
                                }),
                          }}
                        >
                          {description}
                        </Typography>

                        {showSeeMore && (
                          <Box
                            onClick={(e) => toggleExpand(project.project._id!, e)}
                            sx={{
                              display: "inline-flex",
                              alignItems: "center",
                              color: "#3dd2cc",
                              cursor: "pointer",
                              fontWeight: 600,
                              fontSize: "0.875rem",
                              mb: 2,
                              "&:hover": {
                                color: "#2dbfb9",
                              },
                            }}
                          >
                            {isExpanded ? (
                              <>
                                See less{" "}
                                <ExpandLessIcon
                                  sx={{ fontSize: 18, ml: 0.5 }}
                                />
                              </>
                            ) : (
                              <>
                                See more{" "}
                                <ExpandMoreIcon
                                  sx={{ fontSize: 18, ml: 0.5 }}
                                />
                              </>
                            )}
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        ) : (
          <Box
            sx={{
              textAlign: "center",
              py: 8,
            }}
          >
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                backgroundColor: "rgba(61,210,204,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto",
                mb: 3,
              }}
            >
              <FolderIcon sx={{ fontSize: 60, color: "#3dd2cc" }} />
            </Box>
            <Typography
              variant="h5"
              fontWeight={700}
              color="text.primary"
              mb={1}
            >
              No Projects Yet
            </Typography>
            <Typography variant="body1" color="text.secondary">
              You haven't created or joined any projects yet.
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
}
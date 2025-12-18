"use client";

import {
  GetAllProjectsByUserId,
  openProject,
  toArchive,
} from "@/app/lib/server/projectServer";
import { IProject, IProjectRole } from "@/app/models/types";
import useAppStore from "@/app/store/useAppStore";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
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
  Dialog,
  DialogContent,
  TextField,
  InputAdornment,
  Tooltip,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import FolderIcon from "@mui/icons-material/Folder";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CircleIcon from "@mui/icons-material/Circle";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import { getTranslation } from "@/app/lib/i18n";
import EditProject, { ProjectForm } from "@/app/components/EditProject";
import Archive from "@/app/components/Archive";
import ShowArchive from "@/app/components/ShowArchive";

const MAIN_COLOR = "secondary.main";
const LIMIT = 8;

export default function GetAllProjectsPage() {
  const t = getTranslation();

  const { user, projects, setProjects, setProjectId, setMessages, language, showArchive } =
    useAppStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [editingProject, setEditingProject] = useState<ProjectForm | null>(
    null
  );

  // ==== edit ====

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

  const fetchProjects = async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const response = await GetAllProjectsByUserId(user._id!);
      setProjects(response.projects || []);
      if (response.projects.length < LIMIT) setHasMore(false);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  //================== single project============
  const getIntoProject = async (project: IProject) => {
    setProjectId(project._id!);
    setMessages([]); // clear messages when entering a new project
    const res = await openProject(project._id, user?._id);

    router.push("/pages/projectTask");
  };

  const filterArchive = (projects: IProjectRole[]) => {
    return projects.filter((p) => (showArchive ? p.isArchived : !p.isArchived));
  };

  const filteredProjects = useMemo(() => {
    if (!projects) return [];

    const archiveFiltered = filterArchive(projects);

    if (!searchTerm) return archiveFiltered;

    const search = searchTerm.toLowerCase();
    return archiveFiltered.filter((p) => {
      const project = p.project;
      return (
        project.name.toLowerCase().includes(search) ||
        (project.description &&
          project.description.toLowerCase().includes(search))
      );
    });
  }, [projects, searchTerm, showArchive]);

  const projectsToDisplay = filteredProjects;

  console.log("projectsToDisplay", projectsToDisplay);

  useEffect(() => {
    fetchProjects();
  }, [user]);

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#ffffff", py: 5 }}>
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
              {t("projects")}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t("selectProject")}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexDirection: { xs: "column", sm: "row" },
              width: { xs: "100%", sm: "auto" },
            }}
          >
            {/* 2. שדה קלט לחיפוש */}
            <TextField
              variant="outlined"
              placeholder={t("searchProjects")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              sx={{ minWidth: 250 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                sx: { borderRadius: "10px", backgroundColor: "#f0f2f5" },
              }}
            />
            <ShowArchive show={showArchive}  />

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
              {t("createProject")}
            </Button>
          </Box>
        </Box>
        {/* Projects Grid */}
        {loading ? (
          <Grid container spacing={3}>
            {[1, 2, 3, 4].map((n) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={n}>
                <Skeleton
                  variant="rectangular"
                  height={220}
                  sx={{ borderRadius: 3 }}
                />
              </Grid>
            ))}
          </Grid>
        ) : projectsToDisplay.length > 0 ? (
          <Grid container spacing={3} alignItems="stretch">
            {projectsToDisplay.map((wrapper: IProjectRole) => {
              const p = wrapper.project;
              // console.log("p : ", p);
              if (!p) return;
              const dotColor = p.color;
              // const dotColor = p.color|| "#F7F5F0";

              return (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  lg={3}
                  key={p._id}
                  sx={{ display: "flex" }}
                >
                  <Card
                    elevation={0}
                    // onClick={() => getIntoProject(p)}
                    sx={{
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      borderRadius: 4,
                      backgroundColor: "background.default",
                      border: "1px solid #e0e0e0",
                      cursor: "pointer",
                      transition: "0.2s",
                      "&:hover": {
                        boxShadow: "0 12px 20px rgba(0,0,0,0.05)",
                        borderColor: MAIN_COLOR,
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3, flexGrow: 1 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          mb: 2,
                        }}
                      >
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
                          <FolderIcon
                            sx={{ color: dotColor, fontSize: 28 }}
                          />
                        </Box>

                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
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
                                  backgroundColor: "rgba(61,210,204,0.1)",
                                },
                              }}
                            >
                              <Tooltip
                                title={t("editProject")}
                                placement="top"
                                arrow
                              >
                                <EditIcon fontSize="small" />
                              </Tooltip>
                            </IconButton>
                          )}
                          <Archive
                            projectId={p._id}
                            userId={user!._id}
                            archived={showArchive}
                          />
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
                        {p.description || t("noDescription")}
                      </Typography>
                    </CardContent>

                    <Box
                      sx={{
                        p: 3,
                        pt: 0,
                        display: "flex",
                        justifyContent: "flex-end",
                      }}
                    >
                      <Box
                        onClick={() => getIntoProject(p)}
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
                        {t("viewProject")}{" "}
                        {language == "en" ? (
                          <ArrowForwardIcon sx={{ fontSize: 18 }} />
                        ) : (
                          <ArrowBackIcon sx={{ fontSize: 18 }} />
                        )}
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          <Box sx={{ textAlign: "center", py: 10 }}>
            <Typography color="text.secondary">{t("noProjectsYet")}</Typography>
          </Box>
        )}
        <Box />
      </Container>

      <Dialog
        open={!!editingProject}
        onClose={() => setEditingProject(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, p: 1 },
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

"use client";

import { GetAllProjectsByUserId } from "@/app/lib/server/projectServer";
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
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import FolderIcon from "@mui/icons-material/Folder";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CircleIcon from "@mui/icons-material/Circle";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import { useLanguage } from "@/app/context/LanguageContext";
import { getTranslation } from "@/app/lib/i18n";
import EditProject, { ProjectForm } from "@/app/components/EditProject";

const MAIN_COLOR = "secondary.main";
const LIMIT = 6;

export default function GetAllProjectsPage() {
  const { lang } = useLanguage();
  const router = useRouter();
  const t = getTranslation(lang);
  const { user, projects, setProjects, setProjectId } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [editingProject, setEditingProject] = useState<ProjectForm | null>(
    null
  );
  const [loadingMore, setLoadingMore] = useState(false);

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
      const response = await GetAllProjectsByUserId(user?._id!, 0, LIMIT);
      setProjects(response.projects || []);
      // setPage((prev)=>prev+1);
      if (response.projects.length < LIMIT) setHasMore(false);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  //================lazy loading=============
  async function loadMore() {
    if (!user?._id || !hasMore ||loadingMore) return;
    console.log("in load more ()");

    setLoadingMore(true);
    try {
      console.log("page", page);

      const response = await GetAllProjectsByUserId(
        user?._id!,
        page * LIMIT,
        LIMIT
      );
      // setPage(1);
      if (response.projects.length < LIMIT) {
        setHasMore(false);
      }
      console.log("response in load more", response);
      console.log("projects in load more", projects);

      // setProjects([...projects, ...response.projects]);

      setProjects((prevProjects) => [...prevProjects, ...response.projects]);

      setPage((prevPage) => prevPage + 1);
    } catch (err) {
      console.error("Load more error:", err);
    } finally {
      setLoadingMore(false);
    }
  }
  //================== single project============
  const getIntoProject = (project: IProject) => {
    setProjectId(project._id!);
    router.push("/pages/projectTask");
  };
  //=========filter============
  const filteredProjects = useMemo(() => {
    if (!searchTerm) {
      return projects;
    }
    const lowerCaseSearch = searchTerm.toLowerCase();
    return projects.filter((wrapper: IProjectRole) => {
      const p = wrapper.project;
      return (
        p.name.toLowerCase().includes(lowerCaseSearch) ||
        (p.description && p.description.toLowerCase().includes(lowerCaseSearch))
      );
    });
  }, [projects, searchTerm]);

  const projectsToDisplay = filteredProjects;
  console.log("projectsToDisplay", projectsToDisplay);

  useEffect(() => {
    fetchProjects();
  }, [user]);

  useEffect(() => {
    if (!loadMoreRef.current) return;
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          console.log("project in use effect", projects);

          loadMore();
        }
      },
      { threshold: 1 }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
    // }, [loadMoreRef, hasMore, page, projects]);
  }, [loadMoreRef, hasMore, page, loadingMore]);

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

              const dotColor = p.color;

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
                    onClick={() => getIntoProject(p)}
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
                            sx={{ color: MAIN_COLOR, fontSize: 28 }}
                          />
                        </Box>

                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <CircleIcon
                            sx={{ fontSize: 14, color: dotColor || "#F7F5F0" }}
                          />

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
                        {lang == "en" ? (
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
        <Box ref={loadMoreRef} sx={{ height: 50 }} /> {/* אלמנט סוף */}
      </Container>

      {/* === מודל עריכה (Popup) === */}
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
      {/* {hasMore && (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Button
            variant="contained"
            onClick={loadMore}
            sx={{ borderRadius: 3, px: 4, py: 1.5 }}
          >
            טען עוד
          </Button>
        </Box>
      )} */}
    </Box>
  );
}

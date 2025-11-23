"use client";

import { GetAllProjectsByUserId } from "@/app/lib/server/projectServer";
import { IProject } from "@/app/models/types";
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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import FolderIcon from "@mui/icons-material/Folder";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CircleIcon from "@mui/icons-material/Circle";

// הצבע הראשי של המערכת (טורקיז) - נשאר עבור האלמנטים האחרים
const MAIN_COLOR = "#3dd2cc";

// רשימת צבעים רק עבור הנקודה הקטנה
const DOT_COLORS = [
  "#ff9f43", // כתום
  "#5f27cd", // סגול
  "#ff6b6b", // אדום עדין
  "#48dbfb", // תכלת
  "#1dd1a1", // ירוק
  "#f368e0", // ורוד
  "#fab1a0", // קורל
];

// פונקציה שבוחרת צבע לנקודה לפי ה-ID
const getDotColor = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash % DOT_COLORS.length);
  return DOT_COLORS[index];
};
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
    async function fetchProjects() {
      try {
        const response = await GetAllProjectsByUserId(userId!);
console.log("response in get all projects", response);

        if (response?.status !== "success") {
          console.error("Error fetching projects:", response?.message);
          setProjects([]);
          return;
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
    <Box sx={{ minHeight: "100vh", backgroundColor: "backgroun.default", py: 5 }}>
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

          {/* הכפתור החדש בעיצוב Outlined */}
          <Button
            variant="outlined" 
            startIcon={<AddIcon />}
            onClick={() => router.push("/pages/createProject")}
            sx={{
              color: "#0f3460", // צבע טקסט כחול כהה
              borderColor: "#0f3460", // צבע מסגרת כחול כהה
              backgroundColor: "white",
              borderWidth: "1.5px", // מסגרת קצת יותר עבה שיראה טוב
              fontWeight: 700,
              px: 3,
              py: 1,
              borderRadius: "10px", // פינות מעוגלות כמו בתמונה
              "&:hover": { 
                backgroundColor: "#f0f2f5", // רקע אפרפר בהיר במעבר עכבר
                borderColor: "#0f3460",
                borderWidth: "1.5px"
              },
            }}
          >
            Create New Project
          </Button>
        </Box>

        {/* Grid Layout */}
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
            {projects.map((project: IProject) => {
              // רק הנקודה מקבלת צבע ייחודי
              const dotColor = getDotColor(project._id || "default");

              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={project._id} sx={{ display: 'flex' }}>
                  <Card
                    elevation={0}
                    onClick={() => getIntoProject(project)}
                    sx={{
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      borderRadius: 4,
                      border: "1px solid #edf2f7",
                      transition: "all 0.2s ease-in-out",
                      cursor: "pointer",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: "0 12px 20px rgba(0,0,0,0.05)",
                        borderColor: MAIN_COLOR, // Border בטורקיז
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3, flexGrow: 1 }}>
                      {/* Top Row: Folder Icon (Turquoise) & Unique Dot */}
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2, alignItems: "center" }}>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: "12px",
                            backgroundColor: "rgba(61, 210, 204, 0.1)", // רקע טורקיז בהיר מאוד
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                           <FolderIcon sx={{ color: MAIN_COLOR, fontSize: 28 }} />
                          <Typography
                            variant="h6"
                            fontWeight={700}
                            color="text.primary"
                            sx={{ mr: 2 }}
                          >
                            {project.name}
                          </Typography>

                          {/* החץ בשורה העליונה */}
                          <IconButton
                            onClick={() => getIntoProject(project)}
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
                                project._id!,
                                project.name,
                                project.description!
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
                        
                        {/* הנקודה הצבעונית המשתנה */}
                        <CircleIcon sx={{ fontSize: 14, color: dotColor }} />
                      </Box>

                      {/* Title */}
                      <Typography
                        variant="h6"
                        fontWeight={700}
                        gutterBottom
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {project.name}
                      </Typography>

                      {/* Description */}
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          wordBreak: "break-word",
                          minHeight: "4.5em", // שומר על גובה אחיד
                          lineHeight: 1.5,
                        }}
                      >
                        {project.description || "No description available."}
                      </Typography>
                    </CardContent>

                    {/* Footer: View Project (Turquoise) */}
                    <Box sx={{ p: 3, pt: 0, display: 'flex', justifyContent: 'flex-end' }}>
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          color: MAIN_COLOR, 
                          fontWeight: 700, 
                          fontSize: '0.875rem',
                          gap: 0.5,
                          transition: 'gap 0.2s',
                          "&:hover": {
                             gap: 1 // אפקט קטן שהחץ זז הצידה
                          }
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
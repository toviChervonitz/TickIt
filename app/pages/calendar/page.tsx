"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Calendar, dateFnsLocalizer, Event as RBCEvent, View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS, he } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import useAppStore from "@/app/store/useAppStore";
import { Types } from "mongoose";
import { ITask, IProject } from "@/app/models/types";
import { useLanguage } from "@/app/context/LanguageContext";
import { getTranslation } from "@/app/lib/i18n";
import ShowTask from "@/app/components/ShowTask";
import {
  Box,
  Typography,
  Chip,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Stack,
  Fade,
  Slide,
  useTheme,
  alpha,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { TransitionProps } from "@mui/material/transitions";

/* ---------------- Helpers ---------------- */

function getProjectKey(projectId?: Types.ObjectId | IProject | string): string {
  if (!projectId) return "Default";
  if (typeof projectId === "string") return projectId;
  if (projectId instanceof Types.ObjectId) return projectId.toString();
  if ("_id" in projectId && projectId._id) return projectId._id;
  return "Default";
}

function getProjectName(projectId?: Types.ObjectId | IProject | string): string {
  if (!projectId) return "Default";
  if (typeof projectId === "string") return "Default";
  if (projectId instanceof Types.ObjectId) return "Default";
  if ("name" in projectId && projectId.name) return projectId.name;
  return "Default";
}

function getProjectColor(projectId?: Types.ObjectId | IProject | string): string {
  if (!projectId) return "#888";
  if (typeof projectId !== "string" && !(projectId instanceof Types.ObjectId)) {
    return (projectId as any).color || "#888";
  }
  return "#888";
}

/* ---------------- Transition for Dialog ---------------- */
const SlideTransition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

/* ---------------- Calendar Page ---------------- */

export default function CalendarPage() {
  const { lang } = useLanguage();
  const t = getTranslation();
  const theme = useTheme();

  const { user, tasks, setTasks } = useAppStore();
  const [selectedTask, setSelectedTask] = useState<ITask | null>(null);
  const [loading, setLoading] = useState(true);

  const [today] = useState(() => new Date());
  const [view, setView] = useState<View>("month");
  const [date, setDate] = useState<Date>(today);

  // --- Dynamic localizer based on language ---
  const localesMap = { en: enUS, he };
  const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
    getDay,
    locales: { [lang]: localesMap[lang] },
  });

  /* ------------ Load tasks ---------------- */
  useEffect(() => {
    let isMounted = true;

    async function loadTasks() {
      if (!user?._id) {
        setLoading(false);
        return;
      }

      if (!tasks || tasks.length === 0) {
        try {
          const { GetTasksByUserId } = await import("@/app/lib/server/taskServer");
          const fetchedTasks = await GetTasksByUserId(user._id);
          if (isMounted) setTasks(fetchedTasks);
        } catch (err) {
          console.error("Failed to fetch tasks:", err);
        } finally {
          if (isMounted) setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }

    loadTasks();
    return () => {
      isMounted = false;
    };
  }, [user, tasks, setTasks]);

  /* ------------ Calendar Events ---------------- */
  const events: RBCEvent[] = useMemo(() => {
    return (tasks || []).map((task) => {
      const isCompleted = task.status === "done" || !!task.completedDate;
      const start = task.dueDate ? new Date(task.dueDate) : today;
      const end = task.dueDate ? new Date(task.dueDate) : today;

      return {
        title: task.title,
        start,
        end,
        allDay: true,
        resource: { task },
        style: {
          backgroundColor: isCompleted
            ? "#A9A9A9"
            : getProjectColor(task.projectId),
          color: "#fff",
          opacity: isCompleted ? 0.5 : 1,
          borderRadius: 8,
          padding: "4px 8px",
          border: "none",
        } as any,
      };
    });
  }, [tasks, today]);

  /* ------------ Project Legend ---------------- */
  const projectLegend = useMemo(() => {
    const unique: Record<string, { name: string; color: string }> = {};

    (tasks || []).forEach((t) => {
      const key = getProjectKey(t.projectId);
      if (!unique[key]) {
        unique[key] = {
          name: getProjectName(t.projectId),
          color: getProjectColor(t.projectId),
        };
      }
    });

    return Object.entries(unique).map(([key, val]) => ({
      key,
      name: val.name,
      color: val.color,
    }));
  }, [tasks]);

  if (loading) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
      >
        <Typography color="text.secondary">
          {t("loadingTasks")}
        </Typography>
      </Box>
    );
  }

  if (!user?._id) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
      >
        <Typography color="text.secondary">
          {t("loadingUser")}
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <style jsx global>{`
        /* Custom Calendar Styles with MUI theme */
        .rbc-calendar {
          font-family: ${theme.typography.fontFamily};
        }

        .rbc-header {
          padding: 16px 8px;
          font-weight: 600;
          font-size: 14px;
          color: ${theme.palette.text.primary};
          border-bottom: 2px solid ${theme.palette.divider};
          background: ${alpha(theme.palette.primary.main, 0.05)};
        }

        .rbc-today {
          background-color: ${alpha(theme.palette.primary.main, 0.08)};
        }

        .rbc-off-range-bg {
          background-color: ${theme.palette.action.hover};
        }

        .rbc-event {
          font-size: 13px;
          font-weight: 500;
          box-shadow: ${theme.shadows[2]};
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .rbc-event:hover {
          transform: translateY(-2px);
          box-shadow: ${theme.shadows[4]};
        }

        .rbc-toolbar {
          margin-bottom: 24px;
          padding: 16px;
          background: ${alpha(theme.palette.background.paper, 0.6)};
          border-radius: 12px;
          border: 1px solid ${theme.palette.divider};
        }

        .rbc-toolbar button {
          padding: 8px 16px;
          border-radius: 8px;
          border: 1px solid ${theme.palette.divider};
          background: ${theme.palette.background.paper};
          color: ${theme.palette.text.primary};
          font-weight: 500;
          transition: all 0.2s;
          font-family: ${theme.typography.fontFamily};
        }

        .rbc-toolbar button:hover {
          background: ${theme.palette.action.hover};
          border-color: ${theme.palette.primary.main};
        }

        .rbc-toolbar button.rbc-active {
          background: ${theme.palette.primary.main};
          color: ${theme.palette.primary.contrastText};
          border-color: ${theme.palette.primary.main};
        }

        .rbc-month-view, .rbc-time-view, .rbc-agenda-view {
          border: 1px solid ${theme.palette.divider};
          border-radius: 12px;
          overflow: hidden;
          background: ${theme.palette.background.paper};
        }

        .rbc-date-cell {
          padding: 8px;
          text-align: ${lang === "he" ? "left" : "right"};
        }

        .rbc-date-cell.rbc-now {
          font-weight: 700;
          color: ${theme.palette.primary.main};
        }

        .rbc-day-bg + .rbc-day-bg {
          border-${lang === "he" ? "right" : "left"}: 1px solid ${theme.palette.divider};
        }
      `}</style>

      <Box
        dir={lang === "he" ? "rtl" : "ltr"}
        sx={{ p: 3, maxWidth: 1400, mx: "auto" }}
      >
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
            <CalendarMonthIcon sx={{ fontSize: 36, color: "primary.main" }} />
            <Typography fontWeight="bold" color="text.primary">
              {t("yourCalendar")}
            </Typography>
          </Stack>
          <Typography variant="body1" color="text.secondary">
            {lang === "he"
              ? "נהל את המשימות שלך בצורה ויזואלית"
              : "Manage your tasks visually"}
          </Typography>
        </Box>

        {/* Legend */}
        {projectLegend.length > 0 && (
          <Paper
            elevation={2}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 3,
              border: 1,
              borderColor: "divider",
            }}
          >
            <Typography
              variant="subtitle2"
              fontWeight="bold"
              color="text.secondary"
              sx={{ mb: 2 }}
            >
              {lang === "he" ? "פרויקטים" : "Projects"}
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={1.5}>
              {projectLegend.map((p) => (
                <Chip
                  key={p.key}
                  label={p.name}
                  sx={{
                    bgcolor: alpha(p.color, 0.15),
                    color: p.color,
                    fontWeight: 600,
                    border: 1,
                    borderColor: alpha(p.color, 0.3),
                    "& .MuiChip-label": {
                      px: 2,
                    },
                  }}
                  icon={
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        bgcolor: p.color,
                        ml: lang === "he" ? 0 : 1,
                        mr: lang === "he" ? 1 : 0,
                      }}
                    />
                  }
                />
              ))}
            </Stack>
          </Paper>
        )}

        {/* Calendar */}
        <Paper
          elevation={3}
          sx={{
            p: 3,
            borderRadius: 3,
            border: 1,
            borderColor: "divider",
          }}
        >
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 650 }}
            messages={t("messages") as any}
            culture={lang}
            eventPropGetter={(e: any) => ({ style: e.style })}
            onSelectEvent={(e) => setSelectedTask(e.resource.task)}
            view={view}
            onView={(newView) => setView(newView)}
            date={date}
            onNavigate={(newDate) => setDate(newDate)}
          />
        </Paper>
      </Box>

      {selectedTask && (
        <ShowTask
          open={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          task={selectedTask}
        />
      )}
    </>
  );
}
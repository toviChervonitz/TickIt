"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Calendar, dateFnsLocalizer, Event as RBCEvent, View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS, he } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import useAppStore from "@/app/store/useAppStore";
import { Types } from "mongoose";
import { ITask, IProject } from "@/app/models/types";
import { getTranslation } from "@/app/lib/i18n";
import ShowTask from "@/app/components/ShowTask";
import {
  Box,
  Typography,
  Chip,
  Paper,
  Stack,
  Slide,
  useTheme,
  alpha,
} from "@mui/material";


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
  console.log(projectId);

  if (!projectId) return "#888";
  if (typeof projectId !== "string" && !(projectId instanceof Types.ObjectId)) {
    return (projectId as any).color || "#888";
  }
  return "#888";
}


export default function CalendarPage() {
  const t = getTranslation();
  const theme = useTheme();

  const { user, tasks, setTasks, language } = useAppStore();
  const [selectedTask, setSelectedTask] = useState<ITask | null>(null);
  const [loading, setLoading] = useState(true);

  const [today] = useState(() => new Date());
  const [view, setView] = useState<View>("month");
  const [date, setDate] = useState<Date>(today);

  const localesMap = { en: enUS, he };
  const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
    getDay,
    locales: { [language]: localesMap[language] },
  });

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

  const events: RBCEvent[] = useMemo(() => {
    return (tasks || []).map((task) => {
      const isCompleted = task.status === "done" && !!task.completedDate;
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
          background-color: ${alpha(theme.palette.secondary.main, 0.22)};
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
          padding: 4px 20px;
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
          text-align: ${language === "he" ? "left" : "right"};
        }

        .rbc-date-cell.rbc-now {
          font-weight: 700;
          color: ${theme.palette.primary.main};
        }

        .rbc-day-bg + .rbc-day-bg {
          border-${language === "he" ? "right" : "left"}: 1px solid ${theme.palette.divider};
        }
        /* Fix toolbar button rounding for RTL */
:global([dir='rtl'] .rbc-toolbar button) {
  border-radius: 0; /* reset all */
}

:global([dir='rtl'] .rbc-toolbar button:first-child) {
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
}

:global([dir='rtl'] .rbc-toolbar button:last-child) {
  border-top-left-radius: 8px;
  border-bottom-left-radius: 8px;
}

      `}</style>

      <Box
        dir={language === "he" ? "rtl" : "ltr"}
        sx={{ p: 3, maxWidth: 1400, mx: "auto" }}
      >

        {/* Calendar */}
        <Paper
          elevation={3}
          sx={{
            p: 3,
            borderRadius: 3,
            border: 1,
            borderColor: "background.default",
            backgroundColor: "background.default",
          }}
        >
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 650 }}
            messages={t("messages") as any}
            culture={language}
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
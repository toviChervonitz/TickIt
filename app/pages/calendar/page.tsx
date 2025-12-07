
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Calendar, dateFnsLocalizer, Event as RBCEvent, View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS, he } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import useAppStore from "@/app/store/useAppStore";
import Task from "@/app/components/Task";
import { Types } from "mongoose";
import { ITask, IProject } from "@/app/models/types";
import { useLanguage } from "@/app/context/LanguageContext";
import { getTranslation } from "@/app/lib/i18n";
import ShowTask from "@/app/components/ShowTask";

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

/* ---------------- Calendar Page ---------------- */

export default function CalendarPage() {
  const { lang } = useLanguage();
  const t = getTranslation();

  const { user, tasks, setTasks } = useAppStore();
  const [selectedTask, setSelectedTask] = useState<ITask | null>(null);
  const [loading, setLoading] = useState(true);
  const modalRef = useRef<HTMLDivElement | null>(null);

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

  /* ------------ Modal close on outside click ------------- */
  useEffect(() => {
    if (!selectedTask) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setSelectedTask(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedTask]);

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
          borderRadius: 5,
          padding: 2,
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

  if (loading) return <div>{t("loadingTasks")}</div>;
  if (!user?._id) return <div>{t("loadingUser")}</div>;

  return (
    <div
      dir={lang === "he" ? "rtl" : "ltr"}
      style={{ padding: 16, fontFamily: "Arial, sans-serif" }}
    >
      <h1 style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>
        {t("yourCalendar")}
      </h1>

      {/* Legend */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {projectLegend.map((p) => (
          <div key={p.key}>
            <span
              style={{
                backgroundColor: p.color,
                color: "#fff",
                padding: "2px 6px",
                borderRadius: 4,
                fontSize: 12,
                whiteSpace: "nowrap",
                display: "inline-block",
              }}
            >
              {p.name}
            </span>
          </div>
        ))}
      </div>

      {/* Calendar */}
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        messages={t("messages") as any} // <-- this is key
        culture={lang} // <-- this tells the calendar which locale to use

        eventPropGetter={(e: any) => ({ style: e.style })}
        onSelectEvent={(e) => setSelectedTask(e.resource.task)}
        view={view}
        onView={(newView) => setView(newView)}
        date={date}
        onNavigate={(newDate) => setDate(newDate)}
      />

      {/* Modal */}
      {selectedTask && (
        <>
          <div
            onClick={() => setSelectedTask(null)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0,0,0,0.5)",
              zIndex: 9998,
            }}
          />
          <div
            ref={modalRef}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              backgroundColor: "white",
              padding: 20,
              borderRadius: 10,
              zIndex: 9999,
            }}
          >
            <ShowTask
              open={!!selectedTask}
              onClose={() => setSelectedTask(null)}
              task={selectedTask}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
              <button
                style={{ padding: "8px 12px", borderRadius: 6 }}
                onClick={() => setSelectedTask(null)}
              >
                {t("close")}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

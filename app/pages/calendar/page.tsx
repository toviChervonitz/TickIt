"use client";

import React, { useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer, Event as RBCEvent } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";
import useAppStore from "@/app/store/useAppStore";
import { ITask, IProject } from "@/app/models/types";
import { Types } from "mongoose";
import Task from "@/app/components/Task";

const locales = { "en-US": require("date-fns/locale/en-US") };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

const palette = [
  "#FF5733",
  "#33C1FF",
  "#33FF57",
  "#FFC300",
  "#FF33D1",
  "#8A33FF",
  "#33FFF6",
];

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

function generateHSLColor(index: number, total: number): string {
  const hue = (index * 360) / total;
  return `hsl(${hue}, 70%, 50%)`;
}

export default function CalendarPage() {
  const { tasks } = useAppStore();
  const [selectedTask, setSelectedTask] = useState<ITask | null>(null);

  // Map each project to a color
  const projectColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    const uniqueProjectKeys = Array.from(
      new Set(tasks?.map((task) => getProjectKey(task.projectId)))
    );

    uniqueProjectKeys.forEach((key, index) => {
      if (index < palette.length) {
        map[key] = palette[index];
      } else {
        map[key] = generateHSLColor(index, uniqueProjectKeys.length);
      }
    });

    return map;
  }, [tasks]);

  // Prepare events for the calendar
  const events: RBCEvent[] = useMemo(() => {
    if (!tasks) return [];

    return tasks.map((task) => {
      const key = getProjectKey(task.projectId);
      const isCompleted = task.status === "done" || !!task.completedDate;

      return {
        title: task.title,
        start: task.dueDate ? new Date(task.dueDate) : new Date(),
        end: task.dueDate ? new Date(task.dueDate) : new Date(),
        allDay: true,
        resource: { task },
        style: {
          backgroundColor: isCompleted ? "#A9A9A9" : projectColorMap[key],
          color: "#fff",
          opacity: isCompleted ? 0.5 : 1,
          borderRadius: "5px",
          border: "none",
          padding: "2px",
        },
      };
    });
  }, [tasks, projectColorMap]);

  const eventStyleGetter = (event: any) => ({ style: event.style });

  const handleSelectEvent = (event: any) => {
    console.log("Event clicked:", event);
    if (event.resource && event.resource.task) {
      setSelectedTask(event.resource.task);
      console.log("Task selected:", event.resource.task);
    }
  };

  const projectLegend = useMemo(() => {
    return Object.entries(projectColorMap).map(([key, color]) => {
      const task = tasks.find((t) => getProjectKey(t.projectId) === key);
      const name = task ? getProjectName(task.projectId) : "Default";
      return { key, name, color };
    });
  }, [projectColorMap, tasks]);

  return (
    <div style={{ padding: "16px", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "16px" }}>Your Calendar</h1>

      {/* Project Legend */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
        {projectLegend.map((p) => (
          <div key={p.key} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <div style={{ width: 20, height: 20, backgroundColor: p.color }} />
            <span>{p.name}</span>
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
        eventPropGetter={eventStyleGetter}
        onSelectEvent={handleSelectEvent}
      />

      {/* Task Modal */}
      {selectedTask && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
          onClick={() => setSelectedTask(null)}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "10px",
              minWidth: "300px",
              maxWidth: "500px",
              opacity: selectedTask.status === "done" ? 0.5 : 1,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Task
              _id={selectedTask._id!}
              title={selectedTask.title}
              content={selectedTask.content}
              status={selectedTask.status}
              dueDate={selectedTask.dueDate}
              userId={
                selectedTask.userId
                  ? typeof selectedTask.userId === "object" && "_id" in selectedTask.userId
                    ? (selectedTask.userId._id as string)
                    : selectedTask.userId.toString()
                  : "unknown"
              }
              userName={
                selectedTask.userId && typeof selectedTask.userId === "object" && "name" in selectedTask.userId
                  ? selectedTask.userId.name
                  : "Unknown"
              }
              projectName={getProjectName(selectedTask.projectId)}
              showButtons={false}
            />
            <button
              style={{
                marginTop: "16px",
                padding: "8px 12px",
                backgroundColor: "#007BFF",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
              onClick={() => setSelectedTask(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

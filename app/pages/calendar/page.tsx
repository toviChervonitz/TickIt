
// "use client";

// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { Calendar, dateFnsLocalizer, Event as RBCEvent } from "react-big-calendar";
// import { format, parse, startOfWeek, getDay } from "date-fns";
// import "react-big-calendar/lib/css/react-big-calendar.css";
// import useAppStore from "@/app/store/useAppStore";
// import Task from "@/app/components/Task";
// import { Types } from "mongoose";
// import { ITask, IProject } from "@/app/models/types";
// import { GetTasksByUserId } from "@/app/lib/server/taskServer";

// const locales = { "en-US": require("date-fns/locale/en-US") };

// const localizer = dateFnsLocalizer({
//   format,
//   parse,
//   startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
//   getDay,
//   locales,
// });

// const palette = ["#FF5733", "#33C1FF", "#33FF57", "#FFC300", "#FF33D1", "#8A33FF", "#33FFF6"];

// function getProjectKey(projectId?: Types.ObjectId | IProject | string): string {
//   if (!projectId) return "Default";
//   if (typeof projectId === "string") return projectId;
//   if (projectId instanceof Types.ObjectId) return projectId.toString();
//   if ("_id" in projectId && projectId._id) return projectId._id;
//   return "Default";
// }

// function getProjectName(projectId?: Types.ObjectId | IProject | string): string {
//   if (!projectId) return "Default";
//   if (typeof projectId === "string") return "Default";
//   if (projectId instanceof Types.ObjectId) return "Default";
//   if ("name" in projectId && projectId.name) return projectId.name;
//   return "Default";
// }

// function generateHSLColor(index: number, total: number): string {
//   const hue = (index * 360) / total;
//   return `hsl(${hue}, 70%, 50%)`;
// }

// export default function CalendarPage() {
//   const { user, tasks, setTasks } = useAppStore();
//   const [selectedTask, setSelectedTask] = useState<ITask | null>(null);
//   const [loading, setLoading] = useState(true);
//   const modalRef = useRef<HTMLDivElement | null>(null);

//   // --- Debug logs ---
//   console.log("User from store:", user);
//   console.log("Tasks from store:", tasks);

//   // --- Fetch tasks from server if store is empty ---
//   useEffect(() => {
//     async function loadTasks() {
//       if (user?._id && (!tasks || tasks.length === 0)) {
//         console.log("Fetching tasks from server for user:", user._id);
//         setLoading(true);
//         try {
//           const fetchedTasks = await GetTasksByUserId(user._id);
//           console.log("Fetched tasks:", fetchedTasks);
//           setTasks(fetchedTasks);
//         } catch (err) {
//           console.error("Failed to fetch tasks:", err);
//         } finally {
//           setLoading(false);
//         }
//       } else {
//         setLoading(false);
//       }
//     }
//     loadTasks();
//   }, [user, tasks, setTasks]);

//   // --- Close modal on outside click ---
//   useEffect(() => {
//     if (!selectedTask) return;

//     const handleClickOutside = (e: MouseEvent) => {
//       if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
//         console.log("Click outside modal -> closing");
//         setSelectedTask(null);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, [selectedTask]);

//   // --- Project color mapping ---
//   const projectColorMap = useMemo(() => {
//     const map: Record<string, string> = {};
//     const keys = Array.from(new Set((tasks || []).map((t) => getProjectKey(t.projectId))));
//     keys.forEach((key, i) => {
//       map[key] = i < palette.length ? palette[i] : generateHSLColor(i, keys.length);
//     });
//     return map;
//   }, [tasks]);

//   // --- Calendar events ---
//   const events: RBCEvent[] = useMemo(() => {
//     return (tasks || []).map((task) => {
//       const key = getProjectKey(task.projectId);
//       const isCompleted = task.status === "done" || !!task.completedDate;
//       const start = task.dueDate ? new Date(task.dueDate) : new Date();
//       const end = task.dueDate ? new Date(task.dueDate) : new Date();
//       return {
//         title: task.title,
//         start,
//         end,
//         allDay: true,
//         resource: { task },
//         style: {
//           backgroundColor: isCompleted ? "#A9A9A9" : projectColorMap[key],
//           color: "#fff",
//           opacity: isCompleted ? 0.5 : 1,
//           borderRadius: 5,
//           padding: 2,
//         } as any,
//       };
//     });
//   }, [tasks, projectColorMap]);

//   const projectLegend = useMemo(() => {
//     return Object.entries(projectColorMap).map(([key, color]) => {
//       const t = (tasks || []).find((x) => getProjectKey(x.projectId) === key);
//       const name = getProjectName(t?.projectId);
//       return { key, name, color };
//     });
//   }, [tasks, projectColorMap]);

//   if (loading) return <div>Loading tasks...</div>;
//   if (!user?._id) return <div>Loading user...</div>;

//   return (
//     <div style={{ padding: 16, fontFamily: "Arial, sans-serif" }}>
//       <h1 style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>Your Calendar</h1>

//       {/* Project legend */}
//       <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
//         {projectLegend.map((p) => (
//           <div key={p.key} style={{ display: "flex", alignItems: "center", gap: 4 }}>
//             <div style={{ width: 20, height: 20, backgroundColor: p.color }} />
//             <span>{p.name}</span>
//           </div>
//         ))}
//       </div>

//       {/* Calendar */}
//       <Calendar
//         localizer={localizer}
//         events={events}
//         startAccessor="start"
//         endAccessor="end"
//         style={{ height: 600 }}
// eventPropGetter={(e: any) => ({ style: e.style })}
//         onSelectEvent={(e) => {
//           console.log("Event clicked:", e.resource.task);
//           setSelectedTask(e.resource.task);
//         }}
//       />

//       {/* Task Modal */}
//       {selectedTask && (
//         <>
//           {/* Dimmer */}
//           <div
//             onClick={() => {
//               console.log("Dimmer clicked -> closing modal");
//               setSelectedTask(null);
//             }}
//             style={{
//               position: "fixed",
//               top: 0,
//               left: 0,
//               width: "100%",
//               height: "100%",
//               backgroundColor: "rgba(0,0,0,0.5)",
//               zIndex: 9998,
//             }}
//           />

//           {/* Modal content */}
//           <div
//             ref={modalRef}
//             style={{
//               position: "fixed",
//               top: "50%",
//               left: "50%",
//               transform: "translate(-50%,-50%)",
//               backgroundColor: "white",
//               padding: 20,
//               borderRadius: 10,
//               zIndex: 9999,
//             }}
//           >
//             <Task
//               _id={selectedTask._id!}
//               title={selectedTask.title}
//               content={selectedTask.content}
//               status={selectedTask.status}
//               dueDate={selectedTask.dueDate}
//               userId={
//                 selectedTask.userId
//                   ? typeof selectedTask.userId === "object" && "_id" in selectedTask.userId
//                     ? (selectedTask.userId._id as string)
//                     : selectedTask.userId.toString()
//                   : user._id
//               }
//               userName={
//                 selectedTask.userId && typeof selectedTask.userId === "object" && "name" in selectedTask.userId
//                   ? selectedTask.userId.name
//                   : user.name ?? "Unknown"
//               }
//               projectName={getProjectName(selectedTask.projectId)}
//               showButtons={true}
//             />
//             <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
//               <button
//                 style={{ padding: "8px 12px", borderRadius: 6 }}
//                 onClick={() => {
//                   console.log("Close button clicked");
//                   setSelectedTask(null);
//                 }}
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Calendar, dateFnsLocalizer, Event as RBCEvent, View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";
import useAppStore from "@/app/store/useAppStore";
import Task from "@/app/components/Task";
import { Types } from "mongoose";
import { ITask, IProject } from "@/app/models/types";

const locales = { "en-US": require("date-fns/locale/en-US") };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

const palette = ["#FF5733", "#33C1FF", "#33FF57", "#FFC300", "#FF33D1", "#8A33FF", "#33FFF6"];

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
  const { user, tasks, setTasks } = useAppStore();
  const [selectedTask, setSelectedTask] = useState<ITask | null>(null);
  const [loading, setLoading] = useState(true);
  const modalRef = useRef<HTMLDivElement | null>(null);

  // --- Stable "today" date ---
  const [today] = useState(() => new Date());

  // --- Controlled calendar state ---
  const [view, setView] = useState<View>("month");
  const [date, setDate] = useState<Date>(today);

  // --- Fetch tasks ---
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
          console.log("Fetching tasks for user:", user._id);
          const fetchedTasks = await GetTasksByUserId(user._id);
          console.log("Fetched tasks:", fetchedTasks);
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

  // --- Close modal on outside click ---
  useEffect(() => {
    if (!selectedTask) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        console.log("Click outside modal -> closing");
        setSelectedTask(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedTask]);

  // --- Project color mapping ---
  const projectColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    const keys = Array.from(new Set((tasks || []).map((t) => getProjectKey(t.projectId))));
    keys.forEach((key, i) => {
      map[key] = i < palette.length ? palette[i] : generateHSLColor(i, keys.length);
    });
    return map;
  }, [tasks]);

  // --- Calendar events ---
  const events: RBCEvent[] = useMemo(() => {
    return (tasks || []).map((task) => {
      const key = getProjectKey(task.projectId);
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
          backgroundColor: isCompleted ? "#A9A9A9" : projectColorMap[key],
          color: "#fff",
          opacity: isCompleted ? 0.5 : 1,
          borderRadius: 5,
          padding: 2,
        } as any,
      };
    });
  }, [tasks, projectColorMap, today]);

  const projectLegend = useMemo(() => {
    return Object.entries(projectColorMap).map(([key, color]) => {
      const t = (tasks || []).find((x) => getProjectKey(x.projectId) === key);
      const name = getProjectName(t?.projectId);
      return { key, name, color };
    });
  }, [tasks, projectColorMap]);

  if (loading) return <div>Loading tasks...</div>;
  if (!user?._id) return <div>Loading user...</div>;

  return (
    <div style={{ padding: 16, fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>Your Calendar</h1>

      {/* Project legend */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {projectLegend.map((p) => (
          <div key={p.key} style={{ display: "flex", alignItems: "center", gap: 4 }}>
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
        eventPropGetter={(e: any) => ({ style: e.style })}
        onSelectEvent={(e) => {
          console.log("Event clicked:", e.resource.task);
          setSelectedTask(e.resource.task);
        }}
        view={view}
        onView={(newView) => setView(newView)}     // 👈 handle view changes
        date={date}
        onNavigate={(newDate) => setDate(newDate)} // 👈 handle navigation
      />

      {/* Task Modal */}
      {selectedTask && (
        <>
          {/* Dimmer */}
          <div
            onClick={() => {
              console.log("Dimmer clicked -> closing modal");
              setSelectedTask(null);
            }}
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

          {/* Modal content */}
          <div
            ref={modalRef}
            onClick={(e) => e.stopPropagation()} // prevent dimmer click
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
                  : user._id
              }
              userName={
                selectedTask.userId && typeof selectedTask.userId === "object" && "name" in selectedTask.userId
                  ? selectedTask.userId.name
                  : user.name ?? "Unknown"
              }
              projectName={getProjectName(selectedTask.projectId)}
              showButtons={true}
            />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
              <button
                style={{ padding: "8px 12px", borderRadius: 6 }}
                onClick={() => {
                  console.log("Close button clicked");
                  setSelectedTask(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
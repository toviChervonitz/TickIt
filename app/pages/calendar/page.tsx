// "use client";

// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { Calendar, dateFnsLocalizer, Event as RBCEvent } from "react-big-calendar";
// import { format, parse, startOfWeek, getDay } from "date-fns";
// import "react-big-calendar/lib/css/react-big-calendar.css";
// import useAppStore from "@/app/store/useAppStore";
// import { ITask, IProject } from "@/app/models/types";
// import { Types } from "mongoose";
// import Task from "@/app/components/Task";

// const locales = { "en-US": require("date-fns/locale/en-US") };

// const localizer = dateFnsLocalizer({
//   format,
//   parse,
//   startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
//   getDay,
//   locales,
// });

// const palette = [
//   "#FF5733",
//   "#33C1FF",
//   "#33FF57",
//   "#FFC300",
//   "#FF33D1",
//   "#8A33FF",
//   "#33FFF6",
// ];

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
//   const { tasks } = useAppStore();
//   const [selectedTask, setSelectedTask] = useState<ITask | null>(null);
//   const modalRef = useRef<HTMLDivElement | null>(null);

//   // Close modal when clicking outside (document-level)
//   useEffect(() => {
//     if (!selectedTask) return;

//     function onMouseDown(e: MouseEvent) {
//       const target = e.target as Node | null;
//       if (modalRef.current && target && !modalRef.current.contains(target)) {
//         // click was outside the modal -> close
//         setSelectedTask(null);
//       }
//     }

//     document.addEventListener("mousedown", onMouseDown);
//     return () => document.removeEventListener("mousedown", onMouseDown);
//   }, [selectedTask]);

//   // Map each project to a color
//   const projectColorMap = useMemo(() => {
//     const map: Record<string, string> = {};
//     const uniqueProjectKeys = Array.from(
//       new Set((tasks || []).map((task) => getProjectKey(task.projectId)))
//     );

//     uniqueProjectKeys.forEach((key, index) => {
//       if (index < palette.length) {
//         map[key] = palette[index];
//       } else {
//         map[key] = generateHSLColor(index, uniqueProjectKeys.length);
//       }
//     });

//     return map;
//   }, [tasks]);

//   // Prepare events
//   const events: RBCEvent[] = useMemo(() => {
//     if (!tasks) return [];

//     return tasks.map((task) => {
//       const key = getProjectKey(task.projectId);
//       const isCompleted = task.status === "done" || !!task.completedDate;

//       return {
//         title: task.title,
//         start: task.dueDate ? new Date(task.dueDate) : new Date(),
//         end: task.dueDate ? new Date(task.dueDate) : new Date(),
//         allDay: true,
//         resource: { task },
//         style: {
//           backgroundColor: isCompleted ? "#A9A9A9" : projectColorMap[key],
//           color: "#fff",
//           opacity: isCompleted ? 0.5 : 1,
//           borderRadius: "5px",
//           border: "none",
//           padding: "2px",
//         },
//       };
//     });
//   }, [tasks, projectColorMap]);

//   const eventStyleGetter = (event: any) => ({ style: event.style });

//   const handleSelectEvent = (event: any) => {
//     const task = event?.resource?.task;
//     if (!task) return;
//     // optional: prevent re-opening same selected task repeatedly
//     if (selectedTask?._id === task._id) return;
//     setSelectedTask(task);
//   };

//   const projectLegend = useMemo(() => {
//     return Object.entries(projectColorMap).map(([key, color]) => {
//       const task = (tasks || []).find((t) => getProjectKey(t.projectId) === key);
//       const name = task ? getProjectName(task.projectId) : "Default";
//       return { key, name, color };
//     });
//   }, [projectColorMap, tasks]);

//   return (
//     <div style={{ padding: "16px", fontFamily: "Arial, sans-serif" }}>
//       <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "16px" }}>
//         Your Calendar
//       </h1>

//       {/* Project Legend */}
//       <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
//         {projectLegend.map((p) => (
//           <div key={p.key} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
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
//         eventPropGetter={eventStyleGetter}
//         onSelectEvent={handleSelectEvent}
//       />

//       {/* Task Modal */}
//       {selectedTask !== null && (
//         <>
//           {/* visual dim — does NOT capture pointer events so toolbar stays clickable */}
//           <div
//             aria-hidden
//             style={{
//               position: "fixed",
//               top: 0,
//               left: 0,
//               width: "100%",
//               height: "100%",
//               backgroundColor: "rgba(0,0,0,0.5)",
//               zIndex: 9998, // behind the modal
//               pointerEvents: "none", // important: allow clicks to pass through
//             }}
//           />

//           {/* actual modal content */}
//           <div
//             ref={modalRef}
//             role="dialog"
//             aria-modal="true"
//             style={{
//               position: "fixed",
//               top: "50%",
//               left: "50%",
//               transform: "translate(-50%, -50%)",
//               zIndex: 9999,
//               backgroundColor: "white",
//               padding: "20px",
//               borderRadius: "10px",
//               minWidth: "300px",
//               maxWidth: "500px",
//               opacity: selectedTask.status === "done" ? 0.85 : 1,
//               boxShadow: "0 6px 24px rgba(0,0,0,0.2)",
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
//                   : "unknown"
//               }
//               userName={
//                 selectedTask.userId && typeof selectedTask.userId === "object" && "name" in selectedTask.userId
//                   ? selectedTask.userId.name
//                   : "Unknown"
//               }
//               projectName={getProjectName(selectedTask.projectId)}
//               showButtons={false}
//             />

//             <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
//               <button
//                 style={{
//                   padding: "8px 12px",
//                   backgroundColor: "#e0e0e0",
//                   border: "none",
//                   borderRadius: 6,
//                   cursor: "pointer",
//                 }}
//                 onClick={() => setSelectedTask(null)}
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
  const modalRef = useRef<HTMLDivElement | null>(null);

  // --- FIXED CLICK-OUTSIDE HANDLER ---
  useEffect(() => {
    if (!selectedTask) return;

    function onMouseDown(e: MouseEvent) {
      const target = e.target as Node | null;

      // If click is inside the modal → ignore
      if (modalRef.current && modalRef.current.contains(target)) return;

      // Otherwise close
      setSelectedTask(null);
    }

    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [selectedTask]);

  const projectColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    const uniqueProjectKeys = Array.from(
      new Set((tasks || []).map((task) => getProjectKey(task.projectId)))
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
    const task = event?.resource?.task;
    if (!task) return;
    if (selectedTask?._id === task._id) return;
    setSelectedTask(task);
  };

  const projectLegend = useMemo(() => {
    return Object.entries(projectColorMap).map(([key, color]) => {
      const task = (tasks || []).find((t) => getProjectKey(t.projectId) === key);
      const name = getProjectName(task?.projectId);
      return { key, name, color };
    });
  }, [projectColorMap, tasks]);

  return (
    <div style={{ padding: "16px", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "16px" }}>
        Your Calendar
      </h1>

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
      {selectedTask !== null && (
        <>
          {/* Dimmer */}
          <div
            aria-hidden
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

          {/* Modal */}
          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 9999,
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "10px",
              minWidth: "300px",
              maxWidth: "500px",
              opacity: selectedTask.status === "done" ? 0.85 : 1,
              boxShadow: "0 6px 24px rgba(0,0,0,0.2)",
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
                  : "unknown"
              }
              userName={
                selectedTask.userId &&
                typeof selectedTask.userId === "object" &&
                "name" in selectedTask.userId
                  ? selectedTask.userId.name
                  : "Unknown"
              }
              projectName={getProjectName(selectedTask.projectId)}
              showButtons={true} 
            />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
              <button
                style={{
                  padding: "8px 12px",
                  backgroundColor: "#e0e0e0",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
                onClick={() => setSelectedTask(null)}
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

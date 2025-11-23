// import React, { useMemo, useState } from "react";
// import {
//   LineChart,
//   Line,
//   CartesianGrid,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";
// import { ITask } from "../../models/types";
// interface TaskCompletionChartProps {
//   tasks: ITask[];
// }

// type Range = "day" | "week" | "month";

// const TaskCompletionChart: React.FC<TaskCompletionChartProps> = ({ tasks }) => {
//   const [range, setRange] = useState<Range>("day");

//   console.log("📌 Incoming tasks: ", tasks);
//   console.log("📌 Current selected range: ", range);

//   const formatDate = (date: string | Date) => {
//     const d = new Date(date);
//     return d.toISOString().split("T")[0];
//   };

//   const getWeekStart = (date: Date) => {
//     const d = new Date(date);
//     const diff = d.getDate() - d.getDay();
//     const weekStart = new Date(d.setDate(diff));
//     return weekStart.toISOString().split("T")[0];
//   };

//   const getMonthStart = (date: Date) => {
//     const d = new Date(date);
//     return `${d.getFullYear()}-${("0" + (d.getMonth() + 1)).slice(-2)}-01`;
//   };

//   const groupedData = useMemo(() => {
//     console.log("🔄 Recomputing chart data for range:", range);

//     const filtered = tasks.filter((t) => t.status === "done" && t.completedDate);
//     console.log("✅ Filtered DONE tasks:", filtered);

//     const map = new Map<string, number>();

//     filtered.forEach((task) => {
//       const completed = new Date(task.completedDate!);
//       let key = "";

//       if (range === "day") key = formatDate(completed);
//       else if (range === "week") key = getWeekStart(completed);
//       else if (range === "month") key = getMonthStart(completed);

//       console.log(`📅 Task '${task.title}' completed on`, completed, "→ bucket:", key);

//       map.set(key, (map.get(key) || 0) + 1);
//     });

//     const result = Array.from(map, ([date, count]) => ({ date, count })).sort(
//       (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
//     );

//     console.log("📊 Final grouped data: ", result);

//     return result;
//   }, [tasks, range]);

//   return (
//     <div className="w-full p-4 bg-white rounded-xl shadow">
//       <div className="flex gap-4 mb-4">
//         <button
//           onClick={() => setRange("day")}
//           className={`px-3 py-1 rounded ${range === "day" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
//         >
//           Daily
//         </button>
//         <button
//           onClick={() => setRange("week")}
//           className={`px-3 py-1 rounded ${range === "week" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
//         >
//           Weekly
//         </button>
//         <button
//           onClick={() => setRange("month")}
//           className={`px-3 py-1 rounded ${range === "month" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
//         >
//           Monthly
//         </button>
//       </div>

//       <ResponsiveContainer width="100%" height={300}>
//         <LineChart data={groupedData}>
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis dataKey="date" />
//           <YAxis allowDecimals={false} />
//           <Tooltip />
//           <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={3} />
//         </LineChart>
//       </ResponsiveContainer>
//     </div>
//   );
// };

// export default TaskCompletionChart;
"use client";

import React, { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ITask } from "../../models/types";

interface TaskCompletionChartProps {
  tasks: ITask[];
}

type Range = "day" | "week" | "month";

const TaskCompletionChart: React.FC<TaskCompletionChartProps> = ({ tasks }) => {
  const [range, setRange] = useState<Range>("day");

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    return d.toISOString().split("T")[0];
  };

  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const diff = d.getDate() - d.getDay();
    const weekStart = new Date(d.setDate(diff));
    return weekStart.toISOString().split("T")[0];
  };

  const getMonthStart = (date: Date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${("0" + (d.getMonth() + 1)).slice(-2)}-01`;
  };

  const groupedData = useMemo(() => {
    const filtered = tasks.filter((t) => t.status === "done" && t.completedDate);

    const map = new Map<string, number>();

    filtered.forEach((task) => {
      const completed = new Date(task.completedDate!);

      let key = "";
      if (range === "day") key = formatDate(completed);
      else if (range === "week") key = getWeekStart(completed);
      else if (range === "month") key = getMonthStart(completed);

      map.set(key, (map.get(key) || 0) + 1);
    });

    return Array.from(map, ([date, count]) => ({ date, count })).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [tasks, range]);

  return (
    <div
      className="w-full p-4 bg-white rounded-xl shadow"
      style={{ pointerEvents: "auto" }}      // 🟢 FIX HERE
    >
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setRange("day")}
          className={`px-3 py-1 rounded ${range === "day" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          Daily
        </button>
        <button
          onClick={() => setRange("week")}
          className={`px-3 py-1 rounded ${range === "week" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          Weekly
        </button>
        <button
          onClick={() => setRange("month")}
          className={`px-3 py-1 rounded ${range === "month" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          Monthly
        </button>
      </div>

      <ResponsiveContainer width="100%" height={300} style={{ pointerEvents: "auto" }}>
        <LineChart data={groupedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TaskCompletionChart;
